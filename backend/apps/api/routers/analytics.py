from ninja import Router
from ninja_jwt.authentication import JWTAuth
from typing import Optional
from pydantic import BaseModel
from apps.core.models import (
    PageView, ButtonClick, CRSCalculationDetailed, CRSCalculationSession,
    ConsultationRequest, PathwayAdvisorSubmission, CRSCalculation, ImmigrationReport
)
from ninja.errors import HttpError
from django.db.models import Count, Avg

router = Router(tags=["Analytics"])


class PageViewCreateSchema(BaseModel):
    page_path: str
    page_title: Optional[str] = None
    user_agent: Optional[str] = None
    session_id: Optional[str] = None


class ButtonClickCreateSchema(BaseModel):
    button_label: str
    page_path: str
    session_id: Optional[str] = None


@router.post("/page-view", auth=None)
def track_page_view(request, payload: PageViewCreateSchema):
    """Track a page view (anonymous allowed)"""
    page_view = PageView.objects.create(
        page_path=payload.page_path,
        page_title=payload.page_title,
        user_agent=payload.user_agent or request.META.get('HTTP_USER_AGENT', ''),
        session_id=payload.session_id,
    )
    return {"id": str(page_view.id), "created_at": page_view.created_at.isoformat()}


@router.post("/button-click", auth=None)
def track_button_click(request, payload: ButtonClickCreateSchema):
    """Track a button click (anonymous allowed)"""
    button_click = ButtonClick.objects.create(
        button_label=payload.button_label,
        page_path=payload.page_path,
        session_id=payload.session_id,
    )
    return {"id": str(button_click.id), "created_at": button_click.created_at.isoformat()}


