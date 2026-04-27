# Самый большой файл. В нём все API-запросы backend
import json
from sqlalchemy import func, or_, select
from sqlalchemy.orm import Session, joinedload

from fastapi import APIRouter, Depends, HTTPException, Query, status

from app.api.deps import admin_user, current_user
from app.core.database import get_db
from app.core.security import create_access_token, create_refresh_token, decode_token, hash_password, verify_password
from app.models import (
    Brand,
    Cart,
    CartItem,
    Category,
    Order,
    OrderItem,
    OrderStatus,
    OrderStatusHistory,
    Payment,
    Product,
    ProductImage,
    Review,
    User,
    UserAddress,
    WishlistItem,
)
from app.schemas.shop import (
    CartItemCreate,
    CartRead,
    LoginRequest,
    OrderCreate,
    OrderRead,
    OrderStatusUpdate,
    PaymentCreate,
    PaymentRead,
    ProductCreate,
    ProductList,
    ProductRead,
    ProductUpdate,
    RegisterRequest,
    ReviewCreate,
    ReviewRead,
    TokenPair,
    UserRead,
)
from app.services.serializers import cart_to_read, order_to_read, product_to_read


router = APIRouter()


def get_or_create_cart(db: Session, user_id: int) -> Cart:
    stmt = select(Cart).where(Cart.user_id == user_id).options(
        joinedload(Cart.items).joinedload(CartItem.product).joinedload(Product.category),
        joinedload(Cart.items).joinedload(CartItem.product).joinedload(Product.brand),
        joinedload(Cart.items).joinedload(CartItem.product).joinedload(Product.images),
    )
    cart = db.execute(stmt).unique().scalar_one_or_none()
    if cart:
        return cart
    cart = Cart(user_id=user_id)
    db.add(cart)
    db.commit()
    db.refresh(cart)
    return cart


@router.post("/auth/register", response_model=TokenPair, status_code=status.HTTP_201_CREATED)
def register(payload: RegisterRequest, db: Session = Depends(get_db)) -> TokenPair:
    if db.scalar(select(User).where(User.email == payload.email)):
        raise HTTPException(status_code=409, detail="Почта уже зарегистрирована")
    user = User(email=payload.email, password_hash=hash_password(payload.password), role="customer")
    db.add(user)
    db.commit()
    db.refresh(user)
    return TokenPair(access_token=create_access_token(str(user.id)), refresh_token=create_refresh_token(str(user.id)))


@router.post("/auth/login", response_model=TokenPair)
def login(payload: LoginRequest, db: Session = Depends(get_db)) -> TokenPair:
    user = db.scalar(select(User).where(User.email == payload.email))
    if not user or not verify_password(payload.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    return TokenPair(access_token=create_access_token(str(user.id)), refresh_token=create_refresh_token(str(user.id)))


@router.post("/auth/refresh", response_model=TokenPair)
def refresh(refresh_token: str) -> TokenPair:
    try:
        payload = decode_token(refresh_token)
    except ValueError as exc:
        raise HTTPException(status_code=401, detail="Invalid token") from exc
    if payload.get("type") != "refresh":
        raise HTTPException(status_code=401, detail="Invalid token type")
    return TokenPair(access_token=create_access_token(payload["sub"]), refresh_token=create_refresh_token(payload["sub"]))


@router.get("/users/me", response_model=UserRead)
def me(user: User = Depends(current_user)) -> User:
    return user


@router.get("/products", response_model=ProductList)
def products(
    db: Session = Depends(get_db),
    q: str | None = Query(default=None),
    category: str | None = Query(default=None),
    brand: str | None = Query(default=None),
    min_price: int | None = Query(default=None, ge=0),
    max_price: int | None = Query(default=None, ge=0),
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=12, ge=1, le=50),
) -> ProductList:
    stmt = select(Product).where(Product.is_active.is_(True)).options(joinedload(Product.category), joinedload(Product.brand), joinedload(Product.images))
    count_stmt = select(func.count(Product.id)).where(Product.is_active.is_(True))
    filters = []
    if q:
        filters.append(or_(Product.name.ilike(f"%{q}%"), Product.description.ilike(f"%{q}%")))
    if category:
        stmt = stmt.join(Product.category)
        count_stmt = count_stmt.join(Product.category)
        filters.append(Category.name == category)
    if brand:
        stmt = stmt.join(Product.brand)
        count_stmt = count_stmt.join(Product.brand)
        filters.append(Brand.name == brand)
    if min_price is not None:
        filters.append(Product.price_cents >= min_price)
    if max_price is not None:
        filters.append(Product.price_cents <= max_price)
    for item in filters:
        stmt = stmt.where(item)
        count_stmt = count_stmt.where(item)
    total = db.scalar(count_stmt) or 0
    rows = db.scalars(stmt.order_by(Product.created_at.desc()).offset((page - 1) * page_size).limit(page_size)).unique().all()
    return ProductList(items=[product_to_read(row) for row in rows], total=total, page=page, page_size=page_size)


