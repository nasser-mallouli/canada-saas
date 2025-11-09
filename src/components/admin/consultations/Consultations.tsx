import { useNavigate } from 'react-router-dom';
import { Card } from '../../ui/Card';
import { Badge } from '../../ui/Badge';
import { Button } from '../../ui/Button';

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

interface ConsultationsProps {
  stats: DashboardStats;
}

export function Consultations({ stats }: ConsultationsProps) {
  const navigate = useNavigate();
  
  const getStatusBadgeVariant = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'pending':
        return 'warning';
      case 'confirmed':
        return 'info';
      case 'completed':
        return 'success';
      case 'cancelled':
        return 'error';
      default:
        return 'secondary';
    }
  };

  const formatConsultationType = (type: string) => {
    if (!type) return 'N/A';
    return type.replace(/-/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());
  };

  const pendingCount = stats.recentConsultations.filter((c: any) => c.status === 'pending').length;
  const confirmedCount = stats.recentConsultations.filter((c: any) => c.status === 'confirmed').length;
  const completedCount = stats.recentConsultations.filter((c: any) => c.status === 'completed').length;

  return (
    <div className="space-y-6">
      <Card>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-bold text-secondary-900">Consultation Requests</h3>
            <p className="text-sm text-secondary-600 mt-1">Manage and review all consultation requests</p>
          </div>
          <div className="flex gap-2">
            <Badge variant="info">Total: {stats.totalConsultations || 0}</Badge>
            {pendingCount > 0 && <Badge variant="warning">Pending: {pendingCount}</Badge>}
            {confirmedCount > 0 && <Badge variant="info">Confirmed: {confirmedCount}</Badge>}
            {completedCount > 0 && <Badge variant="success">Completed: {completedCount}</Badge>}
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-secondary-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-secondary-500 uppercase">Date</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-secondary-500 uppercase">Name</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-secondary-500 uppercase">Email</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-secondary-500 uppercase">Phone</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-secondary-500 uppercase">Type</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-secondary-500 uppercase">Preferred Date & Time</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-secondary-500 uppercase">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-secondary-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-secondary-200">
              {stats.recentConsultations.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-secondary-600">
                    No consultation requests found
                  </td>
                </tr>
              ) : (
                stats.recentConsultations.map((consult: any) => (
                  <tr key={consult.id} className="hover:bg-secondary-50 transition-colors">
                    <td className="px-4 py-3 text-sm text-secondary-900">
                      {new Date(consult.created_at).toLocaleDateString()}
                      <div className="text-xs text-secondary-500">
                        {new Date(consult.created_at).toLocaleTimeString()}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm font-medium text-secondary-900">{consult.user_name || 'N/A'}</td>
                    <td className="px-4 py-3 text-sm text-secondary-600">{consult.user_email || 'N/A'}</td>
                    <td className="px-4 py-3 text-sm text-secondary-600">{consult.user_phone || 'N/A'}</td>
                    <td className="px-4 py-3">
                      <Badge variant="info" className="text-xs">
                        {formatConsultationType(consult.consultation_type)}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-sm text-secondary-600">
                      <div className="font-medium">
                        {consult.preferred_date ? new Date(consult.preferred_date).toLocaleDateString() : 'N/A'}
                      </div>
                      {consult.preferred_time && (
                        <div className="text-xs text-secondary-500">{consult.preferred_time}</div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={getStatusBadgeVariant(consult.status)}>
                        {consult.status ? consult.status.charAt(0).toUpperCase() + consult.status.slice(1) : 'N/A'}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          navigate(`/admin/consultation/${consult.id}`, {
                            state: { from: '/admin/dashboard?tab=consultations' }
                          });
                        }}
                      >
                        View Details
                      </Button>
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

