import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { AuthProvider } from './contexts/AuthContext';
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { Home } from './pages/Home';
import { Calculator } from './pages/Calculator';
import { ImmigrationPathways } from './pages/ImmigrationPathways';
import { ServicesMarketplace } from './pages/ServicesMarketplace';
import { PathwayAdvisor } from './pages/PathwayAdvisor';
import { PathwayAdvisorResults } from './pages/PathwayAdvisorResults';
import { ConsultationBooking } from './pages/ConsultationBooking';
import { AdminLogin } from './pages/AdminLogin';
import { AdminDashboard } from './pages/AdminDashboard';
import { CRSCalculationDetail } from './pages/CRSCalculationDetail';
import { ImmigrationReportDetail } from './pages/ImmigrationReportDetail';
import { PathwaySubmissionDetail } from './pages/PathwaySubmissionDetail';
import { ConsultationDetail } from './pages/ConsultationDetail';
import { ComingSoon } from './pages/ComingSoon';
import { Company } from './pages/Company';
import { AboutUs } from './pages/AboutUs';
import { PrivacyPolicy } from './pages/PrivacyPolicy';
import { TermsOfService } from './pages/TermsOfService';
import { Contact } from './pages/Contact';
import { trackPageView } from './utils/analytics';
import { useTranslation } from './i18n/useTranslation';

function AppContent() {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');
  const { isRTL } = useTranslation();

  // Track page views on route change
  useEffect(() => {
    // Don't track admin routes
    if (!isAdminRoute) {
      trackPageView(location.pathname, document.title);
    }
  }, [location.pathname, isAdminRoute]);

  return (
    <div className={`flex flex-col min-h-screen ${isRTL ? 'rtl' : 'ltr'}`} dir={isRTL ? 'rtl' : 'ltr'}>
      {!isAdminRoute && <Header />}
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/calculator" element={<Calculator />} />
            <Route path="/calculator/:id" element={<Calculator />} />
          <Route path="/pathways" element={<ImmigrationPathways />} />
          <Route path="/pathway-advisor" element={<PathwayAdvisor />} />
          <Route path="/pathway-advisor/results" element={<PathwayAdvisorResults />} />
          <Route path="/admin" element={<AdminLogin />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute requireAdmin>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/calculation/:id"
            element={
              <ProtectedRoute requireAdmin>
                <CRSCalculationDetail />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/report/:id"
            element={
              <ProtectedRoute requireAdmin>
                <ImmigrationReportDetail />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/pathway-submission/:id"
            element={
              <ProtectedRoute requireAdmin>
                <PathwaySubmissionDetail />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/consultation/:id"
            element={
              <ProtectedRoute requireAdmin>
                <ConsultationDetail />
              </ProtectedRoute>
            }
          />
              <Route
                path="/information-session"
                element={
                  <ComingSoon
                    title="Information & Guidance Session"
                    description="Book your pre-arrival consultation with our immigration experts. Learn about job search, CV writing, avoiding scams, and essential preparation."
                  />
                }
              />
              <Route
                path="/settlement-support"
                element={
                  <ComingSoon
                    title="Settlement Support Services"
                    description="Comprehensive post-arrival support including airport pickup, housing search, and essential services setup."
                  />
                }
              />
              <Route path="/services" element={<ServicesMarketplace />} />
              <Route path="/consultation" element={<ConsultationBooking />} />
              <Route
                path="/dashboard"
                element={
                  <ComingSoon
                    title="User Dashboard"
                    description="Track your CRS calculations, roadmaps, bookings, and documents all in one place."
                  />
                }
              />
              <Route
                path="/agent/dashboard"
                element={
                  <ComingSoon
                    title="Agent Dashboard"
                    description="Manage leads, consultations, and client communications efficiently."
                  />
                }
              />
              <Route path="/company" element={<Company />} />
              <Route path="/about" element={<AboutUs />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/privacy" element={<PrivacyPolicy />} />
              <Route path="/terms" element={<TermsOfService />} />
            </Routes>
          </main>
          {!isAdminRoute && <Footer />}
        </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
