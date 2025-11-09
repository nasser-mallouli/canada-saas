# Canada SaaS - Immigration Platform

A comprehensive Canadian immigration platform with CRS calculator, pathway advisor, consultation booking, and admin dashboard.

## Tech Stack

- **Frontend**: React + TypeScript + Vite + Tailwind CSS
- **Backend**: Django + Django Ninja (REST API)
- **Database**: SQLite (development) / PostgreSQL (production)
- **Authentication**: JWT tokens
- **Containerization**: Docker & Docker Compose

## Project Structure

```
canada-saas/
├── backend/              # Django backend
│   ├── apps/
│   │   ├── core/        # Models
│   │   └── api/         # API routers
│   ├── config/          # Django settings
│   └── manage.py
├── src/                 # React frontend
│   ├── components/
│   ├── pages/
│   ├── contexts/
│   └── lib/
├── docker-compose.yml
└── README.md
```

## Prerequisites

- **Python 3.11 or 3.12** (⚠️ NOT 3.14 - see compatibility note below)
- Node.js 20+
- Docker & Docker Compose (optional, for containerized setup)
- PostgreSQL (for production)

> **Note**: Python 3.14 is not compatible with `django-ninja-jwt` due to Pydantic v1 compatibility issues. Use Python 3.11 or 3.12 instead.

## Local Development Setup

### Backend Setup

1. **Navigate to backend directory:**
   ```bash
   cd backend
   ```

2. **Verify Python version (must be 3.11 or 3.12):**
   ```bash
   python --version  # Should show 3.11.x or 3.12.x
   ```
   
   If you have Python 3.14, install 3.11 or 3.12:
   ```bash
   pyenv install 3.11.9
   pyenv local 3.11.9
   ```

3. **Create virtual environment:**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

4. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

5. **Create `.env` file:**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` with your settings:
   ```env
   SECRET_KEY=your-secret-key-here
   DEBUG=True
   DATABASE_URL=  # Leave empty for SQLite
   CORS_ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000
   ```

6. **Create and run migrations:**
   ```bash
   # Create migrations from models (creates all 13 database tables)
   python manage.py makemigrations core
   
   # Apply migrations to database
   python manage.py migrate
   ```
   
   **Note**: This will create all 13 database tables:
   - user_profiles, crs_calculations, crs_calculations_detailed
   - roadmaps, service_bookings, consultation_bookings, consultation_requests
   - pathway_advisor_submissions, marketplace_waitlist, agent_notes
   - pdf_generations, page_views, button_clicks

7. **Create superuser (optional):**
   ```bash
   python manage.py createsuperuser
   ```

8. **Start development server:**
   
   **Option 1: Use the smart startup script (recommended):**
   ```bash
   cd backend
   ./start.sh
   ```
   
   Or from project root:
   ```bash
   ./start-backend.sh
   ```
   
   This script will:
   - Auto-detect best Python version (3.11 or 3.12)
   - Create/update virtual environment
   - Install dependencies
   - Run migrations
   - Start the server
   
   **Option 2: Manual start:**
   ```bash
   python manage.py runserver
   ```
   
   Backend will be available at `http://localhost:8001`
   API documentation (Swagger UI) at `http://localhost:8001/api/docs`

### Frontend Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Create `.env` file:**
   ```env
   VITE_API_URL=http://localhost:8001
   ```

3. **Start development server:**
   ```bash
   npm run dev
   ```
   
   Frontend will be available at `http://localhost:5173`

## Docker Setup

1. **Build and start all services:**
   ```bash
   docker-compose up --build
   ```

2. **Run migrations:**
   ```bash
   docker-compose exec backend python manage.py migrate
   ```

3. **Create superuser:**
   ```bash
   docker-compose exec backend python manage.py createsuperuser
   ```

4. **Access services:**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:8001
   - API Docs: http://localhost:8001/api/docs
   - Django Admin: http://localhost:8001/admin

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login and get JWT tokens
- `POST /api/auth/token/refresh/` - Refresh access token
- `GET /api/auth/me` - Get current user profile

### CRS Calculator
- `POST /api/crs/calculate` - Save CRS calculation (authenticated)
- `POST /api/crs/calculate-detailed` - Save detailed calculation (anonymous)
- `GET /api/crs/calculations` - Get user's calculations

### Consultation
- `POST /api/consultation/request` - Create consultation request
- `GET /api/consultation/requests` - List requests (admin only)

### Pathway Advisor
- `POST /api/pathway/submit` - Submit pathway advisor form
- `GET /api/pathway/submissions` - Get submissions (admin only)

### Analytics
- `POST /api/analytics/page-view` - Track page view
- `POST /api/analytics/button-click` - Track button click
- `GET /api/analytics/dashboard` - Get dashboard stats (admin only)

### Profile
- `GET /api/profile/` - Get user profile
- `PATCH /api/profile/` - Update user profile

## Database Models

- `UserProfile` - User profiles with roles (user/agent/admin)
- `CRSCalculation` - CRS score calculations
- `CRSCalculationDetailed` - Detailed calculations with user info
- `Roadmap` - AI-generated roadmaps
- `ServiceBooking` - Service bookings
- `ConsultationBooking` - Consultation bookings
- `ConsultationRequest` - Simple consultation requests
- `PathwayAdvisorSubmission` - Pathway advisor submissions
- `MarketplaceWaitlist` - Marketplace waitlist
- `AgentNote` - Agent notes
- `PDFGeneration` - PDF generation tracking
- `PageView` - Analytics: page views
- `ButtonClick` - Analytics: button clicks

## Environment Variables

### Backend (.env)
```env
SECRET_KEY=your-secret-key
DEBUG=True
DATABASE_URL=postgresql://user:pass@localhost:5432/dbname  # Optional, uses SQLite if not set
CORS_ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000
```

### Frontend (.env)
```env
VITE_API_URL=http://localhost:8001
```

## Production Deployment

1. **Set up PostgreSQL database**
2. **Update environment variables** (set `DEBUG=False`, configure `DATABASE_URL`)
3. **Run migrations**: `python manage.py migrate`
4. **Collect static files**: `python manage.py collectstatic`
5. **Set up reverse proxy** (nginx) for production
6. **Configure SSL certificates**
7. **Set up process manager** (systemd, supervisor, etc.)

## Admin Access

1. Create a superuser:
   ```bash
   python manage.py createsuperuser
   ```

2. Access Django admin at `/admin`

3. To set a user as admin, edit their `UserProfile` in Django admin and set `role` to `admin`

## Development Notes

- Backend uses SQLite by default for development
- JWT tokens are stored in localStorage
- API uses Django Ninja with automatic Swagger documentation
- CORS is configured for local development
- All API endpoints require authentication except where noted

## License

MIT
