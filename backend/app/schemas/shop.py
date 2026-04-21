from datetime import datetime

from pydantic import BaseModel, ConfigDict, EmailStr, Field


class TokenPair(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class RegisterRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=6)


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class UserRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    email: EmailStr
    role: str
    is_active: bool


class CategoryRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str


class BrandRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str


class ProductRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    description: str | None
    amount: int
    price_cents: int
    category: CategoryRead | None = None
    brand: BrandRead | None = None
    image_url: str | None = None


class ProductList(BaseModel):
    items: list[ProductRead]
    total: int
    page: int
    page_size: int


class CartItemCreate(BaseModel):
    product_id: int
    quantity: int = Field(ge=1, le=99)


class CartItemRead(BaseModel):
    id: int
    product: ProductRead
    quantity: int
    unit_price_cents: int
    line_total_cents: int


class CartRead(BaseModel):
    items: list[CartItemRead]
    subtotal_cents: int


class AddressCreate(BaseModel):
    full_name: str
    phone: str | None = None
    country: str = "Chile"
    city: str
    commune: str
    address_line1: str
    address_line2: str | None = None
    postal_code: str | None = None


class OrderCreate(BaseModel):
    address: AddressCreate
    rut: str | None = None
    shipping_cents: int = 399000
    discount_cents: int = 0


class OrderItemRead(BaseModel):
    product_name_snapshot: str
    unit_price_cents_snapshot: int
    quantity: int
    line_total_cents: int


class OrderRead(BaseModel):
    id: int
    status: str
    address: str
    subtotal_cents: int
    shipping_cents: int
    discount_cents: int
    total_cents: int
    created_at: datetime
    items: list[OrderItemRead]


class PaymentCreate(BaseModel):
    order_id: int
    provider: str = "mercado_pago"


class PaymentRead(BaseModel):
    id: int
    order_id: int
    provider: str
    status: str
    amount_cents: int
    checkout_url: str


class ReviewCreate(BaseModel):
    product_id: int
    rating: int = Field(ge=1, le=5)
    body: str = Field(min_length=3)


class ReviewRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    product_id: int
    rating: int
    body: str
    created_at: datetime

