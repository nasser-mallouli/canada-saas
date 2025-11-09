# Migration Status: Database Schema

## ✅ All Tables Migrated

All 13 tables have been converted to Django models:

### Core Tables:
1. ✅ **user_profiles** → `UserProfile` model
2. ✅ **crs_calculations** → `CRSCalculation` model
3. ✅ **crs_calculations_detailed** → `CRSCalculationDetailed` model
4. ✅ **roadmaps** → `Roadmap` model
5. ✅ **service_bookings** → `ServiceBooking` model
6. ✅ **consultation_bookings** → `ConsultationBooking` model
7. ✅ **consultation_requests** → `ConsultationRequest` model
8. ✅ **pathway_advisor_submissions** → `PathwayAdvisorSubmission` model
9. ✅ **marketplace_waitlist** → `MarketplaceWaitlist` model
10. ✅ **agent_notes** → `AgentNote` model
11. ✅ **pdf_generations** → `PDFGeneration` model
12. ✅ **page_views** → `PageView` model
13. ✅ **button_clicks** → `ButtonClick` model

## Creating Django Migrations

To create Django migrations from these models:

```bash
cd backend
python manage.py makemigrations core
python manage.py migrate
```

## Model Field Mappings

- **UUID fields**: All `id` fields use `UUIDField` with `uuid.uuid4` default
- **JSON fields**: All JSON fields → `JSONField` in Django
- **Timestamps**: `DateTimeField` with `auto_now_add`/`auto_now`
- **Foreign Keys**: Properly mapped with `ForeignKey` and `OneToOneField`
- **Constraints**: Check constraints converted to Django model choices
- **Defaults**: All default values preserved

## Database Table Names

All models use `db_table` Meta option to match table names exactly:
- Ensures compatibility if you need to migrate existing data
- Table names match: `user_profiles`, `crs_calculations`, etc.

## Next Steps

1. **Create migrations**: `python manage.py makemigrations core`
2. **Apply migrations**: `python manage.py migrate`
3. **Verify tables**: Check that all 13 tables are created in your database
4. **Data migration** (if needed): If you have existing data, create a data migration script
