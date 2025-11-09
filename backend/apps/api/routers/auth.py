from ninja import Router
from ninja_jwt.authentication import JWTAuth
from django.contrib.auth import get_user_model
from django.contrib.auth.hashers import make_password
from typing import Optional
from pydantic import BaseModel, EmailStr
from apps.core.models import UserProfile

User = get_user_model()
router = Router(tags=["Authentication"])


class RegisterSchema(BaseModel):
    email: EmailStr
    password: str
    full_name: str


class LoginSchema(BaseModel):
    email: EmailStr
    password: str


class UserProfileSchema(BaseModel):
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

    @classmethod
    def from_orm(cls, obj):
        """Custom from_orm to handle datetime serialization"""
        def serialize_datetime(value):
            if value is None:
                return None
            if hasattr(value, 'isoformat'):
                return value.isoformat()
            return str(value)
        
        data = {
            'id': str(obj.id),
            'full_name': obj.full_name,
            'phone': obj.phone,
            'target_province': obj.target_province,
            'target_city': obj.target_city,
            'planned_arrival_date': serialize_datetime(obj.planned_arrival_date),
            'current_location': obj.current_location,
            'immigration_status': obj.immigration_status,
            'language_preference': obj.language_preference,
            'notification_settings': obj.notification_settings or {},
            'role': obj.role,
            'created_at': serialize_datetime(obj.created_at),
            'updated_at': serialize_datetime(obj.updated_at),
        }
        return cls(**data)
    
    class Config:
        from_attributes = True


class UserSchema(BaseModel):
    id: int
    email: str
    username: str
    is_active: bool
    date_joined: str

    @classmethod
    def from_orm(cls, obj):
        """Custom from_orm to handle datetime serialization"""
        data = {
            'id': obj.id,
            'email': obj.email,
            'username': obj.username,
            'is_active': obj.is_active,
            'date_joined': obj.date_joined.isoformat() if hasattr(obj.date_joined, 'isoformat') else str(obj.date_joined),
        }
        return cls(**data)
    
    class Config:
        from_attributes = True


class AuthResponseSchema(BaseModel):
    user: UserSchema
    profile: Optional[UserProfileSchema] = None
    access: str
    refresh: str


@router.post("/register", response=AuthResponseSchema, auth=None)
def register(request, payload: RegisterSchema):
    """Register a new user"""
    if User.objects.filter(email=payload.email).exists():
        from ninja.errors import HttpError
        raise HttpError(400, "User with this email already exists")

    user = User.objects.create_user(
        username=payload.email,
        email=payload.email,
        password=payload.password,
        first_name=payload.full_name.split()[0] if payload.full_name else '',
        last_name=' '.join(payload.full_name.split()[1:]) if len(payload.full_name.split()) > 1 else '',
    )

    # Create user profile
    profile = UserProfile.objects.create(
        user=user,
        full_name=payload.full_name,
        role='user',
    )

    # Generate tokens
    from ninja_jwt.tokens import RefreshToken
    refresh = RefreshToken.for_user(user)
    access = refresh.access_token

    return {
        "user": UserSchema.from_orm(user),
        "profile": UserProfileSchema.from_orm(profile),
        "access": str(access),
        "refresh": str(refresh),
    }


class CreateAdminSchema(BaseModel):
    email: EmailStr
    password: str
    full_name: str


@router.post("/create-admin", response=AuthResponseSchema, auth=None)
def create_admin(request, payload: CreateAdminSchema):
    """Create an admin user (first admin only, or requires existing admin)"""
    from ninja.errors import HttpError
    from ninja_jwt.authentication import JWTAuth
    from ninja_jwt.exceptions import InvalidToken
    
    # Check if user already exists
    if User.objects.filter(email=payload.email).exists():
        raise HttpError(400, f"User with email {payload.email} already exists. Please log in instead.")
    
    # Check if any admin exists
    admin_exists = UserProfile.objects.filter(role='admin').exists()
    
    # Allow first admin creation without auth, or require existing admin
    if admin_exists:
        # If admin exists, manually check for JWT token
        auth_header = request.META.get('HTTP_AUTHORIZATION', '')
        if not auth_header.startswith('Bearer '):
            raise HttpError(401, "An admin account already exists. Please log in with an existing admin account to create additional admins.")
        
        # Manually authenticate using JWT
        try:
            jwt_auth = JWTAuth()
            # Extract token
            token = auth_header.split(' ')[1] if len(auth_header.split(' ')) > 1 else None
            if not token:
                raise HttpError(401, "Invalid authentication token")
            
            # Validate token and get user
            from ninja_jwt.utils import decode_access_token
            validated_token = decode_access_token(token)
            user_id = validated_token.get('user_id')
            if not user_id:
                raise HttpError(401, "Invalid authentication token")
            
            current_user = User.objects.get(id=user_id)
            
            # Check if current user is admin
            try:
                current_profile = current_user.profile
                if current_profile.role != 'admin':
                    raise HttpError(403, "Only admins can create other admin accounts")
            except UserProfile.DoesNotExist:
                raise HttpError(403, "Only admins can create other admin accounts")
        except (InvalidToken, User.DoesNotExist, Exception) as e:
            if isinstance(e, HttpError):
                raise e
            raise HttpError(401, "Invalid authentication token")
    
    # Check if user already exists
    if User.objects.filter(email=payload.email).exists():
        raise HttpError(400, "User with this email already exists")

    # Create user
    user = User.objects.create_user(
        username=payload.email,
        email=payload.email,
        password=payload.password,
        first_name=payload.full_name.split()[0] if payload.full_name else '',
        last_name=' '.join(payload.full_name.split()[1:]) if len(payload.full_name.split()) > 1 else '',
        is_staff=True,  # Django admin access
        is_superuser=not admin_exists,  # First admin is superuser
    )

    # Create user profile with admin role
    profile = UserProfile.objects.create(
        user=user,
        full_name=payload.full_name,
        role='admin',
    )

    # Generate tokens
    from ninja_jwt.tokens import RefreshToken
    refresh = RefreshToken.for_user(user)
    access = refresh.access_token

    return {
        "user": UserSchema.from_orm(user),
        "profile": UserProfileSchema.from_orm(profile),
        "access": str(access),
        "refresh": str(refresh),
    }


