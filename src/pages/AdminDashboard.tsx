import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Users, Calculator, LogOut, MessageSquare, BarChart3, Activity, FileText, Route
} from 'lucide-react';
import { api } from '../lib/api';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/Button';
import { Overview } from '../components/admin/overview/Overview';
import { Calculations } from '../components/admin/calculations/Calculations';
import { PathwayAdvisor } from '../components/admin/pathway-advisor/PathwayAdvisor';
import { Consultations } from '../components/admin/consultations/Consultations';
import { Analytics } from '../components/admin/analytics/Analytics';
import { Users as UsersComponent } from '../components/admin/users/Users';
import { Reports } from '../components/admin/reports/Reports';

interface DashboardStats {
  totalPageViews: number;
  totalClicks: number;
  totalCRSCalculations: number;
  avgCRSScore: number;
  totalConsultations: number;
  totalPathwaySubmissions: number;
  totalImmigrationReports?: number;
  recentCalculations: any[];
  recentConsultations: any[];
  recentReports?: any[];
  recentPathwaySubmissions?: any[];
  recentPageViews: any[];
  topPages: { page: string; count: number }[];
  topButtons: { button: string; count: number }[];
}

export function AdminDashboard() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const tabFromUrl = searchParams.get('tab') as 'overview' | 'calculations' | 'pathway-advisor' | 'consultations' | 'analytics' | 'users' | 'reports' | null;
  const [activeTab, setActiveTab] = useState<'overview' | 'calculations' | 'pathway-advisor' | 'consultations' | 'analytics' | 'users' | 'reports'>(
    tabFromUrl || 'overview'
  );
  const [users, setUsers] = useState<any[]>([]);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [userLoading, setUserLoading] = useState(false);
  const { signOut } = useAuth();
  const navigate = useNavigate();

  // Update activeTab when URL changes (e.g., when navigating back)
  useEffect(() => {
    if (tabFromUrl && tabFromUrl !== activeTab) {
      setActiveTab(tabFromUrl);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tabFromUrl]);

  // Update URL when tab changes (but not on initial load)
  const handleTabChange = (tab: 'overview' | 'calculations' | 'pathway-advisor' | 'consultations' | 'analytics' | 'users' | 'reports') => {
    setActiveTab(tab);
    setSearchParams({ tab });
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  useEffect(() => {
    if (activeTab === 'users') {
      fetchUsers();
    }
  }, [activeTab]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      const dashboardData = await api.get('/api/analytics/dashboard');

      setStats({
        totalPageViews: dashboardData.totalPageViews || 0,
        totalClicks: dashboardData.totalClicks || 0,
        totalCRSCalculations: dashboardData.totalCRSCalculations || 0,
        avgCRSScore: dashboardData.avgCRSScore || 0,
        totalConsultations: dashboardData.totalConsultations || 0,
        totalPathwaySubmissions: dashboardData.totalPathwaySubmissions || 0,
        totalImmigrationReports: dashboardData.totalImmigrationReports || 0,
        recentCalculations: dashboardData.recentCalculations || [],
        recentConsultations: dashboardData.recentConsultations || [],
        recentReports: dashboardData.recentReports || [],
        recentPathwaySubmissions: dashboardData.recentPathwaySubmissions || [],
        recentPageViews: [],
        topPages: dashboardData.topPages || [],
        topButtons: dashboardData.topButtons || [],
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      setUserLoading(true);
      const usersData = await api.get('/api/admin/users');
      setUsers(usersData || []);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setUserLoading(false);
    }
  };

  const fetchUserDetail = async (userId: number) => {
    try {
      setUserLoading(true);
      const userDetail = await api.get(`/api/admin/users/${userId}`);
      setSelectedUser(userDetail);
    } catch (error) {
      console.error('Error fetching user detail:', error);
    } finally {
      setUserLoading(false);
    }
  };

  const handleLogout = async () => {
    await signOut();
    navigate('/admin/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-secondary-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-secondary-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-secondary-50">
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm">
                <BarChart3 className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">Admin Dashboard</h1>
                <p className="text-primary-100 text-sm">Immigration Platform Analytics & Management</p>
              </div>
            </div>
            <Button
              onClick={handleLogout}
              variant="outline"
              size="sm"
              className="border-white/30 text-white hover:bg-white/10 hover:border-white"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-white rounded-xl shadow-sm border border-secondary-200 p-2 mb-8">
          <div className="flex gap-2 overflow-x-auto">
            <button
              onClick={() => handleTabChange('overview')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-all ${
                activeTab === 'overview'
                  ? 'bg-primary-600 text-white shadow-md'
                  : 'text-secondary-600 hover:bg-secondary-50'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              Overview
            </button>
            <button
              onClick={() => handleTabChange('calculations')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-all ${
                activeTab === 'calculations'
                  ? 'bg-primary-600 text-white shadow-md'
                  : 'text-secondary-600 hover:bg-secondary-50'
              }`}
            >
              <Calculator className="w-4 h-4" />
              CRS Calculations
            </button>
            <button
              onClick={() => handleTabChange('pathway-advisor')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-all ${
                activeTab === 'pathway-advisor'
                  ? 'bg-primary-600 text-white shadow-md'
                  : 'text-secondary-600 hover:bg-secondary-50'
              }`}
            >
              <Route className="w-4 h-4" />
              Pathway Advisor
            </button>
            <button
              onClick={() => handleTabChange('consultations')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-all ${
                activeTab === 'consultations'
                  ? 'bg-primary-600 text-white shadow-md'
                  : 'text-secondary-600 hover:bg-secondary-50'
              }`}
            >
              <MessageSquare className="w-4 h-4" />
              Consultations
            </button>
            <button
              onClick={() => handleTabChange('analytics')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-all ${
                activeTab === 'analytics'
                  ? 'bg-primary-600 text-white shadow-md'
                  : 'text-secondary-600 hover:bg-secondary-50'
              }`}
            >
              <Activity className="w-4 h-4" />
              Analytics
            </button>
            <button
              onClick={() => handleTabChange('users')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-all ${
                activeTab === 'users'
                  ? 'bg-primary-600 text-white shadow-md'
                  : 'text-secondary-600 hover:bg-secondary-50'
              }`}
            >
              <Users className="w-4 h-4" />
              Users
            </button>
            <button
              onClick={() => handleTabChange('reports')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-all ${
                activeTab === 'reports'
                  ? 'bg-primary-600 text-white shadow-md'
                  : 'text-secondary-600 hover:bg-secondary-50'
              }`}
            >
              <FileText className="w-4 h-4" />
              AI Reports
            </button>
          </div>
        </div>

        {activeTab === 'overview' && stats && <Overview stats={stats} />}

        {activeTab === 'calculations' && stats && <Calculations stats={stats} />}

        {activeTab === 'pathway-advisor' && stats && <PathwayAdvisor stats={stats} />}

        {activeTab === 'consultations' && stats && <Consultations stats={stats} />}

        {activeTab === 'analytics' && stats && <Analytics stats={stats} />}

        {activeTab === 'reports' && stats && <Reports stats={stats} />}

        {activeTab === 'users' && (
          <UsersComponent
            users={users}
            selectedUser={selectedUser}
            userLoading={userLoading}
            onUserSelect={fetchUserDetail}
            onBack={() => {
              setSelectedUser(null);
              fetchUsers();
            }}
          />
        )}
      </div>
    </div>
  );
}
