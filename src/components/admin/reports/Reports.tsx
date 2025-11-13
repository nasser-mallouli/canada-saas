import { useNavigate } from 'react-router-dom';
import { Card } from '../../ui/Card';
import { Badge } from '../../ui/Badge';
import { Button } from '../../ui/Button';
import { FileText, Download } from 'lucide-react';
import { getApiUrl } from '../../../lib/api';

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
  recentPageViews: any[];
  topPages: { page: string; count: number }[];
  topButtons: { button: string; count: number }[];
}

interface ReportsProps {
  stats: DashboardStats;
}

export function Reports({ stats }: ReportsProps) {
  const navigate = useNavigate();
  const reports = stats.recentReports || [];

  return (
    <div className="space-y-6">
      <Card>
        <h3 className="text-xl font-bold text-secondary-900 mb-6 flex items-center gap-2">
          <FileText className="w-6 h-6 text-primary-600" />
          AI Immigration Reports
        </h3>
        <div className="mb-4 flex gap-2">
          <Badge variant="info">Total: {stats.totalImmigrationReports || 0}</Badge>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-secondary-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-secondary-500 uppercase">Date</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-secondary-500 uppercase">Name</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-secondary-500 uppercase">Email</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-secondary-500 uppercase">Pathway Goal</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-secondary-500 uppercase">AI Model</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-secondary-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-secondary-200">
              {reports.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-secondary-600">
                    No reports found
                  </td>
                </tr>
              ) : (
                reports.map((report: any) => (
                  <tr key={report.id} className="hover:bg-secondary-50">
                    <td className="px-4 py-3 text-sm text-secondary-900">
                      {new Date(report.created_at).toLocaleDateString()}
                      <div className="text-xs text-secondary-500">
                        {new Date(report.created_at).toLocaleTimeString()}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm font-medium text-secondary-900">
                      {report.user_name || 'Anonymous'}
                    </td>
                    <td className="px-4 py-3 text-sm text-secondary-600">{report.user_email || 'N/A'}</td>
                    <td className="px-4 py-3">
                      <Badge variant="info">{report.pathway_goal || 'N/A'}</Badge>
                    </td>
                    <td className="px-4 py-3 text-sm text-secondary-600">
                      {report.ai_model_used || 'N/A'}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            navigate(`/admin/report/${report.id}`, {
                              state: { from: '/admin/dashboard?tab=reports' }
                            });
                          }}
                        >
                          View
                        </Button>
                        {report.pdf_url && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              const pdfUrl = report.pdf_url.startsWith('http') 
                                ? report.pdf_url 
                                : `${getApiUrl()}/${report.pdf_url}`;
                              window.open(pdfUrl, '_blank');
                            }}
                          >
                            <Download className="w-4 h-4 mr-1" />
                            PDF
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

