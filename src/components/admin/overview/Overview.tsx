import { TrendingUp, MousePointerClick, Eye, Calculator, MessageSquare } from 'lucide-react';
import { Card } from '../../ui/Card';

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

interface OverviewProps {
  stats: DashboardStats;
}

export function Overview({ stats }: OverviewProps) {
  return (
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
            {stats.topPages.length > 0 ? (
              stats.topPages.map((page, index) => {
                const maxCount = stats.topPages[0]?.count || 1;
                return (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="text-sm font-medium text-secondary-900">{page.page}</div>
                      <div className="w-full bg-secondary-200 rounded-full h-2 mt-1">
                        <div
                          className="bg-primary-600 h-2 rounded-full"
                          style={{ width: `${(page.count / maxCount) * 100}%` }}
                        />
                      </div>
                    </div>
                    <span className="ml-4 text-lg font-bold text-primary-600">{page.count}</span>
                  </div>
                );
              })
            ) : (
              <p className="text-sm text-secondary-500 text-center py-4">No page views yet</p>
            )}
          </div>
        </Card>

        <Card>
          <h3 className="text-lg font-bold text-secondary-900 mb-4 flex items-center gap-2">
            <MousePointerClick className="w-5 h-5 text-success-600" />
            Top Button Clicks
          </h3>
          <div className="space-y-3">
            {stats.topButtons.length > 0 ? (
              stats.topButtons.map((button, index) => {
                const maxCount = stats.topButtons[0]?.count || 1;
                return (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="text-sm font-medium text-secondary-900">{button.button}</div>
                      <div className="w-full bg-secondary-200 rounded-full h-2 mt-1">
                        <div
                          className="bg-success-600 h-2 rounded-full"
                          style={{ width: `${(button.count / maxCount) * 100}%` }}
                        />
                      </div>
                    </div>
                    <span className="ml-4 text-lg font-bold text-success-600">{button.count}</span>
                  </div>
                );
              })
            ) : (
              <p className="text-sm text-secondary-500 text-center py-4">No button clicks yet</p>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}