@router.get("/products/{product_id}", response_model=ProductRead)
def product(product_id: int, db: Session = Depends(get_db)) -> ProductRead:
    row = db.execute(
        select(Product)
        .where(Product.id == product_id)
        .options(joinedload(Product.category), joinedload(Product.brand), joinedload(Product.images))
    ).unique().scalar_one_or_none()
    if not row:
        raise HTTPException(status_code=404, detail="Product not found")
    return product_to_read(row)


@router.get("/catalog/meta")
def catalog_meta(db: Session = Depends(get_db)) -> dict:
    return {
        "categories": [item.name for item in db.scalars(select(Category).order_by(Category.name))],
        "brands": [item.name for item in db.scalars(select(Brand).order_by(Brand.name))],
    }


@router.get("/cart", response_model=CartRead)
def get_cart(db: Session = Depends(get_db), user: User = Depends(current_user)) -> CartRead:
    return cart_to_read(get_or_create_cart(db, user.id))


@router.post("/cart/items", response_model=CartRead, status_code=status.HTTP_201_CREATED)
def add_cart_item(payload: CartItemCreate, db: Session = Depends(get_db), user: User = Depends(current_user)) -> CartRead:
    product = db.get(Product, payload.product_id)
    if not product or not product.is_active:
        raise HTTPException(status_code=404, detail="Product not found")
    cart = get_or_create_cart(db, user.id)
    existing = next((item for item in cart.items if item.product_id == product.id), None)
    if existing:
        existing.quantity += payload.quantity
    else:
        db.add(CartItem(cart_id=cart.id, product_id=product.id, quantity=payload.quantity, unit_price_cents=product.price_cents))
    db.commit()
    return cart_to_read(get_or_create_cart(db, user.id))


@router.delete("/cart/items/{item_id}", response_model=CartRead)
def delete_cart_item(item_id: int, db: Session = Depends(get_db), user: User = Depends(current_user)) -> CartRead:
    cart = get_or_create_cart(db, user.id)
    item = next((row for row in cart.items if row.id == item_id), None)
    if not item:
        raise HTTPException(status_code=404, detail="Cart item not found")
    db.delete(item)
    db.commit()
    return cart_to_read(get_or_create_cart(db, user.id))


@router.post("/orders", response_model=OrderRead, status_code=status.HTTP_201_CREATED)
def create_order(payload: OrderCreate, db: Session = Depends(get_db), user: User = Depends(current_user)) -> OrderRead:
    cart = get_or_create_cart(db, user.id)
    if not cart.items:
        raise HTTPException(status_code=400, detail="Cart is empty")
    status_row = db.scalar(select(OrderStatus).where(OrderStatus.name == "создан"))
    if not status_row:
        status_row = db.scalar(select(OrderStatus).where(OrderStatus.name == "created"))
    address = UserAddress(user_id=user.id, **payload.address.model_dump())
    db.add(address)
    db.flush()
    subtotal = sum(item.quantity * item.unit_price_cents for item in cart.items)
    total = max(0, subtotal + payload.shipping_cents - payload.discount_cents)
    order = Order(
        user_id=user.id,
        user_address_id=address.id,
        order_status_id=status_row.id if status_row else None,
        address=json.dumps(payload.address.model_dump(), ensure_ascii=True),
        subtotal_cents=subtotal,
        shipping_cents=payload.shipping_cents,
        discount_cents=payload.discount_cents,
        total_cents=total,
    )
    db.add(order)
    db.flush()
    for item in cart.items:
        db.add(OrderItem(order_id=order.id, product_id=item.product_id, product_name_snapshot=item.product.name, unit_price_cents_snapshot=item.unit_price_cents, quantity=item.quantity, line_total_cents=item.quantity * item.unit_price_cents))
        db.delete(item)
    if status_row:
        db.add(OrderStatusHistory(order_id=order.id, changed_by_user=user.id, new_status_id=status_row.id, note="Заказ создан"))
    db.commit()
    order = db.execute(select(Order).where(Order.id == order.id).options(joinedload(Order.status), joinedload(Order.items))).unique().scalar_one()
    return order_to_read(order)


@router.get("/orders", response_model=list[OrderRead])
def list_orders(db: Session = Depends(get_db), user: User = Depends(current_user)) -> list[OrderRead]:
    rows = db.scalars(select(Order).where(Order.user_id == user.id).options(joinedload(Order.status), joinedload(Order.items)).order_by(Order.created_at.desc())).unique().all()
    return [order_to_read(row) for row in rows]


