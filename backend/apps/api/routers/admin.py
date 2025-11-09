from ninja import Router
from ninja_jwt.authentication import JWTAuth
from typing import List, Optional
from pydantic import BaseModel
from django.contrib.auth import get_user_model
from apps.core.models import (
    UserProfile, CRSCalculation, CRSCalculationDetailed,
    ConsultationRequest, PathwayAdvisorSubmission
)
from ninja.errors import HttpError

User = get_user_model()
router = Router(tags=["Admin"])


def check_admin(request):
    """Helper to check if user is admin"""
    try:
        profile = request.user.profile
        if profile.role != 'admin':
            raise HttpError(403, "Only admins can access this endpoint")
    except UserProfile.DoesNotExist:
        raise HttpError(403, "Only admins can access this endpoint")
    return profile


class UserSummarySchema(BaseModel):
    id: int
    email: str
    username: str
    is_active: bool
    date_joined: str
    profile: Optional[dict] = None
    calculation_count: int = 0
    consultation_count: int = 0
    submission_count: int = 0

    class Config:
        from_attributes = True


class UserDetailSchema(BaseModel):
    id: int
    email: str
    username: str
    is_active: bool
    date_joined: str
    profile: Optional[dict] = None
    calculations: List[dict] = []
    consultations: List[dict] = []
    submissions: List[dict] = []

    class Config:
        from_attributes = True


@router.get("/users", response=List[UserSummarySchema], auth=JWTAuth())
def list_users(request):
    """List all users with summary data (admin only)"""
    check_admin(request)
    
    users = User.objects.all().order_by('-date_joined')
    result = []
    
    for user in users:
        try:
            profile = user.profile
            profile_data = {
                "id": str(profile.id),
                "full_name": profile.full_name,
                "role": profile.role,
                "phone": profile.phone,
                "created_at": profile.created_at.isoformat(),
            }
        except UserProfile.DoesNotExist:
            profile_data = None
        
        # Count user activities
        calculation_count = CRSCalculation.objects.filter(user=user).count()
        consultation_count = ConsultationRequest.objects.filter(user_email=user.email).count()
        submission_count = PathwayAdvisorSubmission.objects.filter(user_email=user.email).count()
        
        result.append({
            "id": user.id,
            "email": user.email,
            "username": user.username,
            "is_active": user.is_active,
            "date_joined": user.date_joined.isoformat(),
            "profile": profile_data,
            "calculation_count": calculation_count,
            "consultation_count": consultation_count,
            "submission_count": submission_count,
        })
    
    return result


@router.get("/users/{user_id}", response=UserDetailSchema, auth=JWTAuth())
def get_user_detail(request, user_id: int):
    """Get detailed user information with all their data (admin only)"""
    check_admin(request)
    
    try:
        user = User.objects.get(id=user_id)
    except User.DoesNotExist:
        raise HttpError(404, "User not found")
    
    # Get profile
    try:
        profile = user.profile
        profile_data = {
            "id": str(profile.id),
            "full_name": profile.full_name,
            "role": profile.role,
            "phone": profile.phone,
            "target_province": profile.target_province,
            "target_city": profile.target_city,
            "current_location": profile.current_location,
            "immigration_status": profile.immigration_status,
            "language_preference": profile.language_preference,
            "created_at": profile.created_at.isoformat(),
            "updated_at": profile.updated_at.isoformat(),
        }
    except UserProfile.DoesNotExist:
        profile_data = None
    
    # Get all calculations
    calculations = CRSCalculation.objects.filter(user=user).order_by('-created_at')
    calculations_data = [
        {
            "id": str(calc.id),
            "score": calc.score,
            "status": calc.status,
            "created_at": calc.created_at.isoformat(),
            "input_data": calc.input_data,
        }
        for calc in calculations
    ]
    
    # Get all detailed calculations by email
    detailed_calculations = CRSCalculationDetailed.objects.filter(user_email=user.email).order_by('-created_at')
    calculations_data.extend([
        {
            "id": str(calc.id),
            "score": calc.crs_score,
            "status": "detailed",
            "created_at": calc.created_at.isoformat(),
            "input_data": calc.input_data,
            "user_name": calc.user_name,
        }
        for calc in detailed_calculations
    ])
    
    # Get all consultations
    consultations = ConsultationRequest.objects.filter(user_email=user.email).order_by('-created_at')
    consultations_data = [
        {
            "id": str(consult.id),
            "user_name": consult.user_name,
            "consultation_type": consult.consultation_type,
            "preferred_date": consult.preferred_date.isoformat(),
            "preferred_time": consult.preferred_time,
            "status": consult.status,
            "created_at": consult.created_at.isoformat(),
        }
        for consult in consultations
    ]
    
    # Get all pathway submissions
    submissions = PathwayAdvisorSubmission.objects.filter(user_email=user.email).order_by('-created_at')
    submissions_data = [
        {
            "id": str(sub.id),
            "user_name": sub.user_name,
            "pathway_goal": sub.pathway_goal,
            "education_level": sub.education_level,
            "work_experience_years": float(sub.work_experience_years),
            "created_at": sub.created_at.isoformat(),
            "eligibility_results": sub.eligibility_results,
        }
        for sub in submissions
    ]
    
    return {
        "id": user.id,
        "email": user.email,
        "username": user.username,
        "is_active": user.is_active,
        "date_joined": user.date_joined.isoformat(),
        "profile": profile_data,
        "calculations": calculations_data,
        "consultations": consultations_data,
        "submissions": submissions_data,
    }


