from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.security import hash_password
from app.models import Brand, Category, OrderStatus, Product, ProductImage, ShipmentStatus, User


PRODUCTS = [
    ("Serum vitamina C Andes", "Skincare", "Lumina", 1899000, 25, "Brightening serum for daily glow.", "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=900&q=80"),
    ("Crema hidratante Maqui", "Skincare", "Botanika", 1499000, 31, "Light face cream with Chilean maqui extract.", "https://images.unsplash.com/photo-1556228578-8c89e6adf883?auto=format&fit=crop&w=900&q=80"),
    ("Protector solar mineral SPF50", "Sun care", "Costa", 1299000, 42, "Mineral sunscreen, no white cast.", "https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?auto=format&fit=crop&w=900&q=80"),
    ("Tinta labial Carmesi", "Makeup", "Lume", 899000, 60, "Long-wear lip tint with satin finish.", "https://images.unsplash.com/photo-1586495777744-4413f21062fa?auto=format&fit=crop&w=900&q=80"),
    ("Aceite capilar Palta", "Hair", "Raiz", 1099000, 18, "Nourishing avocado hair oil.", "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=900&q=80"),
    ("Mascarilla arcilla rosa", "Skincare", "Atacama", 1199000, 22, "Gentle clay mask for balanced skin.", "https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=900&q=80"),
]


def seed_database(db: Session) -> None:
    if db.scalar(select(Product.id).limit(1)):
        return

    categories = {name: Category(name=name) for name in sorted({item[1] for item in PRODUCTS})}
    brands = {name: Brand(name=name) for name in sorted({item[2] for item in PRODUCTS})}
    db.add_all([*categories.values(), *brands.values()])
    db.add_all([OrderStatus(name=name) for name in ("created", "paid", "packed", "shipped", "delivered", "cancelled")])
    db.add_all([ShipmentStatus(name=name) for name in ("pending", "in_transit", "delivered", "returned")])
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

