from ninja import NinjaAPI

api = NinjaAPI(
    title="Canada SaaS API",
    description="API for Canadian Immigration Concierge Platform",
    version="1.0.0",
)

# Import routers
from apps.api.routers import auth, crs, consultation, pathway, analytics, profile, admin
from apps.ai_provider.router import router as ai_provider_router

# Include routers
api.add_router("/auth", auth.router)
api.add_router("/crs", crs.router)
api.add_router("/consultation", consultation.router)
api.add_router("/pathway", pathway.router)
api.add_router("/analytics", analytics.router)
api.add_router("/profile", profile.router)
api.add_router("/admin", admin.router)
api.add_router("/ai-provider", ai_provider_router)

