from app.models import Cart, CartItem, Order, Product
from app.schemas.shop import (
    BrandRead,
    CartItemRead,
    CartRead,
    CategoryRead,
    OrderItemRead,
    OrderRead,
    ProductRead,
)


def product_to_read(product: Product) -> ProductRead:
    image = sorted(product.images, key=lambda item: item.sort_order)[0].image_path if product.images else None
    return ProductRead(
        id=product.id,
        name=product.name,
        description=product.description,
        amount=product.amount,
        price_cents=product.price_cents,
        category=CategoryRead.model_validate(product.category) if product.category else None,
        brand=BrandRead.model_validate(product.brand) if product.brand else None,
        image_url=image,
        is_active=product.is_active,
    )


def cart_item_to_read(item: CartItem) -> CartItemRead:
    return CartItemRead(
        id=item.id,
        product=product_to_read(item.product),
        quantity=item.quantity,
        unit_price_cents=item.unit_price_cents,
        line_total_cents=item.unit_price_cents * item.quantity,
    )


def cart_to_read(cart: Cart) -> CartRead:
    items = [cart_item_to_read(item) for item in cart.items]
    return CartRead(items=items, subtotal_cents=sum(item.line_total_cents for item in items))


def order_to_read(order: Order) -> OrderRead:
    return OrderRead(
        id=order.id,
        user_id=order.user_id,
        status=order.status.name if order.status else "unknown",
        address=order.address,
        subtotal_cents=order.subtotal_cents,
        shipping_cents=order.shipping_cents,
        discount_cents=order.discount_cents,
        total_cents=order.total_cents,
        created_at=order.created_at,
        items=[
            OrderItemRead(
                product_name_snapshot=item.product_name_snapshot,
                unit_price_cents_snapshot=item.unit_price_cents_snapshot,
                quantity=item.quantity,
                line_total_cents=item.line_total_cents,
            )
            for item in order.items
        ],
    )