@router.get("/dashboard", auth=JWTAuth())
def get_dashboard_stats(request):
    """Get admin dashboard statistics (admin only)"""
    # Check if user is admin
    try:
        profile = request.user.profile
        if profile.role != 'admin':
            raise HttpError(403, "Only admins can access this endpoint")
    except:
        raise HttpError(403, "Only admins can access this endpoint")
    
    # Get counts
    total_page_views = PageView.objects.count()
    total_clicks = ButtonClick.objects.count()
    # Include both completed and partial calculations
    total_completed_calculations = CRSCalculationDetailed.objects.count()
    total_authenticated_calculations = CRSCalculation.objects.count()
    total_partial_sessions = CRSCalculationSession.objects.filter(is_completed=False).count()
    total_crs_calculations = total_completed_calculations + total_authenticated_calculations + total_partial_sessions
    total_consultations = ConsultationRequest.objects.count()
    total_pathway_submissions = PathwayAdvisorSubmission.objects.count()
    total_immigration_reports = ImmigrationReport.objects.count()
    
    # Get average CRS score (only from completed calculations)
    avg_score = CRSCalculationDetailed.objects.aggregate(
        avg_score=Avg('crs_score')
    )['avg_score'] or 0
    
    # Get recent calculations - combine completed, authenticated, and partial sessions
    recent_completed = CRSCalculationDetailed.objects.order_by('-created_at')[:20]
    recent_authenticated = CRSCalculation.objects.order_by('-created_at')[:20]
    recent_partial = CRSCalculationSession.objects.filter(is_completed=False).order_by('-last_activity')[:20]
    
    # Get recent immigration reports (separate from calculations)
    recent_reports = ImmigrationReport.objects.order_by('-created_at')[:10]
    
    # Combine and format only CRS calculations (no immigration reports)
    recent_calculations = []
    
    # Add completed detailed calculations
    for calc in recent_completed:
        recent_calculations.append({
            "id": str(calc.id),
            "type": "completed",
            "user_name": calc.user_name,
            "user_email": calc.user_email,
            "user_phone": calc.user_phone,
            "crs_score": calc.crs_score,
            "input_data": calc.input_data,
            "category_breakdown": calc.category_breakdown,
            "created_at": calc.created_at.isoformat(),
        })
    
    # Add authenticated calculations
    for calc in recent_authenticated:
        recent_calculations.append({
            "id": str(calc.id),
            "type": "authenticated",
            "user_name": calc.input_data.get('fullName', calc.user.email if calc.user else 'Unknown'),
            "user_email": calc.input_data.get('email', calc.user.email if calc.user else ''),
            "user_phone": calc.input_data.get('phone', ''),
            "crs_score": calc.score,
            "input_data": calc.input_data,
            "category_breakdown": calc.category_breakdown,
            "created_at": calc.created_at.isoformat(),
        })
    
    # Add partial sessions (people who started but didn't complete)
    for session in recent_partial:
        recent_calculations.append({
            "id": str(session.id),
            "type": "partial",
            "user_name": session.user_name or "Not provided",
            "user_email": session.user_email or "Not provided",
            "user_phone": session.user_phone or "",
            "crs_score": None,  # No score yet
            "current_step": session.current_step,
            "completed_steps": session.completed_steps,
            "input_data": session.partial_data,
            "category_breakdown": {},
            "created_at": session.created_at.isoformat(),
            "last_activity": session.last_activity.isoformat() if session.last_activity else session.created_at.isoformat(),
        })
    
    # Sort by created_at/last_activity descending and take top 50
    recent_calculations.sort(
        key=lambda x: x.get('last_activity', x.get('created_at', '')),
        reverse=True
    )
    recent_calculations = recent_calculations[:50]
    
    # Get recent consultations
    recent_consultations = ConsultationRequest.objects.order_by('-created_at')[:10]
    
    # Get recent pathway advisor submissions (separate from CRS calculations)
    recent_pathway_submissions = PathwayAdvisorSubmission.objects.order_by('-created_at')[:50]
    
    # Get top pages (last 100 page views)
    recent_page_views = PageView.objects.order_by('-created_at')[:100]
    page_counts = {}
    for view in recent_page_views:
        page_counts[view.page_path] = page_counts.get(view.page_path, 0) + 1
    
    top_pages = [
        {"page": page, "count": count}
        for page, count in sorted(page_counts.items(), key=lambda x: x[1], reverse=True)[:5]
    ]
    
    # Get top buttons
    all_clicks = ButtonClick.objects.all()
    button_counts = {}
    for click in all_clicks:
        button_counts[click.button_label] = button_counts.get(click.button_label, 0) + 1
    
    top_buttons = [
        {"button": button, "count": count}
        for button, count in sorted(button_counts.items(), key=lambda x: x[1], reverse=True)[:5]
    ]
    
    return {
        "totalPageViews": total_page_views,
        "totalClicks": total_clicks,
        "totalCRSCalculations": total_crs_calculations,
        "avgCRSScore": int(round(avg_score)) if avg_score else 0,
        "totalConsultations": total_consultations,
        "totalPathwaySubmissions": total_pathway_submissions,
        "totalImmigrationReports": total_immigration_reports,
        "recentCalculations": recent_calculations,  # Already formatted as list of dicts above
        "recentConsultations": [
            {
                "id": str(consult.id),
                "user_name": consult.user_name,
                "user_email": consult.user_email,
                "user_phone": consult.user_phone,
                "consultation_type": consult.consultation_type,
                "preferred_date": consult.preferred_date.isoformat(),
                "preferred_time": consult.preferred_time,
                "status": consult.status,
                "created_at": consult.created_at.isoformat(),
            }
            for consult in recent_consultations
        ],
        "topPages": top_pages,
        "topButtons": top_buttons,
        "recentReports": [
            {
                "id": str(report.id),
                "user_name": report.user_name,
                "user_email": report.user_email,
                "user_phone": report.user_phone,
                "pathway_goal": report.pathway_goal,
                "pdf_url": report.pdf_url,
                "ai_model_used": report.ai_model_used,
                "created_at": report.created_at.isoformat(),
            }
            for report in recent_reports
        ],
        "recentPathwaySubmissions": [
            {
                "id": str(submission.id),
                "user_name": submission.user_name,
                "user_email": submission.user_email,
                "user_phone": submission.user_phone,
                "pathway_goal": submission.pathway_goal,
                "education_level": submission.education_level,
                "work_experience_years": float(submission.work_experience_years) if submission.work_experience_years else 0,
                "citizenship_country": submission.citizenship_country,
                "residence_country": submission.residence_country,
                "has_job_offer": submission.has_job_offer,
                "has_canadian_experience": submission.has_canadian_experience,
                "has_canadian_relative": submission.has_canadian_relative,
                "available_funds": float(submission.available_funds) if submission.available_funds else 0,
                "eligibility_results": submission.eligibility_results,
                "created_at": submission.created_at.isoformat(),
            }
            for submission in recent_pathway_submissions
        ],
    }