@router.get("/users/{user_id}/calculations", response=List[dict], auth=JWTAuth())
def get_user_calculations(request, user_id: int):
    """Get all CRS calculations for a specific user (admin only)"""
    check_admin(request)
    
    try:
        user = User.objects.get(id=user_id)
    except User.DoesNotExist:
        raise HttpError(404, "User not found")
    
    calculations = CRSCalculation.objects.filter(user=user).order_by('-created_at')
    detailed = CRSCalculationDetailed.objects.filter(user_email=user.email).order_by('-created_at')
    
    result = []
    
    for calc in calculations:
        result.append({
            "id": str(calc.id),
            "type": "authenticated",
            "score": calc.score,
            "category_breakdown": calc.category_breakdown,
            "input_data": calc.input_data,
            "status": calc.status,
            "created_at": calc.created_at.isoformat(),
        })
    
    for calc in detailed:
        result.append({
            "id": str(calc.id),
            "type": "detailed",
            "score": calc.crs_score,
            "category_breakdown": calc.category_breakdown,
            "input_data": calc.input_data,
            "improvement_suggestions": calc.improvement_suggestions,
            "user_name": calc.user_name,
            "created_at": calc.created_at.isoformat(),
        })
    
    return result


@router.get("/users/{user_id}/consultations", response=List[dict], auth=JWTAuth())
def get_user_consultations(request, user_id: int):
    """Get all consultations for a specific user (admin only)"""
    check_admin(request)
    
    try:
        user = User.objects.get(id=user_id)
    except User.DoesNotExist:
        raise HttpError(404, "User not found")
    
    consultations = ConsultationRequest.objects.filter(user_email=user.email).order_by('-created_at')
    
    return [
        {
            "id": str(consult.id),
            "user_name": consult.user_name,
            "user_email": consult.user_email,
            "user_phone": consult.user_phone,
            "consultation_type": consult.consultation_type,
            "consultation_reason": consult.consultation_reason,
            "preferred_date": consult.preferred_date.isoformat(),
            "preferred_time": consult.preferred_time,
            "status": consult.status,
            "created_at": consult.created_at.isoformat(),
        }
        for consult in consultations
    ]


@router.get("/users/{user_id}/submissions", response=List[dict], auth=JWTAuth())
def get_user_submissions(request, user_id: int):
    """Get all pathway submissions for a specific user (admin only)"""
    check_admin(request)
    
    try:
        user = User.objects.get(id=user_id)
    except User.DoesNotExist:
        raise HttpError(404, "User not found")
    
    submissions = PathwayAdvisorSubmission.objects.filter(user_email=user.email).order_by('-created_at')
    
    return [
        {
            "id": str(sub.id),
            "user_name": sub.user_name,
            "user_email": sub.user_email,
            "pathway_goal": sub.pathway_goal,
            "education_level": sub.education_level,
            "work_experience_years": float(sub.work_experience_years),
            "field_of_study": sub.field_of_study,
            "language_tests": sub.language_tests,
            "has_job_offer": sub.has_job_offer,
            "has_canadian_experience": sub.has_canadian_experience,
            "eligibility_results": sub.eligibility_results,
            "created_at": sub.created_at.isoformat(),
        }
        for sub in submissions
    ]


@router.get("/users/{user_id}/activity", response=dict, auth=JWTAuth())
def get_user_activity(request, user_id: int):
    """Get all activity for a specific user (admin only)"""
    check_admin(request)
    
    try:
        user = User.objects.get(id=user_id)
    except User.DoesNotExist:
        raise HttpError(404, "User not found")
    
    calculations = CRSCalculation.objects.filter(user=user).count()
    detailed_calculations = CRSCalculationDetailed.objects.filter(user_email=user.email).count()
    consultations = ConsultationRequest.objects.filter(user_email=user.email).count()
    submissions = PathwayAdvisorSubmission.objects.filter(user_email=user.email).count()
    
    return {
        "user_id": user.id,
        "user_email": user.email,
        "total_calculations": calculations + detailed_calculations,
        "total_consultations": consultations,
        "total_submissions": submissions,
        "total_activity": calculations + detailed_calculations + consultations + submissions,
    }

