from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.contrib.auth import get_user_model
from .models import (
    UserProfile, CRSCalculation, CRSCalculationDetailed, CRSCalculationSession, Roadmap,
    ServiceBooking, ConsultationBooking, ConsultationRequest,
    PathwayAdvisorSubmission, MarketplaceWaitlist, AgentNote,
    PDFGeneration, PageView, ButtonClick, ImmigrationReport
)

User = get_user_model()

# Unregister the default User admin if it's already registered
if admin.site.is_registered(User):
    admin.site.unregister(User)


# Inline admin for UserProfile
class UserProfileInline(admin.StackedInline):
    model = UserProfile
    can_delete = False
    verbose_name_plural = 'Profile'
    fields = ('full_name', 'role', 'phone', 'target_province', 'target_city', 'current_location', 'immigration_status')


# Customize User admin to include profile
@admin.register(User)
class UserAdmin(BaseUserAdmin):
    inlines = (UserProfileInline,)
    list_display = ('email', 'username', 'full_name', 'role', 'is_staff', 'is_active', 'date_joined')
    list_filter = ('is_staff', 'is_superuser', 'is_active', 'date_joined')
    search_fields = ('email', 'username', 'profile__full_name')
    
    def full_name(self, obj):
        try:
            return obj.profile.full_name
        except:
            return '-'
    full_name.short_description = 'Full Name'
    
    def role(self, obj):
        try:
            return obj.profile.role
        except:
            return '-'
    role.short_description = 'Role'
    
    actions = ['make_admin', 'make_agent', 'make_user']
    
    def make_admin(self, request, queryset):
        for user in queryset:
            profile, _ = UserProfile.objects.get_or_create(user=user, defaults={'full_name': user.email})
            profile.role = 'admin'
            profile.save()
            user.is_staff = True
            user.save()
        self.message_user(request, f"Promoted {queryset.count()} user(s) to admin.")
    make_admin.short_description = "Promote selected users to admin"
    
    def make_agent(self, request, queryset):
        for user in queryset:
            profile, _ = UserProfile.objects.get_or_create(user=user, defaults={'full_name': user.email})
            profile.role = 'agent'
            profile.save()
        self.message_user(request, f"Promoted {queryset.count()} user(s) to agent.")
    make_agent.short_description = "Promote selected users to agent"
    
    def make_user(self, request, queryset):
        for user in queryset:
            profile, _ = UserProfile.objects.get_or_create(user=user, defaults={'full_name': user.email})
            profile.role = 'user'
            profile.save()
            user.is_staff = False
            user.save()
        self.message_user(request, f"Demoted {queryset.count()} user(s) to regular user.")
    make_user.short_description = "Demote selected users to regular user"


@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    list_display = ('full_name', 'user', 'role', 'phone', 'target_province', 'created_at')
    list_filter = ('role', 'target_province', 'immigration_status', 'created_at')
    search_fields = ('full_name', 'user__email', 'phone', 'target_city')
    readonly_fields = ('id', 'created_at', 'updated_at')
    fieldsets = (
        ('User Information', {
            'fields': ('user', 'full_name', 'role', 'phone')
        }),
        ('Location Details', {
            'fields': ('target_province', 'target_city', 'current_location', 'planned_arrival_date')
        }),
        ('Immigration Details', {
            'fields': ('immigration_status', 'language_preference', 'notification_settings')
        }),
        ('Metadata', {
            'fields': ('id', 'created_at', 'updated_at')
        }),
    )
    
    actions = ['make_admin', 'make_agent', 'make_user']
    
    def make_admin(self, request, queryset):
        queryset.update(role='admin')
        # Also set is_staff for Django admin access
        for profile in queryset:
            profile.user.is_staff = True
            profile.user.save()
        self.message_user(request, f"Promoted {queryset.count()} profile(s) to admin.")
    make_admin.short_description = "Promote selected profiles to admin"
    
    def make_agent(self, request, queryset):
        queryset.update(role='agent')
        self.message_user(request, f"Promoted {queryset.count()} profile(s) to agent.")
    make_agent.short_description = "Promote selected profiles to agent"
    
    def make_user(self, request, queryset):
        queryset.update(role='user')
        for profile in queryset:
            profile.user.is_staff = False
            profile.user.save()
        self.message_user(request, f"Demoted {queryset.count()} profile(s) to regular user.")
    make_user.short_description = "Demote selected profiles to regular user"


