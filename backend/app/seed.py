from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.security import hash_password
from app.models import Brand, Category, OrderStatus, Product, ProductImage, ShipmentStatus, User


PRODUCTS = [
    ("Сыворотка с витамином C Андес", "Уход за кожей", "Люмина", 1899000, 25, "Осветляющая сыворотка для ежедневного сияния кожи.", "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=900&q=80"),
    ("Увлажняющий крем Маки", "Уход за кожей", "Ботаника", 1499000, 31, "Легкий крем для лица с экстрактом чилийской ягоды маки.", "https://images.unsplash.com/photo-1556228578-8c89e6adf883?auto=format&fit=crop&w=900&q=80"),
    ("Минеральный солнцезащитный крем SPF50", "Солнцезащита", "Коста", 1299000, 42, "Минеральная защита от солнца без белого налета.", "https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?auto=format&fit=crop&w=900&q=80"),
    ("Тинт для губ Кармеси", "Макияж", "Люме", 899000, 60, "Стойкий тинт для губ с сатиновым финишем.", "https://images.unsplash.com/photo-1586495777744-4413f21062fa?auto=format&fit=crop&w=900&q=80"),
    ("Масло для волос с авокадо", "Уход за волосами", "Раис", 1099000, 18, "Питательное масло для волос с маслом авокадо.", "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=900&q=80"),
    ("Маска с розовой глиной", "Уход за кожей", "Атакама", 1199000, 22, "Мягкая глиняная маска для ровного тона кожи.", "https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=900&q=80"),
]

OLD_PRODUCT_NAMES = [
    "Serum vitamina C Andes",
    "Crema hidratante Maqui",
    "Protector solar mineral SPF50",
    "Tinta labial Carmesi",
    "Aceite capilar Palta",
    "Mascarilla arcilla rosa",
]

ORDER_STATUS_TRANSLATIONS = {
    "created": "создан",
    "paid": "оплачен",
    "packed": "собран",
    "shipped": "отправлен",
    "delivered": "доставлен",
    "cancelled": "отменен",
}

SHIPMENT_STATUS_TRANSLATIONS = {
    "pending": "ожидает отправки",
    "in_transit": "в пути",
    "delivered": "доставлен",
    "returned": "возвращен",
}


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


def localize_existing_seed(db: Session) -> None:
    changed = False

    for old, new in ORDER_STATUS_TRANSLATIONS.items():
        row = db.scalar(select(OrderStatus).where(OrderStatus.name == old))
        if row:
            row.name = new
            changed = True

    for old, new in SHIPMENT_STATUS_TRANSLATIONS.items():
        row = db.scalar(select(ShipmentStatus).where(ShipmentStatus.name == old))
        if row:
            row.name = new
            changed = True

    for old_name, product_data in zip(OLD_PRODUCT_NAMES, PRODUCTS, strict=False):
        product = db.scalar(select(Product).where(Product.name == old_name))
        if not product:
            continue
        name, category_name, brand_name, price, amount, description, image_url = product_data
        product.name = name
        product.category_id = get_or_create_category(db, category_name).id
        product.brand_id = get_or_create_brand(db, brand_name).id
        product.price_cents = price
        product.amount = amount
        product.description = description
        image = db.scalar(select(ProductImage).where(ProductImage.product_id == product.id).order_by(ProductImage.sort_order))
        if image:
            image.image_path = image_url
        else:
            db.add(ProductImage(product_id=product.id, image_path=image_url, sort_order=0))
        changed = True

    if changed:
        db.commit()


def seed_database(db: Session) -> None:
    if db.scalar(select(Product.id).limit(1)):
        localize_existing_seed(db)
        return

    categories = {name: Category(name=name) for name in sorted({item[1] for item in PRODUCTS})}
    brands = {name: Brand(name=name) for name in sorted({item[2] for item in PRODUCTS})}
    db.add_all([*categories.values(), *brands.values()])
    db.add_all([OrderStatus(name=name) for name in ("создан", "оплачен", "собран", "отправлен", "доставлен", "отменен")])
    db.add_all([ShipmentStatus(name=name) for name in ("ожидает отправки", "в пути", "доставлен", "возвращен")])
    db.add(User(email="admin@beautyshop.cl", password_hash=hash_password("admin123"), role="admin"))
    db.add(User(email="demo@beautyshop.cl", password_hash=hash_password("demo1234"), role="customer"))
    db.flush()

    for name, category, brand, price, amount, description, image_url in PRODUCTS:
        product = Product(
            name=name,
            category_id=categories[category].id,
            brand_id=brands[brand].id,
            description=description,
            price_cents=price,
            amount=amount,
        )
        db.add(product)
        db.flush()
        db.add(ProductImage(product_id=product.id, image_path=image_url, sort_order=0))
    db.commit()
