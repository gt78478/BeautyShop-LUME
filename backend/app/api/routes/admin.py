from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import func, select
from sqlalchemy.orm import Session, joinedload

from app.api.deps import admin_user
from app.core.database import get_db
from app.models import (
    CartItem,
    Category,
    Order,
    OrderItem,
    OrderStatus,
    OrderStatusHistory,
    Product,
    ProductImage,
    Review,
    User,
    WishlistItem,
)
from app.schemas.shop import OrderRead, OrderStatusUpdate, ProductCreate, ProductRead, ProductUpdate, UserRead
from app.services.serializers import order_to_read, product_to_read

from .common import get_or_create_brand, get_or_create_category


router = APIRouter()


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

    brand = get_or_create_brand(db, payload.brand)
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
        existing = db.scalar(
            select(ProductImage).where(ProductImage.product_id == product.id).order_by(ProductImage.sort_order)
        )
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
    order = db.execute(
        select(Order).where(Order.id == order.id).options(joinedload(Order.status), joinedload(Order.items))
    ).unique().scalar_one()
    return order_to_read(order)