@admin.register(CRSCalculation)
class CRSCalculationAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'score', 'status', 'is_latest', 'created_at')
    list_filter = ('status', 'is_latest', 'created_at')
    search_fields = ('user__email', 'user__username')
    readonly_fields = ('id', 'created_at', 'updated_at')
    date_hierarchy = 'created_at'
    
    fieldsets = (
        ('Calculation Info', {
            'fields': ('id', 'user', 'score', 'status', 'is_latest')
        }),
        ('Data', {
            'fields': ('category_breakdown', 'input_data')
        }),
        ('Timestamps', {
            'fields': ('calculation_date', 'created_at', 'updated_at')
        }),
    )


@admin.register(CRSCalculationDetailed)
class CRSCalculationDetailedAdmin(admin.ModelAdmin):
    list_display = ('user_name', 'user_email', 'user_phone', 'crs_score', 'created_at')
    list_filter = ('created_at',)
    search_fields = ('user_name', 'user_email', 'user_phone', 'session_id')
    readonly_fields = ('id', 'created_at')
    date_hierarchy = 'created_at'
    
    fieldsets = (
        ('User Information', {
            'fields': ('user_name', 'user_email', 'user_phone', 'session_id')
        }),
        ('Calculation Results', {
            'fields': ('crs_score', 'category_breakdown', 'improvement_suggestions')
        }),
        ('Input Data', {
            'fields': ('input_data',)
        }),
        ('Metadata', {
            'fields': ('id', 'created_at')
        }),
    )


@admin.register(CRSCalculationSession)
class CRSCalculationSessionAdmin(admin.ModelAdmin):
    list_display = ('session_id', 'user_email', 'current_step', 'is_completed', 'last_activity', 'created_at')
    list_filter = ('current_step', 'is_completed', 'created_at', 'last_activity')
    search_fields = ('session_id', 'user_name', 'user_email', 'user_phone')
    readonly_fields = ('id', 'created_at', 'updated_at', 'last_activity')
    date_hierarchy = 'last_activity'
    
    fieldsets = (
        ('Session Info', {
            'fields': ('id', 'session_id', 'is_completed', 'current_step', 'completed_steps')
        }),
        ('User Information', {
            'fields': ('user_name', 'user_email', 'user_phone')
        }),
        ('Progress Data', {
            'fields': ('partial_data',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at', 'last_activity')
        }),
    )


@admin.register(Roadmap)
class RoadmapAdmin(admin.ModelAdmin):
    list_display = ('id', 'calculation', 'user', 'created_at')
    list_filter = ('created_at',)


@admin.register(ServiceBooking)
class ServiceBookingAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'service_type', 'status', 'created_at')
    list_filter = ('service_type', 'status', 'created_at')


@admin.register(ConsultationBooking)
class ConsultationBookingAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'consultation_type', 'status', 'scheduled_datetime')
    list_filter = ('consultation_type', 'status', 'scheduled_datetime')


@admin.register(ConsultationRequest)
class ConsultationRequestAdmin(admin.ModelAdmin):
    list_display = ('user_name', 'user_email', 'user_phone', 'consultation_type', 'status', 'preferred_date', 'preferred_time', 'created_at')
    list_filter = ('consultation_type', 'status', 'preferred_date', 'created_at')
    search_fields = ('user_name', 'user_email', 'user_phone', 'consultation_reason')
    readonly_fields = ('id', 'created_at')
    date_hierarchy = 'created_at'
    
    fieldsets = (
        ('Contact Information', {
            'fields': ('user_name', 'user_email', 'user_phone')
        }),
        ('Consultation Details', {
            'fields': ('consultation_type', 'consultation_reason', 'status')
        }),
        ('Scheduling', {
            'fields': ('preferred_date', 'preferred_time')
        }),
        ('Metadata', {
            'fields': ('id', 'created_at')
        }),
    )
    
    actions = ['mark_confirmed', 'mark_completed', 'mark_cancelled']
    
    def mark_confirmed(self, request, queryset):
        queryset.update(status='confirmed')
        self.message_user(request, f"Marked {queryset.count()} request(s) as confirmed.")
    mark_confirmed.short_description = "Mark selected as confirmed"
    
    def mark_completed(self, request, queryset):
        queryset.update(status='completed')
        self.message_user(request, f"Marked {queryset.count()} request(s) as completed.")
    mark_completed.short_description = "Mark selected as completed"
    
    def mark_cancelled(self, request, queryset):
        queryset.update(status='cancelled')
        self.message_user(request, f"Marked {queryset.count()} request(s) as cancelled.")
    mark_cancelled.short_description = "Mark selected as cancelled"


