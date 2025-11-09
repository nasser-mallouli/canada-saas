import { Calculator, MessageSquare, FileText } from 'lucide-react';
import { Card } from '../../ui/Card';
import { Badge } from '../../ui/Badge';
import { Button } from '../../ui/Button';

interface User {
  id: number;
  email: string;
  username: string;
  date_joined: string;
  profile?: {
    full_name: string;
    role: string;
    phone?: string;
    target_province?: string;
  };
  calculation_count?: number;
  consultation_count?: number;
  submission_count?: number;
  calculations?: any[];
  consultations?: any[];
  submissions?: any[];
}

interface UsersProps {
  users: User[];
  selectedUser: User | null;
  userLoading: boolean;
  onUserSelect: (userId: number) => void;
  onBack: () => void;
}

export function Users({ users, selectedUser, userLoading, onUserSelect, onBack }: UsersProps) {
  if (selectedUser) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="outline"
            onClick={onBack}
          >
            ← Back to Users
          </Button>
          <h2 className="text-2xl font-bold text-secondary-900">
            User Details: {selectedUser.email}
          </h2>
        </div>

        {userLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
            <p className="text-secondary-600">Loading user details...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <h3 className="text-lg font-bold text-secondary-900 mb-4">Profile Information</h3>
              {selectedUser.profile ? (
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-secondary-500">Full Name</p>
                    <p className="text-base font-medium text-secondary-900">{selectedUser.profile.full_name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-secondary-500">Role</p>
                    <Badge variant={selectedUser.profile.role === 'admin' ? 'success' : 'info'}>
                      {selectedUser.profile.role}
                    </Badge>
                  </div>
                  {selectedUser.profile.phone && (
                    <div>
                      <p className="text-sm text-secondary-500">Phone</p>
                      <p className="text-base text-secondary-900">{selectedUser.profile.phone}</p>
                    </div>
                  )}
                  {selectedUser.profile.target_province && (
                    <div>
                      <p className="text-sm text-secondary-500">Target Province</p>
                      <p className="text-base text-secondary-900">{selectedUser.profile.target_province}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-sm text-secondary-500">Member Since</p>
                    <p className="text-base text-secondary-900">
                      {new Date(selectedUser.date_joined).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ) : (
                <p className="text-secondary-600">No profile information available</p>
              )}
            </Card>

            <Card>
              <h3 className="text-lg font-bold text-secondary-900 mb-4">Activity Summary</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-info-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Calculator className="w-5 h-5 text-info-600" />
                    <span className="text-sm font-medium text-secondary-900">CRS Calculations</span>
                  </div>
                  <span className="text-lg font-bold text-info-600">{selectedUser.calculations?.length || 0}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-warning-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-warning-600" />
                    <span className="text-sm font-medium text-secondary-900">Consultations</span>
                  </div>
                  <span className="text-lg font-bold text-warning-600">{selectedUser.consultations?.length || 0}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-success-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <FileText className="w-5 h-5 text-success-600" />
                    <span className="text-sm font-medium text-secondary-900">Pathway Submissions</span>
                  </div>
                  <span className="text-lg font-bold text-success-600">{selectedUser.submissions?.length || 0}</span>
                </div>
              </div>
            </Card>

            {selectedUser.calculations && selectedUser.calculations.length > 0 && (
              <Card className="lg:col-span-2">
                <h3 className="text-lg font-bold text-secondary-900 mb-4">CRS Calculations</h3>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-secondary-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-secondary-500 uppercase">Date</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-secondary-500 uppercase">Score</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-secondary-500 uppercase">Type</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-secondary-200">
                      {selectedUser.calculations.map((calc: any) => (
                        <tr key={calc.id} className="hover:bg-secondary-50">
                          <td className="px-4 py-3 text-sm text-secondary-900">
                            {new Date(calc.created_at).toLocaleDateString()}
                          </td>
                          <td className="px-4 py-3">
                            <Badge variant={calc.score >= 500 ? 'success' : calc.score >= 450 ? 'warning' : 'error'}>
                              {calc.score} pts
                            </Badge>
                          </td>
                          <td className="px-4 py-3 text-sm text-secondary-600">{calc.type || 'standard'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            )}

            {selectedUser.consultations && selectedUser.consultations.length > 0 && (
              <Card className="lg:col-span-2">
                <h3 className="text-lg font-bold text-secondary-900 mb-4">Consultation Requests</h3>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-secondary-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-secondary-500 uppercase">Date</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-secondary-500 uppercase">Type</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-secondary-500 uppercase">Preferred Date</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-secondary-500 uppercase">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-secondary-200">
                      {selectedUser.consultations.map((consult: any) => (
                        <tr key={consult.id} className="hover:bg-secondary-50">
                          <td className="px-4 py-3 text-sm text-secondary-900">
                            {new Date(consult.created_at).toLocaleDateString()}
                          </td>
                          <td className="px-4 py-3 text-sm text-secondary-600">{consult.consultation_type}</td>
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
            )}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <h3 className="text-xl font-bold text-secondary-900 mb-6">User Management</h3>
        {userLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
            <p className="text-secondary-600">Loading users...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-secondary-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-secondary-500 uppercase">Email</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-secondary-500 uppercase">Name</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-secondary-500 uppercase">Role</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-secondary-500 uppercase">Joined</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-secondary-500 uppercase">Calculations</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-secondary-500 uppercase">Consultations</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-secondary-500 uppercase">Submissions</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-secondary-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-secondary-200">
                {users.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-8 text-center text-secondary-600">
                      No users found
                    </td>
                  </tr>
                ) : (
                  users.map((user) => (
                    <tr key={user.id} className="hover:bg-secondary-50">
                      <td className="px-4 py-3 text-sm font-medium text-secondary-900">{user.email}</td>
                      <td className="px-4 py-3 text-sm text-secondary-600">
                        {user.profile?.full_name || '-'}
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={user.profile?.role === 'admin' ? 'success' : user.profile?.role === 'agent' ? 'info' : 'secondary'}>
                          {user.profile?.role || 'user'}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-sm text-secondary-600">
                        {new Date(user.date_joined).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 text-sm text-secondary-600 text-center">
                        {user.calculation_count || 0}
                      </td>
                      <td className="px-4 py-3 text-sm text-secondary-600 text-center">
                        {user.consultation_count || 0}
                      </td>
                      <td className="px-4 py-3 text-sm text-secondary-600 text-center">
                        {user.submission_count || 0}
                      </td>
                      <td className="px-4 py-3">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onUserSelect(user.id)}
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
        )}
      </Card>
    </div>
  );
}

