import { Target, Activity, MousePointerClick, Eye, Calculator, MessageSquare, Route, FileText, TrendingUp, BarChart3 } from 'lucide-react';
import { Card } from '../../ui/Card';
import { Badge } from '../../ui/Badge';

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
  recentPageViews: any[];
  topPages: { page: string; count: number }[];
  topButtons: { button: string; count: number }[];
}

interface AnalyticsProps {
  stats: DashboardStats;
}

export function Analytics({ stats }: AnalyticsProps) {
  // Calculate metrics
  const conversionRate = stats.totalPageViews > 0
    ? ((stats.totalCRSCalculations / stats.totalPageViews) * 100).toFixed(1)
    : '0.0';
  
  const engagementRate = stats.totalPageViews > 0
    ? ((stats.totalClicks / stats.totalPageViews) * 100).toFixed(1)
    : '0.0';
  
  const consultationRate = stats.totalCRSCalculations > 0
    ? ((stats.totalConsultations / stats.totalCRSCalculations) * 100).toFixed(1)
    : '0.0';

  // CRS Score Distribution
  const crsScores = stats.recentCalculations
    .filter((c: any) => c.crs_score !== null && c.crs_score !== undefined)
    .map((c: any) => c.crs_score);
  
  const scoreDistribution = [
    { range: '0-449', label: 'Below 450', color: 'error', count: crsScores.filter((s: number) => s < 450).length },
    { range: '450-499', label: '450-499', color: 'warning', count: crsScores.filter((s: number) => s >= 450 && s < 500).length },
    { range: '500-549', label: '500-549', color: 'info', count: crsScores.filter((s: number) => s >= 500 && s < 550).length },
    { range: '550+', label: '550+', color: 'success', count: crsScores.filter((s: number) => s >= 550).length },
  ];

  const totalScored = crsScores.length;
  const maxCount = Math.max(...scoreDistribution.map(d => d.count), 1);

  // Format page paths
  const formatPagePath = (path: string) => {
    if (path === '/') return 'Home';
    return path.split('/').filter(Boolean).map(part => 
      part.charAt(0).toUpperCase() + part.slice(1).replace(/-/g, ' ')
    ).join(' > ') || path;
  };

  return (
    <div className="space-y-6">
      {/* Key Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-primary-50 via-primary-50 to-primary-100 border-primary-300 shadow-md hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-primary-600 rounded-xl flex items-center justify-center shadow-lg">
              <Eye className="w-6 h-6 text-white" />
            </div>
            <Badge variant="info" className="text-xs">Total</Badge>
          </div>
          <p className="text-sm font-medium text-primary-700 mb-1">Page Views</p>
          <p className="text-3xl font-bold text-primary-900">{stats.totalPageViews.toLocaleString()}</p>
          <p className="text-xs text-primary-600 mt-2">All-time page views</p>
        </Card>

        <Card className="bg-gradient-to-br from-success-50 via-success-50 to-success-100 border-success-300 shadow-md hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-success-600 rounded-xl flex items-center justify-center shadow-lg">
              <MousePointerClick className="w-6 h-6 text-white" />
            </div>
            <Badge variant="success" className="text-xs">Total</Badge>
          </div>
          <p className="text-sm font-medium text-success-700 mb-1">Button Clicks</p>
          <p className="text-3xl font-bold text-success-900">{stats.totalClicks.toLocaleString()}</p>
          <p className="text-xs text-success-600 mt-2">User interactions</p>
        </Card>

        <Card className="bg-gradient-to-br from-info-50 via-info-50 to-info-100 border-info-300 shadow-md hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-info-600 rounded-xl flex items-center justify-center shadow-lg">
              <Calculator className="w-6 h-6 text-white" />
            </div>
            <Badge variant="info" className="text-xs">Total</Badge>
          </div>
          <p className="text-sm font-medium text-info-700 mb-1">CRS Calculations</p>
          <p className="text-3xl font-bold text-info-900">{stats.totalCRSCalculations.toLocaleString()}</p>
          <p className="text-xs text-info-600 mt-2">Completed calculations</p>
        </Card>

        <Card className="bg-gradient-to-br from-warning-50 via-warning-50 to-warning-100 border-warning-300 shadow-md hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-warning-600 rounded-xl flex items-center justify-center shadow-lg">
              <BarChart3 className="w-6 h-6 text-white" />
            </div>
            <Badge variant="warning" className="text-xs">Average</Badge>
          </div>
          <p className="text-sm font-medium text-warning-700 mb-1">Average CRS Score</p>
          <p className="text-3xl font-bold text-warning-900">{stats.avgCRSScore || 0}</p>
          <p className="text-xs text-warning-600 mt-2">Out of 1200 points</p>
        </Card>
      </div>

      {/* Conversion Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-gradient-to-br from-primary-50 to-primary-100 border-primary-200">
          <div className="flex items-center gap-3 mb-3">
            <Target className="w-6 h-6 text-primary-600" />
            <h3 className="text-lg font-bold text-primary-900">Conversion Rate</h3>
          </div>
          <div className="flex items-baseline gap-2">
            <p className="text-4xl font-bold text-primary-900">{conversionRate}%</p>
          </div>
          <p className="text-sm text-primary-700 mt-2">Visitors who used the calculator</p>
          <div className="mt-4 bg-primary-200 rounded-full h-2">
            <div 
              className="bg-primary-600 h-2 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(parseFloat(conversionRate), 100)}%` }}
            />
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-success-50 to-success-100 border-success-200">
          <div className="flex items-center gap-3 mb-3">
            <Activity className="w-6 h-6 text-success-600" />
            <h3 className="text-lg font-bold text-success-900">Engagement Rate</h3>
          </div>
          <div className="flex items-baseline gap-2">
            <p className="text-4xl font-bold text-success-900">{engagementRate}%</p>
          </div>
          <p className="text-sm text-success-700 mt-2">Clicks per page view</p>
          <div className="mt-4 bg-success-200 rounded-full h-2">
            <div 
              className="bg-success-600 h-2 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(parseFloat(engagementRate), 100)}%` }}
            />
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-warning-50 to-warning-100 border-warning-200">
          <div className="flex items-center gap-3 mb-3">
            <TrendingUp className="w-6 h-6 text-warning-600" />
            <h3 className="text-lg font-bold text-warning-900">Consultation Rate</h3>
          </div>
          <div className="flex items-baseline gap-2">
            <p className="text-4xl font-bold text-warning-900">{consultationRate}%</p>
          </div>
          <p className="text-sm text-warning-700 mt-2">Calculator users who booked</p>
          <div className="mt-4 bg-warning-200 rounded-full h-2">
            <div 
              className="bg-warning-600 h-2 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(parseFloat(consultationRate), 100)}%` }}
            />
          </div>
        </Card>
      </div>

      {/* CRS Score Distribution */}
      <Card>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-bold text-secondary-900">CRS Score Distribution</h3>
            <p className="text-sm text-secondary-600 mt-1">Distribution of calculated CRS scores</p>
          </div>
          <Badge variant="info">Total Scored: {totalScored}</Badge>
        </div>
        <div className="space-y-4">
          {scoreDistribution.map((bucket) => {
            const percentage = totalScored > 0 ? (bucket.count / totalScored) * 100 : 0;
            const barWidth = totalScored > 0 ? (bucket.count / maxCount) * 100 : 0;
            
            return (
              <div key={bucket.range} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Badge variant={bucket.color as any} className="min-w-[80px] text-center">
                      {bucket.label}
                    </Badge>
                    <span className="text-sm text-secondary-600">{bucket.count} calculations</span>
                  </div>
                  <span className="text-sm font-medium text-secondary-900">{percentage.toFixed(1)}%</span>
                </div>
                <div className="bg-secondary-100 rounded-full h-4 overflow-hidden">
                  <div
                    className={`h-full transition-all duration-500 ${
                      bucket.color === 'error' ? 'bg-error-500' :
                      bucket.color === 'warning' ? 'bg-warning-500' :
                      bucket.color === 'info' ? 'bg-info-500' :
                      'bg-success-500'
                    }`}
                    style={{ width: `${barWidth}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Top Pages and Buttons */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Pages */}
        <Card>
          <div className="flex items-center gap-3 mb-6">
            <FileText className="w-5 h-5 text-info-600" />
            <h3 className="text-xl font-bold text-secondary-900">Top Pages</h3>
          </div>
          {stats.topPages && stats.topPages.length > 0 ? (
            <div className="space-y-3">
              {stats.topPages.map((page, index) => {
                const maxViews = Math.max(...stats.topPages.map(p => p.count), 1);
                const percentage = (page.count / maxViews) * 100;
                
                return (
                  <div key={page.page} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="min-w-[24px] text-center">
                          {index + 1}
                        </Badge>
                        <span className="text-sm font-medium text-secondary-900 truncate flex-1">
                          {formatPagePath(page.page)}
                        </span>
                      </div>
                      <span className="text-sm font-bold text-secondary-900">{page.count}</span>
                    </div>
                    <div className="bg-secondary-100 rounded-full h-2">
                      <div
                        className="bg-info-500 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-secondary-600 text-center py-8">No page view data available</p>
          )}
        </Card>

        {/* Top Buttons */}
        <Card>
          <div className="flex items-center gap-3 mb-6">
            <MousePointerClick className="w-5 h-5 text-success-600" />
            <h3 className="text-xl font-bold text-secondary-900">Top Button Clicks</h3>
          </div>
          {stats.topButtons && stats.topButtons.length > 0 ? (
            <div className="space-y-3">
              {stats.topButtons.map((button, index) => {
                const maxClicks = Math.max(...stats.topButtons.map(b => b.count), 1);
                const percentage = (button.count / maxClicks) * 100;
                
                return (
                  <div key={button.button} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="min-w-[24px] text-center">
                          {index + 1}
                        </Badge>
                        <span className="text-sm font-medium text-secondary-900 truncate flex-1">
                          {button.button}
                        </span>
                      </div>
                      <span className="text-sm font-bold text-secondary-900">{button.count}</span>
                    </div>
                    <div className="bg-secondary-100 rounded-full h-2">
                      <div
                        className="bg-success-500 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-secondary-600 text-center py-8">No button click data available</p>
          )}
        </Card>
      </div>

      {/* Activity Summary */}
      <Card>
        <div className="flex items-center gap-3 mb-6">
          <Activity className="w-5 h-5 text-primary-600" />
          <h3 className="text-xl font-bold text-secondary-900">Activity Summary</h3>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-secondary-50 rounded-lg p-4 border border-secondary-200">
            <div className="flex items-center gap-2 mb-2">
              <Calculator className="w-4 h-4 text-info-600" />
              <p className="text-xs font-medium text-secondary-600 uppercase">CRS Calculations</p>
            </div>
            <p className="text-2xl font-bold text-secondary-900">{stats.totalCRSCalculations}</p>
          </div>
          <div className="bg-secondary-50 rounded-lg p-4 border border-secondary-200">
            <div className="flex items-center gap-2 mb-2">
              <MessageSquare className="w-4 h-4 text-warning-600" />
              <p className="text-xs font-medium text-secondary-600 uppercase">Consultations</p>
            </div>
            <p className="text-2xl font-bold text-secondary-900">{stats.totalConsultations}</p>
          </div>
          <div className="bg-secondary-50 rounded-lg p-4 border border-secondary-200">
            <div className="flex items-center gap-2 mb-2">
              <Route className="w-4 h-4 text-success-600" />
              <p className="text-xs font-medium text-secondary-600 uppercase">Pathway Submissions</p>
            </div>
            <p className="text-2xl font-bold text-secondary-900">{stats.totalPathwaySubmissions}</p>
          </div>
          <div className="bg-secondary-50 rounded-lg p-4 border border-secondary-200">
            <div className="flex items-center gap-2 mb-2">
              <FileText className="w-4 h-4 text-primary-600" />
              <p className="text-xs font-medium text-secondary-600 uppercase">AI Reports</p>
            </div>
            <p className="text-2xl font-bold text-secondary-900">{stats.totalImmigrationReports || 0}</p>
          </div>
        </div>
      </Card>
    </div>
  );
}

