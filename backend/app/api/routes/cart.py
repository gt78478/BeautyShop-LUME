from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import current_user
from app.core.database import get_db
from app.models import CartItem, Product, User
from app.schemas.shop import CartItemCreate, CartRead
from app.services.serializers import cart_to_read

from .common import get_or_create_cart


router = APIRouter()


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
        db.add(
            CartItem(
                cart_id=cart.id,
                product_id=product.id,
                quantity=payload.quantity,
                unit_price_cents=product.price_cents,
            )
        )
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
