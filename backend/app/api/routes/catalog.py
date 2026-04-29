from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import func, or_, select
from sqlalchemy.orm import Session, joinedload

from app.core.database import get_db
from app.models import Brand, Category, Product
from app.schemas.shop import ProductList, ProductRead
from app.services.serializers import product_to_read


router = APIRouter()


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
    stmt = select(Product).where(Product.is_active.is_(True)).options(
        joinedload(Product.category),
        joinedload(Product.brand),
        joinedload(Product.images),
    )
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
    rows = db.scalars(
        stmt.order_by(Product.created_at.desc()).offset((page - 1) * page_size).limit(page_size)
    ).unique().all()
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
