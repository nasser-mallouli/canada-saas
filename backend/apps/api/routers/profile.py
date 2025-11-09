from ninja import Router
from ninja_jwt.authentication import JWTAuth
from typing import Optional
from pydantic import BaseModel
from apps.core.models import UserProfile
from ninja.errors import HttpError

router = Router(tags=["Profile"])


class ProfileUpdateSchema(BaseModel):
    full_name: Optional[str] = None
    phone: Optional[str] = None
    target_province: Optional[str] = None
    target_city: Optional[str] = None
    planned_arrival_date: Optional[str] = None
    current_location: Optional[str] = None
    immigration_status: Optional[str] = None
    language_preference: Optional[str] = None
    notification_settings: Optional[dict] = None


class ProfileSchema(BaseModel):
    id: str
    full_name: str
    phone: Optional[str] = None
    target_province: Optional[str] = None
    target_city: Optional[str] = None
    planned_arrival_date: Optional[str] = None
    current_location: Optional[str] = None
    immigration_status: Optional[str] = None
    language_preference: str
    notification_settings: dict
    role: str
    created_at: str
    updated_at: str

    class Config:
        from_attributes = True


@router.get("/", response=ProfileSchema)
def get_profile(request):
    """Get current user's profile"""
    profile, _ = UserProfile.objects.get_or_create(
        user=request.user,
        defaults={'full_name': request.user.get_full_name() or request.user.email, 'role': 'user'}
    )
    return profile


@router.patch("/", response=ProfileSchema)
def update_profile(request, payload: ProfileUpdateSchema):
    """Update current user's profile"""
    profile, _ = UserProfile.objects.get_or_create(
        user=request.user,
        defaults={'full_name': request.user.get_full_name() or request.user.email, 'role': 'user'}
    )
    
    update_data = payload.dict(exclude_unset=True)
    
    # Handle date field
    if 'planned_arrival_date' in update_data and update_data['planned_arrival_date']:
        from datetime import datetime
        update_data['planned_arrival_date'] = datetime.strptime(
            update_data['planned_arrival_date'], "%Y-%m-%d"
        ).date()
    
    for key, value in update_data.items():
        setattr(profile, key, value)
    
    profile.save()
    return profile

