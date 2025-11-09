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
  recentPathwaySubmissions?: any[];
  recentConsultations: any[];
  recentPageViews: any[];
  topPages: { page: string; count: number }[];
  topButtons: { button: string; count: number }[];
}

interface CalculationsProps {
  stats: DashboardStats;
}

export function Calculations({ stats }: CalculationsProps) {
  const navigate = useNavigate();
  
  // Only CRS calculations should be in recentCalculations now (no immigration reports)
  const crsCalculations = stats.recentCalculations || [];
  const completedCount = crsCalculations.filter((c: any) => c.type === 'completed' || c.type === 'authenticated').length;
  const inProgressCount = crsCalculations.filter((c: any) => c.type === 'partial').length;

  return (
    <div className="space-y-6">
      {/* CRS Calculations Table */}
      <Card>
        <h3 className="text-xl font-bold text-secondary-900 mb-6">CRS Calculations</h3>
        <div className="mb-4 flex gap-2">
          <Badge variant="info">Completed: {completedCount}</Badge>
          <Badge variant="warning">In Progress: {inProgressCount}</Badge>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-secondary-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-secondary-500 uppercase">Type</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-secondary-500 uppercase">Date</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-secondary-500 uppercase">Name</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-secondary-500 uppercase">Email</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-secondary-500 uppercase">Score/Pathway</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-secondary-500 uppercase">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-secondary-500 uppercase">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-secondary-200">
              {crsCalculations.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-secondary-600">
                    No calculations found
                  </td>
                </tr>
              ) : (
                crsCalculations.map((calc: any) => (
                  <tr key={calc.id} className="hover:bg-secondary-50">
                    <td className="px-4 py-3">
                      <Badge variant={
                        calc.type === 'completed' || calc.type === 'authenticated' ? 'success' : 
                        calc.type === 'partial' ? 'warning' : 'secondary'
                      }>
                        {calc.type === 'partial' ? 'In Progress' : 
                         calc.type === 'completed' ? 'Completed' : 'Authenticated'}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-sm text-secondary-900">
                      {new Date(calc.created_at).toLocaleDateString()}
                      {calc.last_activity && (
                        <div className="text-xs text-secondary-500">
                          Last: {new Date(calc.last_activity).toLocaleDateString()}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm font-medium text-secondary-900">{calc.user_name || 'N/A'}</td>
                    <td className="px-4 py-3 text-sm text-secondary-600">{calc.user_email || 'N/A'}</td>
                    <td className="px-4 py-3">
                      {calc.crs_score !== null && calc.crs_score !== undefined ? (
                        <Badge variant={calc.crs_score >= 500 ? 'success' : calc.crs_score >= 450 ? 'warning' : 'error'}>
                          {calc.crs_score} pts
                        </Badge>
                      ) : (
                        <span className="text-sm text-secondary-500">-</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-secondary-600">
                      {calc.current_step ? (
                        <div>
                          <div className="font-medium">Step: {calc.current_step}</div>
                          <div className="text-xs text-secondary-500">
                            Completed: {calc.completed_steps?.length || 0} steps
                          </div>
                        </div>
                      ) : calc.crs_score !== null ? (
                        <Badge variant="success">Completed</Badge>
                      ) : (
                        <span className="text-sm text-secondary-500">-</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          navigate(`/admin/calculation/${calc.id}`, {
                            state: { from: '/admin/dashboard?tab=calculations' }
                          });
                        }}
                      >
                        View
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

