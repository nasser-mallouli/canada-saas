import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users, Calculator, TrendingUp, LogOut, Mail, Phone, Calendar,
  MousePointerClick, Eye, FileText, MessageSquare, BarChart3,
  Activity, DollarSign, Target
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';

interface DashboardStats {
  totalPageViews: number;
  totalClicks: number;
  totalCRSCalculations: number;
  avgCRSScore: number;
  totalConsultations: number;
  totalPathwaySubmissions: number;
  recentCalculations: any[];
  recentConsultations: any[];
  recentPageViews: any[];
  topPages: { page: string; count: number }[];
  topButtons: { button: string; count: number }[];
}

export function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'calculations' | 'consultations' | 'analytics'>('overview');
  const { signOut } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      const [
        pageViewsResult,
        clicksResult,
        crsResult,
        consultationsResult,
        pathwayResult,
        recentPageViewsResult,
      ] = await Promise.all([
        supabase.from('page_views').select('*', { count: 'exact' }),
        supabase.from('button_clicks').select('*', { count: 'exact' }),
        supabase.from('crs_calculations_detailed').select('*').order('created_at', { ascending: false }),
        supabase.from('consultation_requests').select('*').order('created_at', { ascending: false }),
        supabase.from('pathway_advisor_submissions').select('*', { count: 'exact' }),
        supabase.from('page_views').select('page_path').order('created_at', { ascending: false }).limit(100),
      ]);

      const crsData = crsResult.data || [];
      const avgScore = crsData.length > 0
        ? Math.round(crsData.reduce((sum, calc) => sum + calc.crs_score, 0) / crsData.length)
        : 0;

      const pageViewCounts = (recentPageViewsResult.data || []).reduce((acc: any, view) => {
        acc[view.page_path] = (acc[view.page_path] || 0) + 1;
        return acc;
      }, {});

      const topPages = Object.entries(pageViewCounts)
        .map(([page, count]) => ({ page, count: count as number }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      const buttonClicksData = clicksResult.data || [];
      const buttonCounts = buttonClicksData.reduce((acc: any, click) => {
        acc[click.button_label] = (acc[click.button_label] || 0) + 1;
        return acc;
      }, {});

      const topButtons = Object.entries(buttonCounts)
        .map(([button, count]) => ({ button, count: count as number }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      setStats({
        totalPageViews: pageViewsResult.count || 0,
        totalClicks: clicksResult.count || 0,
        totalCRSCalculations: crsData.length,
        avgCRSScore: avgScore,
        totalConsultations: consultationsResult.data?.length || 0,
        totalPathwaySubmissions: pathwayResult.count || 0,
        recentCalculations: crsData.slice(0, 10),
        recentConsultations: consultationsResult.data?.slice(0, 10) || [],
        recentPageViews: recentPageViewsResult.data || [],
        topPages,
        topButtons,
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
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
              onClick={() => setActiveTab('overview')}
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
              onClick={() => setActiveTab('calculations')}
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
              onClick={() => setActiveTab('consultations')}
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
              onClick={() => setActiveTab('analytics')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-all ${
                activeTab === 'analytics'
                  ? 'bg-primary-600 text-white shadow-md'
                  : 'text-secondary-600 hover:bg-secondary-50'
              }`}
            >
              <Activity className="w-4 h-4" />
              Analytics
            </button>
          </div>
        </div>

        {activeTab === 'overview' && stats && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="bg-gradient-to-br from-primary-50 to-primary-100 border-primary-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-primary-700 mb-1">Total Page Views</p>
                    <p className="text-3xl font-bold text-primary-900">{stats.totalPageViews}</p>
                  </div>
                  <div className="w-12 h-12 bg-primary-200 rounded-full flex items-center justify-center">
                    <Eye className="w-6 h-6 text-primary-700" />
                  </div>
                </div>
              </Card>

              <Card className="bg-gradient-to-br from-success-50 to-success-100 border-success-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-success-700 mb-1">Button Clicks</p>
                    <p className="text-3xl font-bold text-success-900">{stats.totalClicks}</p>
                  </div>
                  <div className="w-12 h-12 bg-success-200 rounded-full flex items-center justify-center">
                    <MousePointerClick className="w-6 h-6 text-success-700" />
                  </div>
                </div>
              </Card>

              <Card className="bg-gradient-to-br from-info-50 to-info-100 border-info-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-info-700 mb-1">CRS Calculations</p>
                    <p className="text-3xl font-bold text-info-900">{stats.totalCRSCalculations}</p>
                    <p className="text-xs text-info-600">Avg: {stats.avgCRSScore} pts</p>
                  </div>
                  <div className="w-12 h-12 bg-info-200 rounded-full flex items-center justify-center">
                    <Calculator className="w-6 h-6 text-info-700" />
                  </div>
                </div>
              </Card>

              <Card className="bg-gradient-to-br from-warning-50 to-warning-100 border-warning-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-warning-700 mb-1">Consultations</p>
                    <p className="text-3xl font-bold text-warning-900">{stats.totalConsultations}</p>
                  </div>
                  <div className="w-12 h-12 bg-warning-200 rounded-full flex items-center justify-center">
                    <MessageSquare className="w-6 h-6 text-warning-700" />
                  </div>
                </div>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <h3 className="text-lg font-bold text-secondary-900 mb-4 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-primary-600" />
                  Top Pages
                </h3>
                <div className="space-y-3">
                  {stats.topPages.map((page, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="text-sm font-medium text-secondary-900">{page.page}</div>
                        <div className="w-full bg-secondary-200 rounded-full h-2 mt-1">
                          <div
                            className="bg-primary-600 h-2 rounded-full"
                            style={{ width: `${(page.count / stats.topPages[0].count) * 100}%` }}
                          />
                        </div>
                      </div>
                      <span className="ml-4 text-lg font-bold text-primary-600">{page.count}</span>
                    </div>
                  ))}
                </div>
              </Card>

              <Card>
                <h3 className="text-lg font-bold text-secondary-900 mb-4 flex items-center gap-2">
                  <MousePointerClick className="w-5 h-5 text-success-600" />
                  Top Button Clicks
                </h3>
                <div className="space-y-3">
                  {stats.topButtons.map((button, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="text-sm font-medium text-secondary-900">{button.button}</div>
                        <div className="w-full bg-secondary-200 rounded-full h-2 mt-1">
                          <div
                            className="bg-success-600 h-2 rounded-full"
                            style={{ width: `${(button.count / stats.topButtons[0].count) * 100}%` }}
                          />
                        </div>
                      </div>
                      <span className="ml-4 text-lg font-bold text-success-600">{button.count}</span>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </div>
        )}

        {activeTab === 'calculations' && stats && (
          <div className="space-y-6">
            <Card>
              <h3 className="text-xl font-bold text-secondary-900 mb-6">Recent CRS Calculations</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-secondary-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-secondary-500 uppercase">Date</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-secondary-500 uppercase">Name</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-secondary-500 uppercase">Email</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-secondary-500 uppercase">Score</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-secondary-500 uppercase">Age</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-secondary-500 uppercase">Education</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-secondary-500 uppercase">Details</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-secondary-200">
                    {stats.recentCalculations.map((calc) => (
                      <tr key={calc.id} className="hover:bg-secondary-50">
                        <td className="px-4 py-3 text-sm text-secondary-900">
                          {new Date(calc.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-3 text-sm font-medium text-secondary-900">{calc.user_name}</td>
                        <td className="px-4 py-3 text-sm text-secondary-600">{calc.user_email}</td>
                        <td className="px-4 py-3">
                          <Badge variant={calc.crs_score >= 500 ? 'success' : calc.crs_score >= 450 ? 'warning' : 'error'}>
                            {calc.crs_score} pts
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-sm text-secondary-600">{calc.input_data?.age}</td>
                        <td className="px-4 py-3 text-sm text-secondary-600">
                          {calc.input_data?.education?.replace(/_/g, ' ')}
                        </td>
                        <td className="px-4 py-3">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              alert(JSON.stringify(calc, null, 2));
                            }}
                          >
                            View
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        )}

        {activeTab === 'consultations' && stats && (
          <div className="space-y-6">
            <Card>
              <h3 className="text-xl font-bold text-secondary-900 mb-6">Consultation Requests</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-secondary-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-secondary-500 uppercase">Date</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-secondary-500 uppercase">Name</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-secondary-500 uppercase">Email</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-secondary-500 uppercase">Phone</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-secondary-500 uppercase">Type</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-secondary-500 uppercase">Date & Time</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-secondary-500 uppercase">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-secondary-200">
                    {stats.recentConsultations.map((consult) => (
                      <tr key={consult.id} className="hover:bg-secondary-50">
                        <td className="px-4 py-3 text-sm text-secondary-900">
                          {new Date(consult.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-3 text-sm font-medium text-secondary-900">{consult.user_name}</td>
                        <td className="px-4 py-3 text-sm text-secondary-600">{consult.user_email}</td>
                        <td className="px-4 py-3 text-sm text-secondary-600">{consult.user_phone || 'N/A'}</td>
                        <td className="px-4 py-3 text-sm text-secondary-600">
                          {consult.consultation_type?.replace(/-/g, ' ')}
                        </td>
                        <td className="px-4 py-3 text-sm text-secondary-600">
                          {new Date(consult.preferred_date).toLocaleDateString()} {consult.preferred_time}
                        </td>
                        <td className="px-4 py-3">
                          <Badge variant={consult.status === 'pending' ? 'warning' : 'success'}>
                            {consult.status}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        )}

        {activeTab === 'analytics' && stats && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="bg-gradient-to-br from-primary-50 to-primary-100">
                <Target className="w-8 h-8 text-primary-600 mb-3" />
                <p className="text-sm text-primary-700 mb-1">Conversion Rate</p>
                <p className="text-3xl font-bold text-primary-900">
                  {stats.totalPageViews > 0
                    ? ((stats.totalCRSCalculations / stats.totalPageViews) * 100).toFixed(1)
                    : 0}%
                </p>
                <p className="text-xs text-primary-600 mt-1">Visitors to Calculator</p>
              </Card>

              <Card className="bg-gradient-to-br from-success-50 to-success-100">
                <Activity className="w-8 h-8 text-success-600 mb-3" />
                <p className="text-sm text-success-700 mb-1">Engagement Rate</p>
                <p className="text-3xl font-bold text-success-900">
                  {stats.totalPageViews > 0
                    ? ((stats.totalClicks / stats.totalPageViews) * 100).toFixed(1)
                    : 0}%
                </p>
                <p className="text-xs text-success-600 mt-1">Clicks per View</p>
              </Card>

              <Card className="bg-gradient-to-br from-warning-50 to-warning-100">
                <DollarSign className="w-8 h-8 text-warning-600 mb-3" />
                <p className="text-sm text-warning-700 mb-1">Consultation Rate</p>
                <p className="text-3xl font-bold text-warning-900">
                  {stats.totalCRSCalculations > 0
                    ? ((stats.totalConsultations / stats.totalCRSCalculations) * 100).toFixed(1)
                    : 0}%
                </p>
                <p className="text-xs text-warning-600 mt-1">Calculator to Consultation</p>
              </Card>
            </div>

            <Card>
              <h3 className="text-lg font-bold text-secondary-900 mb-4">CRS Score Distribution</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { range: '0-449', color: 'error', count: stats.recentCalculations.filter(c => c.crs_score < 450).length },
                  { range: '450-499', color: 'warning', count: stats.recentCalculations.filter(c => c.crs_score >= 450 && c.crs_score < 500).length },
                  { range: '500-549', color: 'info', count: stats.recentCalculations.filter(c => c.crs_score >= 500 && c.crs_score < 550).length },
                  { range: '550+', color: 'success', count: stats.recentCalculations.filter(c => c.crs_score >= 550).length },
                ].map((bucket) => (
                  <div key={bucket.range} className="text-center p-4 bg-secondary-50 rounded-lg">
                    <p className="text-2xl font-bold text-secondary-900">{bucket.count}</p>
                    <p className="text-sm text-secondary-600">{bucket.range} points</p>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
