from django.db import models
from django.contrib.auth.models import User
import uuid
import json


class UserProfile(models.Model):
    ROLE_CHOICES = [
        ('user', 'User'),
        ('agent', 'Agent'),
        ('admin', 'Admin'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    full_name = models.CharField(max_length=255)
    phone = models.CharField(max_length=20, blank=True, null=True)
    target_province = models.CharField(max_length=100, blank=True, null=True)
    target_city = models.CharField(max_length=100, blank=True, null=True)
    planned_arrival_date = models.DateField(blank=True, null=True)
    current_location = models.CharField(max_length=255, blank=True, null=True)
    immigration_status = models.CharField(max_length=100, blank=True, null=True)
    language_preference = models.CharField(max_length=10, default='en')
    notification_settings = models.JSONField(default=dict, blank=True)
    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default='user')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'user_profiles'

    def __str__(self):
        return f"{self.full_name} ({self.role})"


class CRSCalculation(models.Model):
    STATUS_CHOICES = [
        ('completed', 'Completed'),
        ('pending', 'Pending'),
        ('failed', 'Failed'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='crs_calculations')
    calculation_date = models.DateTimeField(auto_now_add=True)
    score = models.IntegerField()
    category_breakdown = models.JSONField(default=dict)
    input_data = models.JSONField(default=dict)
    is_latest = models.BooleanField(default=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='completed')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'crs_calculations'
        ordering = ['-created_at']

    def __str__(self):
        return f"CRS Calculation {self.score} pts - {self.created_at}"


class CRSCalculationDetailed(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user_name = models.CharField(max_length=255)
    user_email = models.EmailField()
    user_phone = models.CharField(max_length=20, blank=True, null=True)
    input_data = models.JSONField(default=dict)
    crs_score = models.IntegerField()
    category_breakdown = models.JSONField(default=dict)
    improvement_suggestions = models.JSONField(default=list, blank=True, null=True)
    session_id = models.CharField(max_length=255, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'crs_calculations_detailed'
        ordering = ['-created_at']

    def __str__(self):
        return f"CRS Detailed {self.crs_score} pts - {self.user_email}"


class ImmigrationReport(models.Model):
    """Store AI-generated immigration eligibility reports"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user_name = models.CharField(max_length=255, blank=True, null=True)
    user_email = models.EmailField(blank=True, null=True)
    user_phone = models.CharField(max_length=20, blank=True, null=True)
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='immigration_reports')
    # Input profile data
    profile_data = models.JSONField(default=dict)  # Stores ImmigrationProfileSchema data
    # Generated content
    report_markdown = models.TextField()  # The generated markdown report
    pdf_filename = models.CharField(max_length=255, blank=True, null=True)
    pdf_path = models.CharField(max_length=500, blank=True, null=True)
    pdf_url = models.CharField(max_length=500, blank=True, null=True)
    # Metadata
    pathway_goal = models.CharField(max_length=100, blank=True, null=True)  # Express Entry, Study Visa, etc.
    ai_model_used = models.CharField(max_length=100, blank=True, null=True)  # minimax/minimax-m2:free
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'immigration_reports'
        ordering = ['-created_at']

    def __str__(self):
        return f"Immigration Report - {self.user_email or 'Anonymous'} - {self.pathway_goal or 'N/A'}"


class CRSCalculationSession(models.Model):
    """Track partial calculator progress for users who start but don't complete"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    session_id = models.CharField(max_length=255, unique=True, db_index=True)
    user_name = models.CharField(max_length=255, blank=True, null=True)
    user_email = models.EmailField(blank=True, null=True)
    user_phone = models.CharField(max_length=20, blank=True, null=True)
    current_step = models.CharField(max_length=50, default='user-info')  # user-info, age, education, etc.
    completed_steps = models.JSONField(default=list)  # List of completed step IDs
    partial_data = models.JSONField(default=dict)  # Partial form data collected so far
    is_completed = models.BooleanField(default=False)  # True when calculation is finished
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    last_activity = models.DateTimeField(auto_now=True)  # Track when user last interacted

    class Meta:
        db_table = 'crs_calculation_sessions'
        ordering = ['-last_activity']

    def __str__(self):
        return f"Session {self.session_id[:8]}... - Step: {self.current_step}"


class Roadmap(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    calculation = models.ForeignKey(CRSCalculation, on_delete=models.CASCADE, related_name='roadmaps')
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='roadmaps')
    markdown_content = models.TextField()
    generation_date = models.DateTimeField(auto_now_add=True)
    llm_model_used = models.CharField(max_length=100, blank=True, null=True)
    satisfaction_rating = models.IntegerField(blank=True, null=True)
    regeneration_count = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'roadmaps'

    def __str__(self):
        return f"Roadmap for {self.calculation}"


class ServiceBooking(models.Model):
    SERVICE_TYPE_CHOICES = [
        ('information_session', 'Information Session'),
        ('settlement_support', 'Settlement Support'),
    ]

    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('confirmed', 'Confirmed'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='service_bookings')
    service_type = models.CharField(max_length=50, choices=SERVICE_TYPE_CHOICES)
    booking_date = models.DateTimeField(auto_now_add=True)
    scheduled_datetime = models.DateTimeField(blank=True, null=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    assigned_agent = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='assigned_bookings')
    selected_services = models.JSONField(default=list)
    pricing_details = models.JSONField(default=dict, blank=True, null=True)
    notes = models.TextField(blank=True, null=True)
    specific_topics = models.JSONField(default=list)
    arrival_details = models.JSONField(default=dict, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'service_bookings'

    def __str__(self):
        return f"{self.service_type} - {self.user.username}"


class ConsultationBooking(models.Model):
    STATUS_CHOICES = [
        ('scheduled', 'Scheduled'),
        ('in_progress', 'In Progress'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
        ('no_show', 'No Show'),
    ]

    PAYMENT_STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('paid', 'Paid'),
        ('refunded', 'Refunded'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='consultation_bookings')
    calculation = models.ForeignKey(CRSCalculation, on_delete=models.SET_NULL, null=True, blank=True, related_name='consultation_bookings')
    consultation_type = models.CharField(max_length=100)
    consultant = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='consultations')
    scheduled_datetime = models.DateTimeField()
    duration_minutes = models.IntegerField(default=60)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='scheduled')
    payment_status = models.CharField(max_length=20, choices=PAYMENT_STATUS_CHOICES, default='pending')
    meeting_link = models.URLField(blank=True, null=True)
    recording_url = models.URLField(blank=True, null=True)
    summary = models.TextField(blank=True, null=True)
    questions = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'consultation_bookings'

    def __str__(self):
        return f"{self.consultation_type} - {self.user.username}"


class ConsultationRequest(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('confirmed', 'Confirmed'),
        ('connected', 'Connected'),
        ('completed', 'Completed'),
        ('done', 'Done'),
        ('cancelled', 'Cancelled'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user_name = models.CharField(max_length=255)
    user_email = models.EmailField()
    user_phone = models.CharField(max_length=20, blank=True, null=True)
    consultation_type = models.CharField(max_length=100)
    consultation_reason = models.TextField()
    preferred_date = models.DateField()
    preferred_time = models.CharField(max_length=20)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'consultation_requests'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.consultation_type} - {self.user_email}"


class PathwayAdvisorSubmission(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user_name = models.CharField(max_length=255, blank=True, null=True)
    user_email = models.EmailField(blank=True, null=True)
    user_phone = models.CharField(max_length=20, blank=True, null=True)
    birth_date = models.DateField(blank=True, null=True)
    citizenship_country = models.CharField(max_length=100, blank=True, null=True)
    residence_country = models.CharField(max_length=100, blank=True, null=True)
    education_level = models.CharField(max_length=100, blank=True, null=True)
    work_experience_years = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    field_of_study = models.CharField(max_length=255, blank=True, null=True)
    language_tests = models.JSONField(default=list)
    marital_status = models.CharField(max_length=50, blank=True, null=True)
    has_canadian_relative = models.BooleanField(default=False)
    has_job_offer = models.BooleanField(default=False)
    has_canadian_experience = models.BooleanField(default=False)
    has_police_record = models.BooleanField(default=False)
    available_funds = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    pathway_goal = models.CharField(max_length=50, blank=True, null=True)
    pathway_specific_data = models.JSONField(default=dict)
    eligibility_results = models.JSONField(default=dict)
    current_step = models.CharField(max_length=50, blank=True, null=True)  # Track current step
    is_completed = models.BooleanField(default=False)  # True when submission is complete
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'pathway_advisor_submissions'
        ordering = ['-created_at']

    def __str__(self):
        return f"Pathway Submission - {self.user_email}"


class MarketplaceWaitlist(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='waitlist_entries')
    email = models.EmailField()
    service_types = models.JSONField(default=list)
    signup_date = models.DateTimeField(auto_now_add=True)
    notified = models.BooleanField(default=False)
    preferences = models.JSONField(default=dict)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'marketplace_waitlist'

    def __str__(self):
        return f"Waitlist - {self.email}"


class AgentNote(models.Model):
    NOTE_TYPE_CHOICES = [
        ('consultation', 'Consultation'),
        ('follow_up', 'Follow Up'),
        ('internal', 'Internal'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    booking_id = models.UUIDField(blank=True, null=True)
    agent = models.ForeignKey(User, on_delete=models.CASCADE, related_name='agent_notes')
    note_content = models.TextField()
    note_type = models.CharField(max_length=20, choices=NOTE_TYPE_CHOICES, blank=True, null=True)
    is_private = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'agent_notes'

    def __str__(self):
        return f"Note by {self.agent.username}"


class PDFGeneration(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('completed', 'Completed'),
        ('failed', 'Failed'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='pdf_generations')
    roadmap = models.ForeignKey(Roadmap, on_delete=models.CASCADE, related_name='pdf_generations')
    generation_date = models.DateTimeField(auto_now_add=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    file_path = models.CharField(max_length=500, blank=True, null=True)
    file_size = models.IntegerField(blank=True, null=True)
    download_count = models.IntegerField(default=0)
    error_message = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'pdf_generations'

    def __str__(self):
        return f"PDF Generation - {self.status}"


class PageView(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    page_path = models.CharField(max_length=500)
    page_title = models.CharField(max_length=255, blank=True, null=True)
    user_agent = models.TextField(blank=True, null=True)
    session_id = models.CharField(max_length=255, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'page_views'
        ordering = ['-created_at']

    def __str__(self):
        return f"Page View - {self.page_path}"


class ButtonClick(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    button_label = models.CharField(max_length=255)
    page_path = models.CharField(max_length=500)
    session_id = models.CharField(max_length=255, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'button_clicks'
        ordering = ['-created_at']

    def __str__(self):
        return f"Button Click - {self.button_label}"