@admin.register(PathwayAdvisorSubmission)
class PathwayAdvisorSubmissionAdmin(admin.ModelAdmin):
    list_display = ('user_name', 'user_email', 'pathway_goal', 'education_level', 'work_experience_years', 'created_at')
    list_filter = ('pathway_goal', 'education_level', 'has_job_offer', 'has_canadian_experience', 'created_at')
    search_fields = ('user_name', 'user_email', 'user_phone', 'field_of_study', 'citizenship_country')
    readonly_fields = ('id', 'created_at', 'updated_at')
    date_hierarchy = 'created_at'
    
    fieldsets = (
        ('Contact Information', {
            'fields': ('user_name', 'user_email', 'user_phone')
        }),
        ('Personal Details', {
            'fields': ('birth_date', 'citizenship_country', 'residence_country', 'marital_status')
        }),
        ('Education & Work', {
            'fields': ('education_level', 'field_of_study', 'work_experience_years')
        }),
        ('Language Tests', {
            'fields': ('language_tests',)
        }),
        ('Circumstances', {
            'fields': ('has_canadian_relative', 'has_job_offer', 'has_canadian_experience', 'has_police_record', 'available_funds')
        }),
        ('Pathway Details', {
            'fields': ('pathway_goal', 'pathway_specific_data', 'eligibility_results')
        }),
        ('Metadata', {
            'fields': ('id', 'created_at', 'updated_at')
        }),
    )


@admin.register(MarketplaceWaitlist)
class MarketplaceWaitlistAdmin(admin.ModelAdmin):
    list_display = ('email', 'notified', 'signup_date')
    list_filter = ('notified', 'signup_date')
    search_fields = ('email',)


@admin.register(AgentNote)
class AgentNoteAdmin(admin.ModelAdmin):
    list_display = ('id', 'agent', 'note_type', 'is_private', 'created_at')
    list_filter = ('note_type', 'is_private', 'created_at')


@admin.register(PDFGeneration)
class PDFGenerationAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'status', 'generation_date')
    list_filter = ('status', 'generation_date')


@admin.register(PageView)
class PageViewAdmin(admin.ModelAdmin):
    list_display = ('page_path', 'session_id', 'created_at')
    list_filter = ('created_at',)
    search_fields = ('page_path',)


@admin.register(ButtonClick)
class ButtonClickAdmin(admin.ModelAdmin):
    list_display = ('button_label', 'page_path', 'session_id', 'created_at')
    list_filter = ('created_at',)
    search_fields = ('button_label', 'page_path')


@admin.register(ImmigrationReport)
class ImmigrationReportAdmin(admin.ModelAdmin):
    list_display = ('user_name', 'user_email', 'pathway_goal', 'ai_model_used', 'created_at')
    list_filter = ('pathway_goal', 'ai_model_used', 'created_at')
    search_fields = ('user_name', 'user_email', 'user_phone', 'pathway_goal')
    readonly_fields = ('id', 'created_at', 'updated_at')
    date_hierarchy = 'created_at'
    
    fieldsets = (
        ('User Information', {
            'fields': ('user', 'user_name', 'user_email', 'user_phone')
        }),
        ('Report Details', {
            'fields': ('pathway_goal', 'ai_model_used', 'profile_data')
        }),
        ('Generated Content', {
            'fields': ('report_markdown', 'pdf_filename', 'pdf_url', 'pdf_path')
        }),
        ('Metadata', {
            'fields': ('id', 'created_at', 'updated_at')
        }),
    )

