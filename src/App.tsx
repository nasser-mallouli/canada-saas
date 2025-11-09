import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
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
import { ComingSoon } from './pages/ComingSoon';

function AppContent() {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');

  return (
    <div className="flex flex-col min-h-screen">
      {!isAdminRoute && <Header />}
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/calculator" element={<Calculator />} />
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
              <Route
                path="/about"
                element={
                  <ComingSoon
                    title="About Us"
                    description="Learn more about our mission to help newcomers succeed in Canada."
                  />
                }
              />
              <Route
                path="/contact"
                element={
                  <ComingSoon
                    title="Contact Us"
                    description="Get in touch with our team for questions and support."
                  />
                }
              />
              <Route
                path="/privacy"
                element={
                  <ComingSoon
                    title="Privacy Policy"
                    description="Learn how we protect your personal information and respect your privacy."
                  />
                }
              />
              <Route
                path="/terms"
                element={
                  <ComingSoon
                    title="Terms of Service"
                    description="Read our terms of service and user agreement."
                  />
                }
              />
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
