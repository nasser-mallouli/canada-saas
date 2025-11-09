# Database Migrations Guide

## ✅ All Database Tables Are Covered

All 13 tables have been created as Django models:

| Table Name | Django Model | Status |
|------------|--------------|--------|
| user_profiles | UserProfile | ✅ |
| crs_calculations | CRSCalculation | ✅ |
| crs_calculations_detailed | CRSCalculationDetailed | ✅ |
| roadmaps | Roadmap | ✅ |
| service_bookings | ServiceBooking | ✅ |
| consultation_bookings | ConsultationBooking | ✅ |
| consultation_requests | ConsultationRequest | ✅ |
| pathway_advisor_submissions | PathwayAdvisorSubmission | ✅ |
| marketplace_waitlist | MarketplaceWaitlist | ✅ |
| agent_notes | AgentNote | ✅ |
| pdf_generations | PDFGeneration | ✅ |
| page_views | PageView | ✅ |
| button_clicks | ButtonClick | ✅ |

## Creating Django Migrations

To create Django migrations from these models:

```bash
cd backend
python manage.py makemigrations core
python manage.py migrate
```

## Model Field Mappings

- **UUID fields**: All `id` fields use `UUIDField` with `uuid.uuid4` default
- **JSON fields**: All JSON fields use `JSONField` in Django
- **Timestamps**: `DateTimeField` with `auto_now_add`/`auto_now`
- **Foreign Keys**: Properly mapped with `ForeignKey` and `OneToOneField`
- **Constraints**: Check constraints converted to Django model choices
- **Defaults**: All default values preserved

## Database Table Names

All models use `db_table` Meta option to match table names exactly:
- Table names: `user_profiles`, `crs_calculations`, etc.

## Next Steps

1. **Create migrations**: `python manage.py makemigrations core`
2. **Apply migrations**: `python manage.py migrate`
3. **Verify tables**: Check that all 13 tables are created in your database
4. **Data migration** (if needed): If you have existing data, create a data migration script