@router.post("/payments/create", response_model=PaymentRead, status_code=status.HTTP_201_CREATED)
def create_payment(payload: PaymentCreate, db: Session = Depends(get_db), user: User = Depends(current_user)) -> PaymentRead:
    order = db.scalar(select(Order).where(Order.id == payload.order_id, Order.user_id == user.id))
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    payment = Payment(order_id=order.id, provider=payload.provider, status="создан", amount_cents=order.total_cents, provider_payment_id=f"demo-{order.id}")
    db.add(payment)
    db.commit()
    db.refresh(payment)
    return PaymentRead(id=payment.id, order_id=payment.order_id, provider=payment.provider, status=payment.status, amount_cents=payment.amount_cents, checkout_url=f"https://pay.example.test/{payment.provider_payment_id}")


@router.post("/payments/webhook")
def payment_webhook(payload: dict) -> dict:
    return {"received": True, "payload": payload}


@router.post("/wishlist/{product_id}", status_code=status.HTTP_201_CREATED)
def add_wishlist(product_id: int, db: Session = Depends(get_db), user: User = Depends(current_user)) -> dict:
    if not db.get(Product, product_id):
        raise HTTPException(status_code=404, detail="Product not found")
    existing = db.scalar(select(WishlistItem).where(WishlistItem.user_id == user.id, WishlistItem.product_id == product_id))
    if not existing:
        db.add(WishlistItem(user_id=user.id, product_id=product_id))
        db.commit()
    return {"ok": True}


@router.post("/reviews", response_model=ReviewRead, status_code=status.HTTP_201_CREATED)
def create_review(payload: ReviewCreate, db: Session = Depends(get_db), user: User = Depends(current_user)) -> Review:
    if not db.get(Product, payload.product_id):
        raise HTTPException(status_code=404, detail="Product not found")
    review = Review(user_id=user.id, product_id=payload.product_id, rating=payload.rating, body=payload.body)
    db.add(review)
    db.commit()
    db.refresh(review)
    return review


@router.get("/admin/dashboard")
def dashboard(db: Session = Depends(get_db), _: User = Depends(admin_user)) -> dict:
    revenue = db.scalar(select(func.coalesce(func.sum(Order.total_cents), 0))) or 0
    active_products = db.scalar(select(func.count(Product.id)).where(Product.is_active.is_(True))) or 0
    hidden_products = db.scalar(select(func.count(Product.id)).where(Product.is_active.is_(False))) or 0
    low_stock = db.scalar(select(func.count(Product.id)).where(Product.is_active.is_(True), Product.amount <= 5)) or 0
    return {
        "users": db.scalar(select(func.count(User.id))) or 0,
        "products": db.scalar(select(func.count(Product.id))) or 0,
        "active_products": active_products,
        "hidden_products": hidden_products,
        "low_stock": low_stock,
        "orders": db.scalar(select(func.count(Order.id))) or 0,
        "revenue_cents": revenue,
    }


@router.get("/admin/products", response_model=list[ProductRead])
def admin_products(db: Session = Depends(get_db), _: User = Depends(admin_user)) -> list[ProductRead]:
    rows = db.scalars(
        select(Product)
        .options(joinedload(Product.category), joinedload(Product.brand), joinedload(Product.images))
        .order_by(Product.is_active.desc(), Product.created_at.desc())
    ).unique().all()
    return [product_to_read(row) for row in rows]


@router.post("/admin/products", response_model=ProductRead, status_code=status.HTTP_201_CREATED)
def create_product(payload: ProductCreate, db: Session = Depends(get_db), _: User = Depends(admin_user)) -> ProductRead:
    category = db.scalar(select(Category).where(Category.name == payload.category))
    if not category:
        category = Category(name=payload.category)
        db.add(category)
        db.flush()

    brand = db.scalar(select(Brand).where(Brand.name == payload.brand))
    if not brand:
        brand = Brand(name=payload.brand)
        db.add(brand)
        db.flush()

    product = Product(
        name=payload.name,
        category_id=category.id,
        brand_id=brand.id,
        description=payload.description,
        amount=payload.amount,
        price_cents=payload.price_cents,
        is_active=True,
    )
    db.add(product)
    db.flush()

    if payload.image_url:
        db.add(ProductImage(product_id=product.id, image_path=payload.image_url, sort_order=0))

    db.commit()
    product = db.execute(
        select(Product)
        .where(Product.id == product.id)
        .options(joinedload(Product.category), joinedload(Product.brand), joinedload(Product.images))
    ).unique().scalar_one()
    return product_to_read(product)


