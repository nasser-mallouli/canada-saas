import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Download, User, Mail, Phone, Calendar, FileText, XCircle, ExternalLink } from 'lucide-react';
import { api } from '../lib/api';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface ReportDetail {
  id: string;
  user_name?: string;
  user_email?: string;
  user_phone?: string;
  profile_data: any;
  report_markdown: string;
  pdf_filename?: string;
  pdf_url?: string;
  pdf_path?: string;
  pathway_goal?: string;
  ai_model_used?: string;
  created_at: string;
  updated_at: string;
}

export function ImmigrationReportDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const [report, setReport] = useState<ReportDetail | null>(null);
  const [loading, setLoading] = useState(true);

  // Get the return path from location state, default to dashboard with calculations tab
  const returnPath = (location.state as any)?.from || '/admin/dashboard?tab=calculations';

  useEffect(() => {
    if (id) {
      fetchReport();
    }
  }, [id]);

  const fetchReport = async () => {
    try {
      setLoading(true);
      console.log('Fetching report with ID:', id);
      const data = await api.get(`/api/ai-provider/reports/${id}`, { skipAuth: true });
      console.log('Report data received:', data);
      setReport(data);
    } catch (error: any) {
      console.error('Error fetching report:', error);
      console.error('Error details:', {
        message: error?.message,
        response: error?.response,
        status: error?.response?.status,
        data: error?.response?.data
      });
      // Set report to null to show "not found" message
      setReport(null);
    } finally {
      setLoading(false);
    }
  };

  const downloadPDF = () => {
    if (report?.pdf_url) {
      // Construct full URL if relative
      const pdfUrl = report.pdf_url.startsWith('http') 
        ? report.pdf_url 
        : `${import.meta.env.VITE_API_URL || 'http://localhost:8001'}/${report.pdf_url}`;
      // Open PDF in new tab for download
      window.open(pdfUrl, '_blank');
    } else {
      alert('PDF not available for this report.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-secondary-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-secondary-600">Loading report details...</p>
        </div>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="min-h-screen bg-secondary-50 flex items-center justify-center">
        <div className="text-center">
          <XCircle className="w-16 h-16 text-error-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-secondary-900 mb-2">Report Not Found</h2>
          <p className="text-secondary-600 mb-4">The report you're looking for doesn't exist.</p>
          <Button onClick={() => navigate(returnPath)}>Back</Button>
        </div>
      </div>
    );
  }

  const profileData = report.profile_data || {};

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
          {report.pdf_url && (
            <Button
              onClick={downloadPDF}
              className="flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Download PDF
            </Button>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-lg p-8 space-y-8">
          {/* Header */}
          <div className="border-b border-secondary-200 pb-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-3xl font-bold text-secondary-900 mb-2">
                  Immigration Eligibility Report
                </h1>
                <p className="text-secondary-600">
                  Generated on {new Date(report.created_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
              </div>
              {report.pathway_goal && (
                <Badge variant="info" className="text-lg px-4 py-2">
                  {report.pathway_goal}
                </Badge>
              )}
            </div>
          </div>

          {/* User Information Card */}
          <Card className="bg-gradient-to-br from-primary-50 via-primary-50 to-primary-100 border-primary-300 shadow-md">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-primary-200">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-primary-600 rounded-xl flex items-center justify-center shadow-lg">
                  <User className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-primary-900">User Profile</h2>
                  <p className="text-sm text-primary-600">Information provided for report generation</p>
                </div>
              </div>
              <Badge variant="info" className="text-sm px-3 py-1">
                AI Generated
              </Badge>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-lg p-4 border border-primary-200 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                    <User className="w-5 h-5 text-primary-600" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-primary-600 uppercase tracking-wide">Full Name</p>
                    <p className="text-lg font-bold text-primary-900 mt-1">
                      {report.user_name || profileData.user_name || 'Not provided'}
                    </p>
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
                    <p className="text-lg font-bold text-primary-900 mt-1 break-all">
                      {report.user_email || profileData.user_email || 'Not provided'}
                    </p>
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
                    <p className="text-lg font-bold text-primary-900 mt-1">
                      {report.user_phone || profileData.user_phone || 'Not provided'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-6 pt-4 border-t border-primary-200">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2 text-primary-600">
                  <Calendar className="w-4 h-4" />
                  <span>Report Date: {new Date(report.created_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}</span>
                </div>
                {report.ai_model_used && (
                  <div className="text-primary-600">
                    <span className="font-medium">AI Model:</span>{' '}
                    <Badge variant="secondary" className="ml-2">
                      {report.ai_model_used}
                    </Badge>
                  </div>
                )}
              </div>
            </div>
          </Card>

          {/* Profile Data Summary */}
          {Object.keys(profileData).length > 0 && (
            <Card>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-success-200 rounded-full flex items-center justify-center">
                  <FileText className="w-5 h-5 text-success-700" />
                </div>
                <h2 className="text-xl font-bold text-secondary-900">Profile Information</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {profileData.age && (
                  <div className="border-l-4 border-primary-500 pl-4 py-2">
                    <p className="text-sm font-medium text-secondary-500 mb-1">Age</p>
                    <p className="text-base text-secondary-900">{profileData.age} years old</p>
                  </div>
                )}
                {profileData.marital_status && (
                  <div className="border-l-4 border-primary-500 pl-4 py-2">
                    <p className="text-sm font-medium text-secondary-500 mb-1">Marital Status</p>
                    <p className="text-base text-secondary-900">{profileData.marital_status}</p>
                  </div>
                )}
                {profileData.citizenship && (
                  <div className="border-l-4 border-primary-500 pl-4 py-2">
                    <p className="text-sm font-medium text-secondary-500 mb-1">Citizenship</p>
                    <p className="text-base text-secondary-900">{profileData.citizenship}</p>
                  </div>
                )}
                {profileData.residence_country && (
                  <div className="border-l-4 border-primary-500 pl-4 py-2">
                    <p className="text-sm font-medium text-secondary-500 mb-1">Residence Country</p>
                    <p className="text-base text-secondary-900">{profileData.residence_country}</p>
                  </div>
                )}
                {profileData.highest_degree && (
                  <div className="border-l-4 border-primary-500 pl-4 py-2">
                    <p className="text-sm font-medium text-secondary-500 mb-1">Highest Degree</p>
                    <p className="text-base text-secondary-900">{profileData.highest_degree}</p>
                  </div>
                )}
                {profileData.field_of_study && (
                  <div className="border-l-4 border-primary-500 pl-4 py-2">
                    <p className="text-sm font-medium text-secondary-500 mb-1">Field of Study</p>
                    <p className="text-base text-secondary-900">{profileData.field_of_study}</p>
                  </div>
                )}
                {profileData.foreign_experience_years !== undefined && (
                  <div className="border-l-4 border-primary-500 pl-4 py-2">
                    <p className="text-sm font-medium text-secondary-500 mb-1">Foreign Experience</p>
                    <p className="text-base text-secondary-900">{profileData.foreign_experience_years} years</p>
                  </div>
                )}
                {profileData.canadian_experience_years !== undefined && (
                  <div className="border-l-4 border-primary-500 pl-4 py-2">
                    <p className="text-sm font-medium text-secondary-500 mb-1">Canadian Experience</p>
                    <p className="text-base text-secondary-900">{profileData.canadian_experience_years} years</p>
                  </div>
                )}
                {profileData.english_test && (
                  <div className="border-l-4 border-primary-500 pl-4 py-2">
                    <p className="text-sm font-medium text-secondary-500 mb-1">English Test</p>
                    <p className="text-base text-secondary-900">
                      {profileData.english_test}
                      {profileData.english_scores && ` - ${profileData.english_scores}`}
                    </p>
                  </div>
                )}
                {profileData.french_test && (
                  <div className="border-l-4 border-primary-500 pl-4 py-2">
                    <p className="text-sm font-medium text-secondary-500 mb-1">French Test</p>
                    <p className="text-base text-secondary-900">
                      {profileData.french_test}
                      {profileData.french_scores && ` - ${profileData.french_scores}`}
                    </p>
                  </div>
                )}
                {profileData.funds && (
                  <div className="border-l-4 border-primary-500 pl-4 py-2">
                    <p className="text-sm font-medium text-secondary-500 mb-1">Available Funds</p>
                    <p className="text-base text-secondary-900">CAD {profileData.funds}</p>
                  </div>
                )}
              </div>
            </Card>
          )}

          {/* Generated Report */}
          <Card>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-info-200 rounded-full flex items-center justify-center">
                <FileText className="w-5 h-5 text-info-700" />
              </div>
              <h2 className="text-xl font-bold text-secondary-900">AI-Generated Report</h2>
            </div>
            <div className="prose prose-lg max-w-none">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {report.report_markdown}
              </ReactMarkdown>
            </div>
          </Card>

          {/* Footer */}
          <div className="border-t border-secondary-200 pt-6 text-center text-sm text-secondary-500">
            <p>This report was generated automatically by our AI immigration advisor.</p>
            <p className="mt-1">For questions or support, please contact our team.</p>
            {report.pdf_url && (
              <div className="mt-4">
                <Button
                  variant="outline"
                  onClick={downloadPDF}
                  className="flex items-center gap-2 mx-auto"
                >
                  <ExternalLink className="w-4 h-4" />
                  Open PDF in New Tab
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

