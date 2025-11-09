from ninja import Router
from ninja_jwt.authentication import JWTAuth
from typing import Optional, List
from pydantic import BaseModel
from apps.core.models import PathwayAdvisorSubmission
from ninja.errors import HttpError

router = Router(tags=["Pathway Advisor"])


class PathwaySubmissionCreateSchema(BaseModel):
    user_name: Optional[str] = None
    user_email: Optional[str] = None  # Changed from EmailStr to str to allow empty strings
    user_phone: Optional[str] = None
    birth_date: Optional[str] = None
    citizenship_country: Optional[str] = None
    residence_country: Optional[str] = None
    education_level: Optional[str] = None
    work_experience_years: Optional[float] = 0
    field_of_study: Optional[str] = None
    language_tests: Optional[list] = []
    marital_status: Optional[str] = None
    has_canadian_relative: Optional[bool] = False
    has_job_offer: Optional[bool] = False
    has_canadian_experience: Optional[bool] = False
    has_police_record: Optional[bool] = False
    available_funds: Optional[float] = 0
    pathway_goal: Optional[str] = None
    pathway_specific_data: Optional[dict] = {}
    eligibility_results: Optional[dict] = {}
    current_step: Optional[str] = None
    is_completed: Optional[bool] = False
    submission_id: Optional[str] = None  # For updating existing submissions


class PathwaySubmissionSchema(BaseModel):
    id: str
    user_name: Optional[str] = None
    user_email: Optional[str] = None
    user_phone: Optional[str] = None
    birth_date: Optional[str] = None
    citizenship_country: Optional[str] = None
    residence_country: Optional[str] = None
    education_level: Optional[str] = None
    work_experience_years: float
    field_of_study: Optional[str] = None
    language_tests: list
    marital_status: Optional[str] = None
    has_canadian_relative: bool
    has_job_offer: bool
    has_canadian_experience: bool
    has_police_record: bool
    available_funds: float
    pathway_goal: Optional[str] = None
    pathway_specific_data: dict
    eligibility_results: dict
    current_step: Optional[str] = None
    is_completed: bool
    created_at: str
    updated_at: str

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
            birth_date=serialize_datetime(obj.birth_date),
            citizenship_country=obj.citizenship_country,
            residence_country=obj.residence_country,
            education_level=obj.education_level,
            work_experience_years=float(obj.work_experience_years) if obj.work_experience_years else 0.0,
            field_of_study=obj.field_of_study,
            language_tests=obj.language_tests or [],
            marital_status=obj.marital_status,
            has_canadian_relative=obj.has_canadian_relative,
            has_job_offer=obj.has_job_offer,
            has_canadian_experience=obj.has_canadian_experience,
            has_police_record=obj.has_police_record,
            available_funds=float(obj.available_funds) if obj.available_funds else 0.0,
            pathway_goal=obj.pathway_goal,
            pathway_specific_data=obj.pathway_specific_data or {},
            eligibility_results=obj.eligibility_results or {},
            current_step=obj.current_step,
            is_completed=obj.is_completed,
            created_at=serialize_datetime(obj.created_at),
            updated_at=serialize_datetime(obj.updated_at),
        )

    class Config:
        from_attributes = True


