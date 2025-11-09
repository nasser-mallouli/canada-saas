import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, User, Mail, Phone, Calendar, Clock, MessageSquare, FileText, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { api } from '../lib/api';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { useAuth } from '../contexts/AuthContext';

interface ConsultationDetailData {
  id: string;
  user_name: string;
  user_email: string;
  user_phone?: string;
  consultation_type: string;
  consultation_reason: string;
  preferred_date: string;
  preferred_time: string;
  status: string;
  created_at: string;
}

export function ConsultationDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { profile } = useAuth();
  const [consultation, setConsultation] = useState<ConsultationDetailData | null>(null);
  const [loading, setLoading] = useState(true);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<string>('');

  const returnPath = (location.state as any)?.from || '/admin/dashboard?tab=consultations';
  
  // Check if user is admin
  const isAdmin = profile?.role === 'admin';

  useEffect(() => {
    if (id) {
      fetchConsultation();
    }
  }, [id]);

  const fetchConsultation = async () => {
    try {
      setLoading(true);
      const data = await api.get(`/api/consultation/requests/${id}`, { skipAuth: true });
      setConsultation(data);
      setSelectedStatus(data.status);
    } catch (error) {
      console.error('Error fetching consultation:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (newStatus: string) => {
    if (!isAdmin) {
      alert('Only admins can update consultation status');
      return;
    }

    try {
      setUpdatingStatus(true);
      const data = await api.patch(`/api/consultation/requests/${id}/status`, { status: newStatus });
      setConsultation(data);
      setSelectedStatus(data.status);
      console.log('Status updated successfully');
    } catch (error: any) {
      console.error('Error updating status:', error);
      alert(`Failed to update status: ${error?.response?.data?.detail || error?.message || 'Unknown error'}`);
    } finally {
      setUpdatingStatus(false);
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'warning';
      case 'confirmed':
      case 'connected':
        return 'info';
      case 'completed':
      case 'done':
        return 'success';
      case 'cancelled':
        return 'error';
      default:
        return 'secondary';
    }
  };

  const formatConsultationType = (type: string) => {
    return type.replace(/-/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-secondary-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-secondary-600">Loading consultation details...</p>
        </div>
      </div>
    );
  }

  if (!consultation) {
    return (
      <div className="min-h-screen bg-secondary-50 flex items-center justify-center">
        <div className="text-center">
          <XCircle className="w-16 h-16 text-error-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-secondary-900 mb-2">Consultation Not Found</h2>
          <p className="text-secondary-600 mb-4">The consultation request you're looking for doesn't exist.</p>
          <Button onClick={() => navigate(returnPath)}>Back</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-secondary-50 py-8">
      <div className="max-w-5xl mx-auto px-4">
        <div className="mb-6 flex items-center justify-between">
          <Button
            variant="outline"
            onClick={() => navigate(returnPath)}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-8 space-y-8">
          {/* Header */}
          <div className="border-b border-secondary-200 pb-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-3xl font-bold text-secondary-900 mb-2">
                  Consultation Request
                </h1>
                <p className="text-secondary-600">
                  Requested on {new Date(consultation.created_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
              <div className="text-right">
                <Badge variant={getStatusBadgeVariant(consultation.status)} className="text-lg px-4 py-2">
                  {consultation.status.charAt(0).toUpperCase() + consultation.status.slice(1)}
                </Badge>
                <div className="text-sm text-secondary-600 mt-2">
                  <Badge variant="info" className="text-sm">
                    {formatConsultationType(consultation.consultation_type)}
                  </Badge>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Information Card */}
          <Card className="bg-gradient-to-br from-primary-50 via-primary-50 to-primary-100 border-primary-300 shadow-md">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-primary-200">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-primary-600 rounded-xl flex items-center justify-center shadow-lg">
                  <User className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-primary-900">Contact Information</h2>
                  <p className="text-sm text-primary-600">Client details for this consultation</p>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-lg p-4 border border-primary-200 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                    <User className="w-5 h-5 text-primary-600" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-primary-600 uppercase tracking-wide">Full Name</p>
                    <p className="text-lg font-bold text-primary-900 mt-1">{consultation.user_name}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-lg p-4 border border-primary-200 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                    <Mail className="w-5 h-5 text-primary-600" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-primary-600 uppercase tracking-wide">Email Address</p>
                    <p className="text-lg font-bold text-primary-900 mt-1 break-all">{consultation.user_email}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-lg p-4 border border-primary-200 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                    <Phone className="w-5 h-5 text-primary-600" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-primary-600 uppercase tracking-wide">Phone Number</p>
                    <p className="text-lg font-bold text-primary-900 mt-1">{consultation.user_phone || 'Not provided'}</p>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Consultation Details Card */}
          <Card>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-info-200 rounded-full flex items-center justify-center">
                <MessageSquare className="w-5 h-5 text-info-700" />
              </div>
              <h2 className="text-xl font-bold text-secondary-900">Consultation Details</h2>
            </div>
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-secondary-50 rounded-lg p-4 border border-secondary-200">
                  <div className="flex items-center gap-3 mb-2">
                    <Calendar className="w-5 h-5 text-info-600" />
                    <div>
                      <p className="text-xs font-medium text-secondary-600 uppercase tracking-wide">Preferred Date</p>
                      <p className="text-lg font-bold text-secondary-900 mt-1">
                        {new Date(consultation.preferred_date).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          weekday: 'long',
                        })}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="bg-secondary-50 rounded-lg p-4 border border-secondary-200">
                  <div className="flex items-center gap-3 mb-2">
                    <Clock className="w-5 h-5 text-info-600" />
                    <div>
                      <p className="text-xs font-medium text-secondary-600 uppercase tracking-wide">Preferred Time</p>
                      <p className="text-lg font-bold text-secondary-900 mt-1">{consultation.preferred_time}</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-secondary-50 rounded-lg p-4 border border-secondary-200">
                <div className="flex items-center gap-3 mb-3">
                  <FileText className="w-5 h-5 text-info-600" />
                  <p className="text-sm font-medium text-secondary-600 uppercase tracking-wide">Consultation Reason</p>
                </div>
                <p className="text-secondary-900 leading-relaxed whitespace-pre-wrap">{consultation.consultation_reason}</p>
              </div>
            </div>
          </Card>

          {/* Status Information */}
          <Card className="bg-gradient-to-br from-secondary-50 to-secondary-100 border-secondary-300">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-secondary-600" />
                <h2 className="text-xl font-bold text-secondary-900">Request Status</h2>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-secondary-700 font-medium">Current Status:</span>
                <Badge variant={getStatusBadgeVariant(consultation.status)} className="text-base px-3 py-1">
                  {consultation.status.charAt(0).toUpperCase() + consultation.status.slice(1)}
                </Badge>
              </div>
              
              {isAdmin && (
                <div className="border-t border-secondary-200 pt-4">
                  <label className="block text-sm font-medium text-secondary-700 mb-2">
                    Update Status:
                  </label>
                  <div className="flex gap-2 flex-wrap">
                    <Button
                      size="sm"
                      variant={selectedStatus === 'connected' ? 'default' : 'outline'}
                      onClick={() => updateStatus('connected')}
                      disabled={updatingStatus || consultation.status === 'connected'}
                      className={selectedStatus === 'connected' ? 'bg-info-600 text-white' : ''}
                    >
                      {updatingStatus && selectedStatus === 'connected' ? 'Updating...' : 'Connected'}
                    </Button>
                    <Button
                      size="sm"
                      variant={selectedStatus === 'done' ? 'default' : 'outline'}
                      onClick={() => updateStatus('done')}
                      disabled={updatingStatus || consultation.status === 'done'}
                      className={selectedStatus === 'done' ? 'bg-success-600 text-white' : ''}
                    >
                      {updatingStatus && selectedStatus === 'done' ? 'Updating...' : 'Done'}
                    </Button>
                    <Button
                      size="sm"
                      variant={selectedStatus === 'cancelled' ? 'default' : 'outline'}
                      onClick={() => updateStatus('cancelled')}
                      disabled={updatingStatus || consultation.status === 'cancelled'}
                      className={selectedStatus === 'cancelled' ? 'bg-error-600 text-white' : ''}
                    >
                      {updatingStatus && selectedStatus === 'cancelled' ? 'Updating...' : 'Cancelled'}
                    </Button>
                  </div>
                </div>
              )}
              
              <div className="flex items-center justify-between">
                <span className="text-secondary-700 font-medium">Request ID:</span>
                <span className="text-secondary-600 font-mono text-sm">{consultation.id}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-secondary-700 font-medium">Submitted:</span>
                <span className="text-secondary-600">
                  {new Date(consultation.created_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>
            </div>
          </Card>

          {/* Footer */}
          <div className="border-t border-secondary-200 pt-6 text-center text-sm text-secondary-500">
            <p>This is a consultation request record.</p>
            <p className="mt-1">For questions or support, please contact our team.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

