from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.deps import current_user
from app.core.database import get_db
from app.models import Product, User, WishlistItem


router = APIRouter()


@router.post("/wishlist/{product_id}", status_code=status.HTTP_201_CREATED)
def add_wishlist(product_id: int, db: Session = Depends(get_db), user: User = Depends(current_user)) -> dict:
    if not db.get(Product, product_id):
        raise HTTPException(status_code=404, detail="Product not found")
    existing = db.scalar(select(WishlistItem).where(WishlistItem.user_id == user.id, WishlistItem.product_id == product_id))
    if not existing:
        db.add(WishlistItem(user_id=user.id, product_id=product_id))
        db.commit()
    return {"ok": True}