@router.post("/login", response=AuthResponseSchema, auth=None)
def login(request, payload: LoginSchema):
    """Login and get JWT tokens"""
    from django.contrib.auth import authenticate
    from ninja_jwt.tokens import RefreshToken
    from ninja.errors import HttpError
    import logging

    logger = logging.getLogger(__name__)
    logger.info(f"Login attempt for email: {payload.email}")

    # Try to authenticate with email as username (since we use email as username)
    user = authenticate(request, username=payload.email, password=payload.password)
    if not user:
        logger.warning(f"Authentication failed for email: {payload.email}")
        raise HttpError(401, "Invalid email or password")

    if not user.is_active:
        raise HttpError(401, "User account is disabled")

    # Get or create profile
    profile, _ = UserProfile.objects.get_or_create(
        user=user,
        defaults={'full_name': user.get_full_name() or user.email, 'role': 'user'}
    )

    # Generate tokens
    refresh = RefreshToken.for_user(user)
    access = refresh.access_token

    return {
        "user": UserSchema.from_orm(user),
        "profile": UserProfileSchema.from_orm(profile),
        "access": str(access),
        "refresh": str(refresh),
    }


@router.get("/me", response=dict, auth=JWTAuth())
def get_current_user(request):
    """Get current authenticated user and profile"""
    profile = None
    try:
        profile = request.user.profile
    except UserProfile.DoesNotExist:
        pass
    except AttributeError:
        # Handle AnonymousUser - should not happen with JWTAuth, but just in case
        from ninja.errors import HttpError
        raise HttpError(401, "Authentication required")

    return {
        "user": {
            "id": request.user.id,
            "email": request.user.email,
            "username": request.user.username,
            "is_active": request.user.is_active,
            "date_joined": request.user.date_joined.isoformat(),
        },
        "profile": UserProfileSchema.from_orm(profile) if profile else None,
    }


class RefreshTokenSchema(BaseModel):
    refresh: str


@router.post("/token/refresh/", response=dict, auth=None)
def refresh_token(request, payload: RefreshTokenSchema):
    """Refresh access token using refresh token"""
    from ninja_jwt.tokens import RefreshToken
    from ninja.errors import HttpError
    
    try:
        refresh_token = RefreshToken(payload.refresh)
        access_token = refresh_token.access_token
        
        # Rotate refresh token if configured
        new_refresh = refresh_token
        if hasattr(refresh_token, 'rotate'):
            new_refresh = refresh_token.rotate()
        
        return {
            "access": str(access_token),
            "refresh": str(new_refresh),
        }
    except Exception as e:
        raise HttpError(401, f"Invalid refresh token: {str(e)}")


class BlacklistTokenSchema(BaseModel):
    refresh: str


@router.post("/token/blacklist/", response=dict, auth=None)
def blacklist_token(request, payload: BlacklistTokenSchema):
    """Blacklist a refresh token (logout)"""
    from ninja_jwt.tokens import RefreshToken
    from ninja.errors import HttpError
    
    try:
        refresh_token = RefreshToken(payload.refresh)
        refresh_token.blacklist()
        return {"message": "Token blacklisted successfully"}
    except Exception as e:
        raise HttpError(400, f"Invalid refresh token: {str(e)}")


# Note: We use custom /login endpoint instead of /token/obtain/
# The /login endpoint returns user profile along with tokens

