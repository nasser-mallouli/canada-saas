from ninja import Router
from ninja_jwt.authentication import JWTAuth
from typing import Optional, List
from pydantic import BaseModel, EmailStr
from apps.core.models import ConsultationRequest
from django.contrib.auth import get_user_model
from ninja.errors import HttpError

User = get_user_model()
router = Router(tags=["Consultation"])


class ConsultationRequestCreateSchema(BaseModel):
    user_name: str
    user_email: EmailStr
    user_phone: Optional[str] = None
    consultation_type: str
    consultation_reason: str
    preferred_date: str
    preferred_time: str


class ConsultationRequestSchema(BaseModel):
    id: str
    user_name: str
    user_email: str
    user_phone: Optional[str] = None
    consultation_type: str
    consultation_reason: str
    preferred_date: str
    preferred_time: str
    status: str
    created_at: str

    @classmethod
    def from_orm(cls, obj):
        """Custom from_orm to handle UUID and datetime serialization"""
        def serialize_datetime(value):
            if value is None:
                return None
            if hasattr(value, 'isoformat'):
                return value.isoformat()
            return str(value)
        
        return cls(
            id=str(obj.id),
            user_name=obj.user_name,
            user_email=obj.user_email,
            user_phone=obj.user_phone,
            consultation_type=obj.consultation_type,
            consultation_reason=obj.consultation_reason,
            preferred_date=serialize_datetime(obj.preferred_date),
            preferred_time=obj.preferred_time,
            status=obj.status,
            created_at=serialize_datetime(obj.created_at),
        )
    
    class Config:
        from_attributes = True


@router.post("/request", response=ConsultationRequestSchema, auth=None)
def create_consultation_request(request, payload: ConsultationRequestCreateSchema):
    """Create a consultation request (anonymous allowed)"""
    from datetime import datetime
    
    consultation = ConsultationRequest.objects.create(
        user_name=payload.user_name,
        user_email=payload.user_email,
        user_phone=payload.user_phone,
        consultation_type=payload.consultation_type,
        consultation_reason=payload.consultation_reason,
        preferred_date=datetime.strptime(payload.preferred_date, "%Y-%m-%d").date(),
        preferred_time=payload.preferred_time,
    )
    return ConsultationRequestSchema.from_orm(consultation)


@router.get("/requests", response=List[ConsultationRequestSchema], auth=JWTAuth())
def list_consultation_requests(request):
    """List all consultation requests (admin only)"""
    # Check if user is admin
    try:
        profile = request.user.profile
        if profile.role != 'admin':
            raise HttpError(403, "Only admins can access this endpoint")
    except:
        raise HttpError(403, "Only admins can access this endpoint")
    
    requests = ConsultationRequest.objects.all().order_by('-created_at')
    return [ConsultationRequestSchema.from_orm(req) for req in requests]


@router.get("/requests/{request_id}", response=ConsultationRequestSchema, auth=None)
def get_consultation_request(request, request_id: str):
    """Get a specific consultation request by ID (public access)"""
    try:
        consultation = ConsultationRequest.objects.get(id=request_id)
        return ConsultationRequestSchema.from_orm(consultation)
    except ConsultationRequest.DoesNotExist:
        raise HttpError(404, "Consultation request not found")


class ConsultationStatusUpdateSchema(BaseModel):
    status: str


@router.patch("/requests/{request_id}/status", response=ConsultationRequestSchema, auth=JWTAuth())
def update_consultation_status(request, request_id: str, payload: ConsultationStatusUpdateSchema):
    """Update consultation request status (admin only)"""
    # Check if user is admin
    try:
        profile = request.user.profile
        if profile.role != 'admin':
            raise HttpError(403, "Only admins can update consultation status")
    except:
        raise HttpError(403, "Only admins can update consultation status")
    
    # Validate status
    valid_statuses = ['pending', 'confirmed', 'connected', 'completed', 'done', 'cancelled']
    if payload.status not in valid_statuses:
        raise HttpError(400, f"Invalid status. Must be one of: {', '.join(valid_statuses)}")
    
    try:
        consultation = ConsultationRequest.objects.get(id=request_id)
        consultation.status = payload.status
        consultation.save()
        return ConsultationRequestSchema.from_orm(consultation)
    except ConsultationRequest.DoesNotExist:
        raise HttpError(404, "Consultation request not found")

