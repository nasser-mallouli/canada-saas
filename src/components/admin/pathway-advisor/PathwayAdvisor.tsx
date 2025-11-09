import { useNavigate } from 'react-router-dom';
import { Card } from '../../ui/Card';
import { Badge } from '../../ui/Badge';
import { Button } from '../../ui/Button';

interface DashboardStats {
  totalPathwaySubmissions: number;
  recentPathwaySubmissions?: any[];
}

interface PathwayAdvisorProps {
  stats: DashboardStats;
}

export function PathwayAdvisor({ stats }: PathwayAdvisorProps) {
  const navigate = useNavigate();
  const pathwaySubmissions = stats.recentPathwaySubmissions || [];

  return (
    <div className="space-y-6">
      <Card>
        <h3 className="text-xl font-bold text-secondary-900 mb-6">Pathway Advisor Submissions</h3>
        <div className="mb-4 flex gap-2">
          <Badge variant="info">Total: {pathwaySubmissions.length}</Badge>
          <Badge variant={stats.totalPathwaySubmissions > 0 ? 'success' : 'secondary'}>
            All Time: {stats.totalPathwaySubmissions || 0}
          </Badge>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-secondary-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-secondary-500 uppercase">Date</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-secondary-500 uppercase">Name</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-secondary-500 uppercase">Email</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-secondary-500 uppercase">Pathway Goal</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-secondary-500 uppercase">Education</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-secondary-500 uppercase">Experience</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-secondary-500 uppercase">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-secondary-500 uppercase">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-secondary-200">
              {pathwaySubmissions.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-secondary-600">
                    No pathway advisor submissions found
                  </td>
                </tr>
              ) : (
                pathwaySubmissions.map((submission: any) => (
                  <tr key={submission.id} className="hover:bg-secondary-50">
                    <td className="px-4 py-3 text-sm text-secondary-900">
                      {new Date(submission.created_at).toLocaleDateString()}
                      <div className="text-xs text-secondary-500">
                        {new Date(submission.created_at).toLocaleTimeString()}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm font-medium text-secondary-900">
                      {submission.user_name || 'N/A'}
                    </td>
                    <td className="px-4 py-3 text-sm text-secondary-600">{submission.user_email || 'N/A'}</td>
                    <td className="px-4 py-3">
                      <Badge variant="info">{submission.pathway_goal || 'N/A'}</Badge>
                    </td>
                    <td className="px-4 py-3 text-sm text-secondary-600">
                      {submission.education_level || 'N/A'}
                    </td>
                    <td className="px-4 py-3 text-sm text-secondary-600">
                      {submission.work_experience_years ? `${submission.work_experience_years} years` : 'N/A'}
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={submission.is_completed ? 'success' : 'warning'}>
                        {submission.is_completed ? 'Completed' : 'In Progress'}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          navigate(`/admin/pathway-submission/${submission.id}`, {
                            state: { from: '/admin/dashboard?tab=pathway-advisor' }
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

