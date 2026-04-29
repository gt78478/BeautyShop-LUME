from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import current_user
from app.core.database import get_db
from app.models import Product, Review, User
from app.schemas.shop import ReviewCreate, ReviewRead


router = APIRouter()


@router.post("/reviews", response_model=ReviewRead, status_code=status.HTTP_201_CREATED)
def create_review(payload: ReviewCreate, db: Session = Depends(get_db), user: User = Depends(current_user)) -> Review:
    if not db.get(Product, payload.product_id):
        raise HTTPException(status_code=404, detail="Product not found")
    review = Review(user_id=user.id, product_id=payload.product_id, rating=payload.rating, body=payload.body)
    db.add(review)
    db.commit()
    db.refresh(review)
    return review
