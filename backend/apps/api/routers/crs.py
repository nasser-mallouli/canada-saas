from ninja import Router
from ninja_jwt.authentication import JWTAuth
from typing import Optional, List
from pydantic import BaseModel
from apps.core.models import CRSCalculation, CRSCalculationDetailed, CRSCalculationSession
from django.shortcuts import get_object_or_404
from django.utils import timezone
from ninja.errors import HttpError

router = Router(tags=["CRS Calculator"])


class CRSCalculationSchema(BaseModel):
    id: str
    user_id: Optional[int] = None
    calculation_date: str
    score: int
    category_breakdown: dict
    input_data: dict
    is_latest: bool
    status: str
    created_at: str
    updated_at: str

    @classmethod
    def from_orm(cls, obj):
        """Custom from_orm to handle UUID and datetime serialization"""
        return cls(
            id=str(obj.id),
            user_id=obj.user.id if obj.user else None,
            calculation_date=obj.calculation_date.isoformat(),
            score=obj.score,
            category_breakdown=obj.category_breakdown,
            input_data=obj.input_data,
            is_latest=obj.is_latest,
            status=obj.status,
            created_at=obj.created_at.isoformat(),
            updated_at=obj.updated_at.isoformat(),
        )
    
    class Config:
        from_attributes = True


class CRSCalculationCreateSchema(BaseModel):
    score: int
    category_breakdown: dict
    input_data: dict
    is_latest: bool = True
    status: str = "completed"


class CRSCalculationDetailedCreateSchema(BaseModel):
    user_name: str
    user_email: str
    user_phone: Optional[str] = None
    input_data: dict
    crs_score: int
    category_breakdown: dict
    improvement_suggestions: Optional[dict] = None
    session_id: Optional[str] = None


class CRSCalculationDetailedSchema(BaseModel):
    id: str
    user_name: str
    user_email: str
    user_phone: Optional[str] = None
    input_data: dict
    crs_score: int
    category_breakdown: dict
    improvement_suggestions: Optional[dict] = None
    session_id: Optional[str] = None
    created_at: str

    @classmethod
    def from_orm(cls, obj):
        """Custom from_orm to handle UUID and datetime serialization"""
        return cls(
            id=str(obj.id),
            user_name=obj.user_name,
            user_email=obj.user_email,
            user_phone=obj.user_phone,
            input_data=obj.input_data,
            crs_score=obj.crs_score,
            category_breakdown=obj.category_breakdown,
            improvement_suggestions=obj.improvement_suggestions,
            session_id=obj.session_id,
            created_at=obj.created_at.isoformat(),
        )
    
    class Config:
        from_attributes = True


@router.post("/calculate", response=CRSCalculationSchema, auth=JWTAuth())
def create_crs_calculation(request, payload: CRSCalculationCreateSchema):
    """Save CRS calculation (authenticated)"""
    calculation = CRSCalculation.objects.create(
        user=request.user,
        score=payload.score,
        category_breakdown=payload.category_breakdown,
        input_data=payload.input_data,
        is_latest=payload.is_latest,
        status=payload.status,
    )
    return CRSCalculationSchema.from_orm(calculation)


@router.post("/calculate-detailed", response=CRSCalculationDetailedSchema, auth=None)
def create_crs_calculation_detailed(request, payload: CRSCalculationDetailedCreateSchema):
    """Save detailed CRS calculation (anonymous allowed)"""
    calculation = CRSCalculationDetailed.objects.create(
        user_name=payload.user_name,
        user_email=payload.user_email,
        user_phone=payload.user_phone,
        input_data=payload.input_data,
        crs_score=payload.crs_score,
        category_breakdown=payload.category_breakdown,
        improvement_suggestions=payload.improvement_suggestions or {},
        session_id=payload.session_id,
    )
    return CRSCalculationDetailedSchema.from_orm(calculation)


@router.get("/calculations", response=List[CRSCalculationSchema], auth=JWTAuth())
def get_user_calculations(request):
    """Get all CRS calculations for the authenticated user"""
    calculations = CRSCalculation.objects.filter(user=request.user).order_by('-created_at')
    return list(calculations)


class CRSCalculationSessionUpdateSchema(BaseModel):
    session_id: str
    current_step: str
    completed_steps: Optional[List[str]] = None
    partial_data: Optional[dict] = None
    user_name: Optional[str] = None
    user_email: Optional[str] = None
    user_phone: Optional[str] = None
    is_completed: Optional[bool] = False


@router.get("/session/{session_id}", auth=None)
def get_calculation_session(request, session_id: str):
    """Get a calculation session by ID (anonymous allowed)"""
    try:
        session = CRSCalculationSession.objects.get(id=session_id)
        return {
            "id": str(session.id),
            "session_id": session.session_id,
            "current_step": session.current_step,
            "completed_steps": session.completed_steps or [],
            "partial_data": session.partial_data or {},
            "user_name": session.user_name,
            "user_email": session.user_email,
            "user_phone": session.user_phone,
            "is_completed": session.is_completed,
            "created_at": session.created_at.isoformat(),
            "updated_at": session.last_activity.isoformat() if session.last_activity else session.created_at.isoformat(),
        }
    except CRSCalculationSession.DoesNotExist:
        raise HttpError(404, "Calculation session not found")


