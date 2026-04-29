from fastapi import APIRouter, Depends

from app.api.deps import current_user
from app.models import User
from app.schemas.shop import UserRead


router = APIRouter()


@router.get("/users/me", response_model=UserRead)
def me(user: User = Depends(current_user)) -> User:
    return user
