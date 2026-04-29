from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session, joinedload

from app.api.deps import current_user
from app.core.database import get_db
from app.models import Order, OrderItem, OrderStatus, OrderStatusHistory, User, UserAddress
from app.schemas.shop import OrderCreate, OrderRead
from app.services.serializers import order_to_read

from .common import dump_address, get_or_create_cart


router = APIRouter()


@router.post("/orders", response_model=OrderRead, status_code=status.HTTP_201_CREATED)
def create_order(payload: OrderCreate, db: Session = Depends(get_db), user: User = Depends(current_user)) -> OrderRead:
    cart = get_or_create_cart(db, user.id)
    if not cart.items:
        raise HTTPException(status_code=400, detail="Cart is empty")
    status_row = db.scalar(select(OrderStatus).where(OrderStatus.name == "создан"))
    if not status_row:
        status_row = db.scalar(select(OrderStatus).where(OrderStatus.name == "created"))
    address_data = payload.address.model_dump()
    address = UserAddress(user_id=user.id, **address_data)
    db.add(address)
    db.flush()
    subtotal = sum(item.quantity * item.unit_price_cents for item in cart.items)
    total = max(0, subtotal + payload.shipping_cents - payload.discount_cents)
    order = Order(
        user_id=user.id,
        user_address_id=address.id,
        order_status_id=status_row.id if status_row else None,
        address=dump_address(address_data),
        subtotal_cents=subtotal,
        shipping_cents=payload.shipping_cents,
        discount_cents=payload.discount_cents,
        total_cents=total,
    )
    db.add(order)
    db.flush()
    for item in cart.items:
        db.add(
            OrderItem(
                order_id=order.id,
                product_id=item.product_id,
                product_name_snapshot=item.product.name,
                unit_price_cents_snapshot=item.unit_price_cents,
                quantity=item.quantity,
                line_total_cents=item.quantity * item.unit_price_cents,
            )
        )
        db.delete(item)
    if status_row:
        db.add(OrderStatusHistory(order_id=order.id, changed_by_user=user.id, new_status_id=status_row.id, note="Заказ создан"))
    db.commit()
    order = db.execute(
        select(Order).where(Order.id == order.id).options(joinedload(Order.status), joinedload(Order.items))
    ).unique().scalar_one()
    return order_to_read(order)


@router.get("/orders", response_model=list[OrderRead])
def list_orders(db: Session = Depends(get_db), user: User = Depends(current_user)) -> list[OrderRead]:
    rows = db.scalars(
        select(Order)
        .where(Order.user_id == user.id)
        .options(joinedload(Order.status), joinedload(Order.items))
        .order_by(Order.created_at.desc())
    ).unique().all()
    return [order_to_read(row) for row in rows]