@router.post("/session", auth=None)
def update_calculation_session(request, payload: CRSCalculationSessionUpdateSchema):
    """Create or update calculator session progress (anonymous allowed)"""
    import time
    
    # Retry logic for database locks (SQLite can have concurrency issues)
    max_retries = 3
    retry_delay = 0.1  # 100ms
    
    for attempt in range(max_retries):
        try:
            # Use a simpler pattern without update_or_create to avoid locks
            try:
                session = CRSCalculationSession.objects.get(session_id=payload.session_id)
                # Update existing session
                session.current_step = payload.current_step
                session.completed_steps = payload.completed_steps or []
                session.partial_data = payload.partial_data or {}
                if payload.user_name:
                    session.user_name = payload.user_name
                if payload.user_email:
                    session.user_email = payload.user_email
                if payload.user_phone:
                    session.user_phone = payload.user_phone
                session.is_completed = payload.is_completed
                session.last_activity = timezone.now()
                session.save()
            except CRSCalculationSession.DoesNotExist:
                # Create new session
                session = CRSCalculationSession.objects.create(
                    session_id=payload.session_id,
                    current_step=payload.current_step,
                    completed_steps=payload.completed_steps or [],
                    partial_data=payload.partial_data or {},
                    user_name=payload.user_name,
                    user_email=payload.user_email,
                    user_phone=payload.user_phone,
                    is_completed=payload.is_completed,
                    last_activity=timezone.now(),
                )
            
            return {
                "id": str(session.id),
                "session_id": session.session_id,
                "current_step": session.current_step,
                "completed_steps": session.completed_steps,
                "is_completed": session.is_completed,
                "created_at": session.created_at.isoformat(),
                "updated_at": session.updated_at.isoformat(),
            }
            
        except Exception as e:
            # If it's a database lock error and we have retries left, wait and retry
            error_str = str(e).lower()
            if ("locked" in error_str or "database is locked" in error_str) and attempt < max_retries - 1:
                time.sleep(retry_delay * (attempt + 1))  # Exponential backoff
                continue
            # Otherwise, re-raise the exception
            raise


@router.get("/calculation/{calculation_id}", auth=JWTAuth())
def get_calculation_detail(request, calculation_id: str):
    """Get a single CRS calculation by ID (supports both CRSCalculation and CRSCalculationDetailed)"""
    from apps.core.models import UserProfile
    
    # Check if user is admin
    is_admin = request.user.is_staff or request.user.is_superuser
    
    # Try to find in CRSCalculation first
    try:
        calc = CRSCalculation.objects.get(id=calculation_id)
        # Check if user has access (admin or owner)
        if not is_admin and calc.user != request.user:
            raise HttpError(403, "You don't have permission to view this calculation")
        
        # Get user profile if exists
        user_name = None
        user_phone = None
        if calc.user:
            try:
                profile = calc.user.profile
                user_name = profile.full_name
                user_phone = profile.phone
            except UserProfile.DoesNotExist:
                pass
        
        return {
            "id": str(calc.id),
            "type": "authenticated",
            "user_id": calc.user.id if calc.user else None,
            "user_name": user_name,
            "user_email": calc.user.email if calc.user else None,
            "user_phone": user_phone,
            "calculation_date": calc.calculation_date.isoformat(),
            "score": calc.score,
            "category_breakdown": calc.category_breakdown,
            "input_data": calc.input_data,
            "is_latest": calc.is_latest,
            "status": calc.status,
            "created_at": calc.created_at.isoformat(),
            "updated_at": calc.updated_at.isoformat(),
        }
    except CRSCalculation.DoesNotExist:
        pass
    
    # Try to find in CRSCalculationDetailed
    try:
        calc = CRSCalculationDetailed.objects.get(id=calculation_id)
        # For detailed calculations, admins can always view, or if email matches
        if not is_admin and calc.user_email != request.user.email:
            raise HttpError(403, "You don't have permission to view this calculation")
        
        return {
            "id": str(calc.id),
            "type": "detailed",
            "user_id": None,
            "user_name": calc.user_name,
            "user_email": calc.user_email,
            "user_phone": calc.user_phone,
            "calculation_date": calc.created_at.isoformat(),
            "score": calc.crs_score,
            "category_breakdown": calc.category_breakdown,
            "input_data": calc.input_data,
            "improvement_suggestions": calc.improvement_suggestions,
            "session_id": calc.session_id,
            "is_latest": True,
            "status": "completed",
            "created_at": calc.created_at.isoformat(),
            "updated_at": calc.created_at.isoformat(),
        }
    except CRSCalculationDetailed.DoesNotExist:
        pass
    
    # Try to find in CRSCalculationSession (for partial calculations)
    try:
        session = CRSCalculationSession.objects.get(id=calculation_id)
        # For sessions, admins can always view
        if not is_admin:
            raise HttpError(403, "You don't have permission to view this calculation")
        
        return {
            "id": str(session.id),
            "type": "partial",
            "user_id": None,
            "user_name": session.user_name,
            "user_email": session.user_email,
            "user_phone": session.user_phone,
            "calculation_date": session.created_at.isoformat(),
            "score": None,
            "category_breakdown": {},
            "input_data": session.partial_data or {},
            "improvement_suggestions": None,
            "session_id": session.session_id,
            "current_step": session.current_step,
            "completed_steps": session.completed_steps or [],
            "is_latest": False,
            "status": "in_progress" if not session.is_completed else "completed",
            "created_at": session.created_at.isoformat(),
            "updated_at": session.last_activity.isoformat() if session.last_activity else session.created_at.isoformat(),
        }
    except CRSCalculationSession.DoesNotExist:
        pass
    
    raise HttpError(404, "Calculation not found")