@router.post("/submit", response=PathwaySubmissionSchema, auth=None)
def submit_pathway_advisor(request, payload: PathwaySubmissionCreateSchema):
    """Submit or update pathway advisor form (anonymous allowed)"""
    from datetime import datetime
    
    # If submission_id is provided, update existing submission
    if payload.submission_id:
        try:
            submission = PathwayAdvisorSubmission.objects.get(id=payload.submission_id)
            # Update fields
            if payload.user_name:
                submission.user_name = payload.user_name
            if payload.user_email is not None:
                # Validate email if provided
                email = payload.user_email.strip() if payload.user_email else ''
                if email and '@' in email:
                    submission.user_email = email
                elif email:
                    # Invalid email, keep existing or set to empty
                    submission.user_email = ''
            if payload.user_phone is not None:
                submission.user_phone = payload.user_phone
            if payload.birth_date:
                submission.birth_date = datetime.strptime(payload.birth_date, "%Y-%m-%d").date()
            if payload.citizenship_country is not None:
                submission.citizenship_country = payload.citizenship_country
            if payload.residence_country is not None:
                submission.residence_country = payload.residence_country
            if payload.education_level is not None:
                submission.education_level = payload.education_level
            if payload.work_experience_years is not None:
                submission.work_experience_years = payload.work_experience_years
            if payload.field_of_study is not None:
                submission.field_of_study = payload.field_of_study
            if payload.language_tests is not None:
                submission.language_tests = payload.language_tests
            if payload.marital_status is not None:
                submission.marital_status = payload.marital_status
            if payload.has_canadian_relative is not None:
                submission.has_canadian_relative = payload.has_canadian_relative
            if payload.has_job_offer is not None:
                submission.has_job_offer = payload.has_job_offer
            if payload.has_canadian_experience is not None:
                submission.has_canadian_experience = payload.has_canadian_experience
            if payload.has_police_record is not None:
                submission.has_police_record = payload.has_police_record
            if payload.available_funds is not None:
                submission.available_funds = payload.available_funds
            if payload.pathway_goal is not None:
                submission.pathway_goal = payload.pathway_goal
            if payload.pathway_specific_data is not None:
                submission.pathway_specific_data = payload.pathway_specific_data
            if payload.eligibility_results is not None:
                submission.eligibility_results = payload.eligibility_results
            if payload.current_step is not None:
                submission.current_step = payload.current_step
            if payload.is_completed is not None:
                submission.is_completed = payload.is_completed
            submission.save()
            return PathwaySubmissionSchema.from_orm(submission)
        except PathwayAdvisorSubmission.DoesNotExist:
            # If submission doesn't exist, create new one
            pass
    
    # Create new submission
    # Validate email if provided
    email = payload.user_email.strip() if payload.user_email else ''
    if email and '@' not in email:
        email = ''  # Invalid email, set to empty
    
    submission = PathwayAdvisorSubmission.objects.create(
        user_name=payload.user_name or '',
        user_email=email,
        user_phone=payload.user_phone,
        birth_date=datetime.strptime(payload.birth_date, "%Y-%m-%d").date() if payload.birth_date else None,
        citizenship_country=payload.citizenship_country,
        residence_country=payload.residence_country,
        education_level=payload.education_level,
        work_experience_years=payload.work_experience_years or 0,
        field_of_study=payload.field_of_study,
        language_tests=payload.language_tests or [],
        marital_status=payload.marital_status,
        has_canadian_relative=payload.has_canadian_relative or False,
        has_job_offer=payload.has_job_offer or False,
        has_canadian_experience=payload.has_canadian_experience or False,
        has_police_record=payload.has_police_record or False,
        available_funds=payload.available_funds or 0,
        pathway_goal=payload.pathway_goal,
        pathway_specific_data=payload.pathway_specific_data or {},
        eligibility_results=payload.eligibility_results or {},
        current_step=payload.current_step or '',
        is_completed=payload.is_completed or False,
    )
    return PathwaySubmissionSchema.from_orm(submission)


@router.get("/submissions", response=List[PathwaySubmissionSchema], auth=JWTAuth())
def list_pathway_submissions(request):
    """List all pathway submissions (admin only)"""
    # Check if user is admin
    try:
        profile = request.user.profile
        if profile.role != 'admin':
            raise HttpError(403, "Only admins can access this endpoint")
    except:
        raise HttpError(403, "Only admins can access this endpoint")
    
    submissions = PathwayAdvisorSubmission.objects.all().order_by('-created_at')
    return [PathwaySubmissionSchema.from_orm(sub) for sub in submissions]


@router.get("/submissions/{submission_id}", response=PathwaySubmissionSchema, auth=None)
def get_pathway_submission(request, submission_id: str):
    """Get a specific pathway submission by ID"""
    try:
        submission = PathwayAdvisorSubmission.objects.get(id=submission_id)
        return PathwaySubmissionSchema.from_orm(submission)
    except PathwayAdvisorSubmission.DoesNotExist:
        raise HttpError(404, "Pathway submission not found")

