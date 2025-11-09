import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Download, User, Mail, Phone, Calendar, FileText, XCircle, CheckCircle, MapPin, GraduationCap, Briefcase, DollarSign, Globe, Heart } from 'lucide-react';
import { api } from '../lib/api';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import jsPDF from 'jspdf';

interface PathwaySubmissionDetail {
  id: string;
  user_name: string;
  user_email: string;
  user_phone?: string;
  birth_date?: string;
  citizenship_country?: string;
  residence_country?: string;
  education_level?: string;
  work_experience_years: number;
  field_of_study?: string;
  language_tests: any[];
  marital_status?: string;
  has_canadian_relative: boolean;
  has_job_offer: boolean;
  has_canadian_experience: boolean;
  has_police_record: boolean;
  available_funds: number;
  pathway_goal?: string;
  pathway_specific_data: any;
  eligibility_results: any;
  created_at: string;
  updated_at: string;
}

export function PathwaySubmissionDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const [submission, setSubmission] = useState<PathwaySubmissionDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [generatingPDF, setGeneratingPDF] = useState(false);

  // Get the return path from location state, default to dashboard with pathway-advisor tab
  const returnPath = (location.state as any)?.from || '/admin/dashboard?tab=pathway-advisor';

  useEffect(() => {
    if (id) {
      fetchSubmission();
    }
  }, [id]);

  const fetchSubmission = async () => {
    try {
      setLoading(true);
      const data = await api.get(`/api/pathway/submissions/${id}`, { skipAuth: true });
      setSubmission(data);
    } catch (error) {
      console.error('Error fetching submission:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-secondary-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-secondary-600">Loading submission details...</p>
        </div>
      </div>
    );
  }

  if (!submission) {
    return (
      <div className="min-h-screen bg-secondary-50 flex items-center justify-center">
        <div className="text-center">
          <XCircle className="w-16 h-16 text-error-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-secondary-900 mb-2">Submission Not Found</h2>
          <p className="text-secondary-600 mb-4">The submission you're looking for doesn't exist.</p>
          <Button onClick={() => navigate(returnPath)}>Back</Button>
        </div>
      </div>
    );
  }

  const eligibilityResults = submission.eligibility_results || {};
  const eligiblePathways = Object.entries(eligibilityResults)
    .filter(([_, result]: [string, any]) => result?.eligible)
    .map(([pathway, _]) => pathway);

  const generatePDF = () => {
    if (!submission) return;

    try {
      setGeneratingPDF(true);

      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 15;
      const maxWidth = pageWidth - (margin * 2);
      let yPosition = margin;
      const lineHeight = 7;
      const sectionSpacing = 12;

      const checkPageBreak = (requiredHeight: number) => {
        if (yPosition + requiredHeight > pageHeight - margin) {
          pdf.addPage();
          yPosition = margin;
          return true;
        }
        return false;
      };

      const addText = (text: string, fontSize: number, isBold: boolean = false, color: number[] = [0, 0, 0], x: number = margin) => {
        pdf.setFontSize(fontSize);
        pdf.setFont('helvetica', isBold ? 'bold' : 'normal');
        pdf.setTextColor(color[0], color[1], color[2]);
        
        const lines = pdf.splitTextToSize(text, maxWidth - (x - margin));
        const textHeight = lines.length * (fontSize * 0.4);
        
        checkPageBreak(textHeight);
        
        lines.forEach((line: string) => {
          pdf.text(line, x, yPosition);
          yPosition += fontSize * 0.4;
        });
        
        yPosition += 2;
      };

      const addSectionHeader = (text: string) => {
        checkPageBreak(lineHeight * 4);
        yPosition += sectionSpacing;
        
        pdf.setFillColor(219, 234, 254);
        pdf.setDrawColor(147, 197, 253);
        pdf.setLineWidth(0.3);
        pdf.rect(margin, yPosition - 1, pageWidth - (margin * 2), 5);
        pdf.fill();
        pdf.stroke();
        
        pdf.setTextColor(30, 64, 175);
        pdf.setFontSize(10.5);
        pdf.setFont('helvetica', 'bold');
        pdf.text(text.toUpperCase(), margin + 2, yPosition + 3);
        
        yPosition += 7;
      };

      const addField = (label: string, value: string, labelWidth: number = 60) => {
        checkPageBreak(lineHeight * 2);
        const valueX = margin + labelWidth;
        const valueWidth = maxWidth - labelWidth - 5;
        
        pdf.setFontSize(8);
        pdf.setTextColor(100, 116, 139);
        pdf.setFont('helvetica', 'normal');
        pdf.text(label, margin, yPosition);
        
        pdf.setFontSize(9);
        pdf.setTextColor(15, 23, 42);
        pdf.setFont('helvetica', 'normal');
        const valueLines = pdf.splitTextToSize(value || 'N/A', valueWidth);
        let lineY = yPosition;
        valueLines.forEach((line: string) => {
          pdf.text(line, valueX, lineY);
          lineY += 4;
        });
        yPosition = Math.max(yPosition + 4, lineY) + 2;
      };

      // Header
      pdf.setFillColor(219, 234, 254);
      pdf.setDrawColor(147, 197, 253);
      pdf.setLineWidth(0.5);
      pdf.rect(0, 0, pageWidth, 45);
      pdf.fill();
      pdf.stroke();
      
      pdf.setTextColor(30, 64, 175);
      pdf.setFontSize(20);
      pdf.setFont('helvetica', 'bold');
      pdf.text('PATHWAY ADVISOR REPORT', margin, 18);
      
      pdf.setFontSize(8.5);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(51, 65, 85);
      const generatedDate = new Date(submission.created_at).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
      pdf.text(`Generated: ${generatedDate}`, margin, 25);
      
      const candidateBoxX = pageWidth - margin - 70;
      pdf.setFillColor(249, 250, 251);
      pdf.setDrawColor(209, 213, 219);
      pdf.setLineWidth(0.4);
      pdf.rect(candidateBoxX, 8, 70, 35);
      pdf.fill();
      pdf.stroke();
      
      pdf.setTextColor(15, 23, 42);
      pdf.setFontSize(7.5);
      pdf.setFont('helvetica', 'bold');
      pdf.text('CANDIDATE INFORMATION', candidateBoxX + 3, 13);
      
      pdf.setTextColor(30, 41, 59);
      pdf.setFontSize(7);
      pdf.setFont('helvetica', 'normal');
      pdf.text(`Name: ${submission.user_name || 'N/A'}`, candidateBoxX + 3, 18);
      pdf.text(`Email: ${submission.user_email || 'N/A'}`, candidateBoxX + 3, 22);
      pdf.text(`Phone: ${submission.user_phone || 'N/A'}`, candidateBoxX + 3, 26);
      pdf.text(`Pathway: ${submission.pathway_goal || 'N/A'}`, candidateBoxX + 3, 30);
      pdf.text(`Status: ${submission.is_completed ? 'Completed' : 'In Progress'}`, candidateBoxX + 3, 34);
      
      yPosition = 55;

      addSectionHeader('Personal Information');
      if (submission.birth_date) {
        addField('Date of Birth:', new Date(submission.birth_date).toLocaleDateString());
      }
      addField('Citizenship:', submission.citizenship_country || 'N/A');
      addField('Residence Country:', submission.residence_country || 'N/A');
      addField('Marital Status:', submission.marital_status || 'N/A');

      addSectionHeader('Education & Work Experience');
      addField('Education Level:', submission.education_level || 'N/A');
      addField('Field of Study:', submission.field_of_study || 'N/A');
      addField('Work Experience:', `${submission.work_experience_years} years`);

      if (submission.language_tests && submission.language_tests.length > 0) {
        addSectionHeader('Language Tests');
        submission.language_tests.forEach((test: any) => {
          checkPageBreak(lineHeight * 6);
          pdf.setFontSize(8.5);
          pdf.setTextColor(30, 64, 175);
          pdf.setFont('helvetica', 'bold');
          pdf.text(`${test.type || 'Language Test'}`, margin, yPosition);
          yPosition += 5;
          
          pdf.setFontSize(8);
          pdf.setTextColor(100, 116, 139);
          pdf.setFont('helvetica', 'normal');
          if (test.listening !== undefined) pdf.text(`Listening: ${test.listening}`, margin + 5, yPosition);
          if (test.reading !== undefined) pdf.text(`Reading: ${test.reading}`, margin + 40, yPosition);
          if (test.writing !== undefined) pdf.text(`Writing: ${test.writing}`, margin + 70, yPosition);
          if (test.speaking !== undefined) pdf.text(`Speaking: ${test.speaking}`, margin + 100, yPosition);
          yPosition += 4;
          if (test.overall !== undefined && test.overall > 0) {
            pdf.text(`Overall: ${test.overall}`, margin + 5, yPosition);
            yPosition += 4;
          }
          yPosition += 3;
        });
      }

      addSectionHeader('Personal Circumstances');
      addField('Has Canadian Job Offer:', submission.has_job_offer ? 'Yes' : 'No');
      addField('Has Canadian Experience:', submission.has_canadian_experience ? 'Yes' : 'No');
      addField('Has Canadian Relative:', submission.has_canadian_relative ? 'Yes' : 'No');
      addField('Criminal Record:', submission.has_police_record ? 'Yes' : 'No');
      if (submission.available_funds > 0) {
        addField('Available Funds:', `CAD ${submission.available_funds.toLocaleString()}`);
      }

      if (Object.keys(eligibilityResults).length > 0) {
        addSectionHeader('Eligibility Results');
        
        Object.entries(eligibilityResults).forEach(([pathway, result]: [string, any]) => {
          checkPageBreak(lineHeight * 15);
          
          pdf.setFillColor(248, 250, 252);
          pdf.setDrawColor(203, 213, 225);
          pdf.setLineWidth(0.4);
          pdf.rect(margin, yPosition, pageWidth - (margin * 2), 8);
          pdf.fill();
          pdf.stroke();
          
          pdf.setFontSize(9.5);
          pdf.setTextColor(30, 64, 175);
          pdf.setFont('helvetica', 'bold');
          pdf.text(pathway, margin + 2, yPosition + 5.5);
          
          const statusColor = result?.eligible ? [22, 163, 74] : [239, 68, 68];
          const statusBg = result?.eligible ? [220, 252, 231] : [254, 226, 226];
          pdf.setFillColor(statusBg[0], statusBg[1], statusBg[2]);
          pdf.setDrawColor(statusColor[0], statusColor[1], statusColor[2]);
          pdf.setLineWidth(0.3);
          const badgeX = pageWidth - margin - 30;
          pdf.rect(badgeX, yPosition + 1, 28, 6);
          pdf.fill();
          pdf.stroke();
          
          pdf.setFontSize(7.5);
          pdf.setTextColor(15, 23, 42);
          pdf.setFont('helvetica', 'bold');
          pdf.text(result?.eligible ? 'ELIGIBLE' : 'NOT ELIGIBLE', badgeX + 2, yPosition + 4.5);
          
          yPosition += 10;
          
          if (result?.readinessScore !== undefined) {
            addField('Readiness Score:', `${result.readinessScore}%`);
          }
          
          if (result?.missingRequirements && result.missingRequirements.length > 0) {
            pdf.setFontSize(8);
            pdf.setTextColor(100, 116, 139);
            pdf.setFont('helvetica', 'normal');
            pdf.text('Missing Requirements:', margin + 5, yPosition);
            yPosition += 5;
            result.missingRequirements.forEach((req: string) => {
              checkPageBreak(lineHeight * 2);
              pdf.setFontSize(7.5);
              pdf.setTextColor(51, 65, 85);
              pdf.text(`• ${req}`, margin + 10, yPosition);
              yPosition += 4;
            });
            yPosition += 2;
          }
          
          if (result?.recommendations && result.recommendations.length > 0) {
            pdf.setFontSize(8);
            pdf.setTextColor(100, 116, 139);
            pdf.setFont('helvetica', 'normal');
            pdf.text('Recommendations:', margin + 5, yPosition);
            yPosition += 5;
            result.recommendations.forEach((rec: string) => {
              checkPageBreak(lineHeight * 2);
              pdf.setFontSize(7.5);
              pdf.setTextColor(51, 65, 85);
              pdf.text(`→ ${rec}`, margin + 10, yPosition);
              yPosition += 4;
            });
            yPosition += 2;
          }
          
          yPosition += 3;
        });
      }

      const totalPages = pdf.internal.pages.length - 1;
      for (let i = 1; i <= totalPages; i++) {
        pdf.setPage(i);
        
        pdf.setDrawColor(203, 213, 225);
        pdf.setLineWidth(0.3);
        pdf.line(margin, pageHeight - 12, pageWidth - margin, pageHeight - 12);
        
        pdf.setFontSize(7.5);
        pdf.setTextColor(100, 116, 139);
        pdf.setFont('helvetica', 'normal');
        pdf.text(`Page ${i} of ${totalPages}`, pageWidth - margin - 15, pageHeight - 8);
        pdf.text('Canada Immigration Pathway Advisor', margin, pageHeight - 8);
        
        pdf.setFontSize(6.5);
        pdf.setTextColor(148, 163, 184);
        const confText = 'This document contains confidential information. For official use only.';
        const confTextWidth = pdf.getTextWidth(confText);
        pdf.text(confText, (pageWidth - confTextWidth) / 2, pageHeight - 4);
      }

      const candidateName = submission.user_name || 'User';
      const sanitizedName = candidateName.replace(/[^a-zA-Z0-9_-]/g, '_');
      const fileName = `Pathway_Advisor_${sanitizedName}_${new Date(submission.created_at).toISOString().split('T')[0]}.pdf`;
      pdf.save(fileName);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert(`Failed to generate PDF: ${error instanceof Error ? error.message : 'Unknown error'}. Please try again.`);
    } finally {
      setGeneratingPDF(false);
    }
  };

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
          <Button
            onClick={generatePDF}
            disabled={generatingPDF}
            className="flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            {generatingPDF ? 'Generating...' : 'Download PDF'}
          </Button>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-8 space-y-8">
          {/* Header */}
          <div className="border-b border-secondary-200 pb-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-3xl font-bold text-secondary-900 mb-2">
                  Pathway Advisor Submission
                </h1>
                <p className="text-secondary-600">
                  Submitted on {new Date(submission.created_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
              </div>
              {submission.pathway_goal && (
                <Badge variant="info" className="text-lg px-4 py-2">
                  {submission.pathway_goal}
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
                  <p className="text-sm text-primary-600">Contact information provided</p>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-lg p-4 border border-primary-200 shadow-sm">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                    <User className="w-5 h-5 text-primary-600" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-primary-600 uppercase">Full Name</p>
                    <p className="text-lg font-bold text-primary-900 mt-1">{submission.user_name}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-lg p-4 border border-primary-200 shadow-sm">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                    <Mail className="w-5 h-5 text-primary-600" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-primary-600 uppercase">Email Address</p>
                    <p className="text-lg font-bold text-primary-900 mt-1 break-all">{submission.user_email}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-lg p-4 border border-primary-200 shadow-sm">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                    <Phone className="w-5 h-5 text-primary-600" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-primary-600 uppercase">Phone Number</p>
                    <p className="text-lg font-bold text-primary-900 mt-1">{submission.user_phone || 'Not provided'}</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-6 pt-4 border-t border-primary-200">
              <div className="flex items-center gap-2 text-sm text-primary-600">
                <Calendar className="w-4 h-4" />
                <span>Submission Date: {new Date(submission.created_at).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}</span>
              </div>
            </div>
          </Card>

          {/* Personal Information */}
          <Card>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-info-200 rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-info-700" />
              </div>
              <h2 className="text-xl font-bold text-secondary-900">Personal Information</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {submission.birth_date && (
                <div className="border-l-4 border-primary-500 pl-4 py-2">
                  <p className="text-sm font-medium text-secondary-500 mb-1">Date of Birth</p>
                  <p className="text-base text-secondary-900">{new Date(submission.birth_date).toLocaleDateString()}</p>
                </div>
              )}
              {submission.citizenship_country && (
                <div className="border-l-4 border-primary-500 pl-4 py-2">
                  <p className="text-sm font-medium text-secondary-500 mb-1">Citizenship</p>
                  <p className="text-base text-secondary-900">{submission.citizenship_country}</p>
                </div>
              )}
              {submission.residence_country && (
                <div className="border-l-4 border-primary-500 pl-4 py-2">
                  <p className="text-sm font-medium text-secondary-500 mb-1">Residence Country</p>
                  <p className="text-base text-secondary-900">{submission.residence_country}</p>
                </div>
              )}
              {submission.marital_status && (
                <div className="border-l-4 border-primary-500 pl-4 py-2">
                  <p className="text-sm font-medium text-secondary-500 mb-1">Marital Status</p>
                  <p className="text-base text-secondary-900">{submission.marital_status}</p>
                </div>
              )}
            </div>
          </Card>

          {/* Education & Work Experience */}
          <Card>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-success-200 rounded-full flex items-center justify-center">
                <GraduationCap className="w-5 h-5 text-success-700" />
              </div>
              <h2 className="text-xl font-bold text-secondary-900">Education & Work Experience</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {submission.education_level && (
                <div className="border-l-4 border-success-500 pl-4 py-2">
                  <p className="text-sm font-medium text-secondary-500 mb-1">Education Level</p>
                  <p className="text-base text-secondary-900">{submission.education_level}</p>
                </div>
              )}
              {submission.field_of_study && (
                <div className="border-l-4 border-success-500 pl-4 py-2">
                  <p className="text-sm font-medium text-secondary-500 mb-1">Field of Study</p>
                  <p className="text-base text-secondary-900">{submission.field_of_study}</p>
                </div>
              )}
              {submission.work_experience_years > 0 && (
                <div className="border-l-4 border-success-500 pl-4 py-2">
                  <p className="text-sm font-medium text-secondary-500 mb-1">Work Experience</p>
                  <p className="text-base text-secondary-900">{submission.work_experience_years} years</p>
                </div>
              )}
            </div>
          </Card>

          {/* Language Tests */}
          {submission.language_tests && submission.language_tests.length > 0 && (
            <Card>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-warning-200 rounded-full flex items-center justify-center">
                  <Globe className="w-5 h-5 text-warning-700" />
                </div>
                <h2 className="text-xl font-bold text-secondary-900">Language Tests</h2>
              </div>
              <div className="space-y-3">
                {submission.language_tests.map((test: any, index: number) => (
                  <div key={index} className="border-l-4 border-warning-500 pl-4 py-2 bg-warning-50 rounded">
                    <p className="text-sm font-medium text-secondary-500 mb-1">Test Type: {test.type}</p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                      {test.listening !== undefined && (
                        <span>Listening: {test.listening}</span>
                      )}
                      {test.reading !== undefined && (
                        <span>Reading: {test.reading}</span>
                      )}
                      {test.writing !== undefined && (
                        <span>Writing: {test.writing}</span>
                      )}
                      {test.speaking !== undefined && (
                        <span>Speaking: {test.speaking}</span>
                      )}
                      {test.overall !== undefined && test.overall > 0 && (
                        <span className="col-span-2 md:col-span-4">Overall: {test.overall}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Circumstances */}
          <Card>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-info-200 rounded-full flex items-center justify-center">
                <Briefcase className="w-5 h-5 text-info-700" />
              </div>
              <h2 className="text-xl font-bold text-secondary-900">Personal Circumstances</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                {submission.has_job_offer ? (
                  <CheckCircle className="w-5 h-5 text-success-600" />
                ) : (
                  <XCircle className="w-5 h-5 text-secondary-400" />
                )}
                <span className="text-sm text-secondary-900">Has Canadian Job Offer</span>
              </div>
              <div className="flex items-center gap-2">
                {submission.has_canadian_experience ? (
                  <CheckCircle className="w-5 h-5 text-success-600" />
                ) : (
                  <XCircle className="w-5 h-5 text-secondary-400" />
                )}
                <span className="text-sm text-secondary-900">Has Canadian Experience</span>
              </div>
              <div className="flex items-center gap-2">
                {submission.has_canadian_relative ? (
                  <CheckCircle className="w-5 h-5 text-success-600" />
                ) : (
                  <XCircle className="w-5 h-5 text-secondary-400" />
                )}
                <span className="text-sm text-secondary-900">Has Canadian Relative</span>
              </div>
              <div className="flex items-center gap-2">
                {submission.has_police_record ? (
                  <XCircle className="w-5 h-5 text-error-600" />
                ) : (
                  <CheckCircle className="w-5 h-5 text-success-600" />
                )}
                <span className="text-sm text-secondary-900">Criminal Record: {submission.has_police_record ? 'Yes' : 'No'}</span>
              </div>
              {submission.available_funds > 0 && (
                <div className="border-l-4 border-primary-500 pl-4 py-2 col-span-2">
                  <p className="text-sm font-medium text-secondary-500 mb-1">Available Funds</p>
                  <p className="text-base text-secondary-900">CAD {submission.available_funds.toLocaleString()}</p>
                </div>
              )}
            </div>
          </Card>

          {/* Eligibility Results */}
          {Object.keys(eligibilityResults).length > 0 && (
            <Card className="bg-gradient-to-br from-success-50 to-primary-50 border-success-200">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-success-200 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-success-700" />
                </div>
                <h2 className="text-xl font-bold text-success-900">Eligibility Results</h2>
              </div>
              {eligiblePathways.length > 0 ? (
                <div className="mb-4">
                  <Badge variant="success" className="text-lg px-4 py-2 mb-4">
                    Eligible for {eligiblePathways.length} Pathway{eligiblePathways.length > 1 ? 's' : ''}
                  </Badge>
                  <div className="space-y-3">
                    {Object.entries(eligibilityResults).map(([pathway, result]: [string, any]) => (
                      <div key={pathway} className="border-l-4 border-success-500 pl-4 py-2 bg-white rounded">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-semibold text-secondary-900">{pathway}</h3>
                          {result?.eligible ? (
                            <Badge variant="success">Eligible</Badge>
                          ) : (
                            <Badge variant="warning">Not Eligible</Badge>
                          )}
                        </div>
                        {result?.readinessScore !== undefined && (
                          <div className="mb-2">
                            <div className="flex items-center justify-between text-sm mb-1">
                              <span className="text-secondary-600">Readiness Score</span>
                              <span className="font-bold text-secondary-900">{result.readinessScore}%</span>
                            </div>
                            <div className="h-2 bg-secondary-200 rounded-full overflow-hidden">
                              <div
                                className={`h-full ${
                                  result.readinessScore >= 80 ? 'bg-success-500' :
                                  result.readinessScore >= 60 ? 'bg-info-500' :
                                  result.readinessScore >= 40 ? 'bg-warning-500' : 'bg-error-500'
                                }`}
                                style={{ width: `${result.readinessScore}%` }}
                              />
                            </div>
                          </div>
                        )}
                        {result?.missingRequirements && result.missingRequirements.length > 0 && (
                          <div className="mt-2">
                            <p className="text-xs font-medium text-secondary-500 mb-1">Missing Requirements:</p>
                            <ul className="text-xs text-secondary-600 space-y-1">
                              {result.missingRequirements.map((req: string, idx: number) => (
                                <li key={idx}>• {req}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                        {result?.recommendations && result.recommendations.length > 0 && (
                          <div className="mt-2">
                            <p className="text-xs font-medium text-secondary-500 mb-1">Recommendations:</p>
                            <ul className="text-xs text-secondary-600 space-y-1">
                              {result.recommendations.map((rec: string, idx: number) => (
                                <li key={idx}>→ {rec}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="text-secondary-600">No eligible pathways found based on the provided information.</p>
              )}
            </Card>
          )}

          {/* Pathway Specific Data */}
          {submission.pathway_specific_data && Object.keys(submission.pathway_specific_data).length > 0 && (
            <Card>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-accent-200 rounded-full flex items-center justify-center">
                  <FileText className="w-5 h-5 text-accent-700" />
                </div>
                <h2 className="text-xl font-bold text-secondary-900">Pathway-Specific Information</h2>
              </div>
              <div className="space-y-2">
                {Object.entries(submission.pathway_specific_data).map(([key, value]: [string, any]) => (
                  <div key={key} className="border-l-4 border-accent-500 pl-4 py-2">
                    <p className="text-sm font-medium text-secondary-500 mb-1">
                      {key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </p>
                    <p className="text-base text-secondary-900">
                      {typeof value === 'boolean' ? (value ? 'Yes' : 'No') : String(value)}
                    </p>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Footer */}
          <div className="border-t border-secondary-200 pt-6 text-center text-sm text-secondary-500">
            <p>This submission was created through the Pathway Advisor tool.</p>
            <p className="mt-1">For questions or support, please contact our team.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

