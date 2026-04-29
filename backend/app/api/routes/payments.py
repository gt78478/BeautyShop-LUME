from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.deps import current_user
from app.core.database import get_db
from app.models import Order, Payment, User
from app.schemas.shop import PaymentCreate, PaymentRead


router = APIRouter()


@router.post("/payments/create", response_model=PaymentRead, status_code=status.HTTP_201_CREATED)
def create_payment(payload: PaymentCreate, db: Session = Depends(get_db), user: User = Depends(current_user)) -> PaymentRead:
    order = db.scalar(select(Order).where(Order.id == payload.order_id, Order.user_id == user.id))
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    payment = Payment(
        order_id=order.id,
        provider=payload.provider,
        status="создан",
        amount_cents=order.total_cents,
        provider_payment_id=f"demo-{order.id}",
    )
    db.add(payment)
    db.commit()
    db.refresh(payment)
    return PaymentRead(
        id=payment.id,
        order_id=payment.order_id,
        provider=payment.provider,
        status=payment.status,
        amount_cents=payment.amount_cents,
        checkout_url=f"https://pay.example.test/{payment.provider_payment_id}",
    )


@router.post("/payments/webhook")
def payment_webhook(payload: dict) -> dict:
    return {"received": True, "payload": payload}
