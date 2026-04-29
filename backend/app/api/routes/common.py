import json

from sqlalchemy import select
from sqlalchemy.orm import Session, joinedload

from app.models import Brand, Cart, CartItem, Category, Product


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


def dump_address(data: dict) -> str:
    return json.dumps(data, ensure_ascii=True)
