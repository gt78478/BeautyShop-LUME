from fastapi import APIRouter

from .admin import router as admin_router
from .auth import router as auth_router
from .cart import router as cart_router
from .catalog import router as catalog_router
from .orders import router as orders_router
from .payments import router as payments_router
from .reviews import router as reviews_router
from .users import router as users_router
from .wishlist import router as wishlist_router


router = APIRouter()
router.include_router(auth_router)
router.include_router(users_router)
router.include_router(catalog_router)
router.include_router(cart_router)
router.include_router(orders_router)
router.include_router(payments_router)
router.include_router(wishlist_router)
router.include_router(reviews_router)
router.include_router(admin_router)