def get_or_create_category(db: Session, name: str) -> Category:
    category = db.scalar(select(Category).where(Category.name == name))
    if category:
        return category
    category = Category(name=name)
    db.add(category)
    db.flush()
    return category


def get_or_create_brand(db: Session, name: str) -> Brand:
    brand = db.scalar(select(Brand).where(Brand.name == name))
    if brand:
        return brand
    brand = Brand(name=name)
    db.add(brand)
    db.flush()
    return brand


@router.patch("/admin/products/{product_id}", response_model=ProductRead)
def update_product(product_id: int, payload: ProductUpdate, db: Session = Depends(get_db), _: User = Depends(admin_user)) -> ProductRead:
    product = db.get(Product, product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    data = payload.model_dump(exclude_unset=True)
    if "name" in data:
        product.name = data["name"]
    if "description" in data:
        product.description = data["description"]
    if "amount" in data:
        product.amount = data["amount"]
    if "price_cents" in data:
        product.price_cents = data["price_cents"]
    if "is_active" in data:
        product.is_active = data["is_active"]
    if data.get("category"):
        product.category_id = get_or_create_category(db, data["category"]).id
    if data.get("brand"):
        product.brand_id = get_or_create_brand(db, data["brand"]).id
    if "image_url" in data:
        existing = db.scalar(select(ProductImage).where(ProductImage.product_id == product.id).order_by(ProductImage.sort_order))
        if data["image_url"]:
            if existing:
                existing.image_path = data["image_url"]
            else:
                db.add(ProductImage(product_id=product.id, image_path=data["image_url"], sort_order=0))
        elif existing:
            db.delete(existing)

    db.commit()
    product = db.execute(
        select(Product)
        .where(Product.id == product.id)
        .options(joinedload(Product.category), joinedload(Product.brand), joinedload(Product.images))
    ).unique().scalar_one()
    return product_to_read(product)


@router.delete("/admin/products/{product_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_product(product_id: int, db: Session = Depends(get_db), _: User = Depends(admin_user)) -> None:
    product = db.get(Product, product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    for cart_item in db.scalars(select(CartItem).where(CartItem.product_id == product_id)).all():
        db.delete(cart_item)
    for wishlist_item in db.scalars(select(WishlistItem).where(WishlistItem.product_id == product_id)).all():
        db.delete(wishlist_item)
    for review in db.scalars(select(Review).where(Review.product_id == product_id)).all():
        db.delete(review)
    for order_item in db.scalars(select(OrderItem).where(OrderItem.product_id == product_id)).all():
        order_item.product_id = None
    db.delete(product)
    db.commit()


@router.get("/admin/users", response_model=list[UserRead])
def admin_users(db: Session = Depends(get_db), _: User = Depends(admin_user)) -> list[User]:
    return list(db.scalars(select(User).order_by(User.id.desc())).all())


@router.get("/admin/orders", response_model=list[OrderRead])
def admin_orders(db: Session = Depends(get_db), _: User = Depends(admin_user)) -> list[OrderRead]:
    rows = db.scalars(
        select(Order)
        .options(joinedload(Order.status), joinedload(Order.items))
        .order_by(Order.created_at.desc())
    ).unique().all()
    return [order_to_read(row) for row in rows]


@router.get("/admin/order-statuses")
def admin_order_statuses(db: Session = Depends(get_db), _: User = Depends(admin_user)) -> dict:
    return {"items": [row.name for row in db.scalars(select(OrderStatus).order_by(OrderStatus.id)).all()]}


@router.patch("/admin/orders/{order_id}/status", response_model=OrderRead)
def update_order_status(
    order_id: int,
    payload: OrderStatusUpdate,
    db: Session = Depends(get_db),
    user: User = Depends(admin_user),
) -> OrderRead:
    order = db.execute(
        select(Order)
        .where(Order.id == order_id)
        .options(joinedload(Order.status), joinedload(Order.items))
    ).unique().scalar_one_or_none()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    new_status = db.scalar(select(OrderStatus).where(OrderStatus.name == payload.status))
    if not new_status:
        raise HTTPException(status_code=400, detail="Unknown order status")
    old_status_id = order.order_status_id
    order.order_status_id = new_status.id
    db.add(
        OrderStatusHistory(
            order_id=order.id,
            changed_by_user=user.id,
            old_status_id=old_status_id,
            new_status_id=new_status.id,
            note="Admin status update",
        )
    )
    db.commit()
    order = db.execute(select(Order).where(Order.id == order.id).options(joinedload(Order.status), joinedload(Order.items))).unique().scalar_one()
    return order_to_read(order)
