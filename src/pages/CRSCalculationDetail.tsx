import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Download, User, Mail, Phone, Calendar, Award, FileText, CheckCircle, XCircle, MapPin, Briefcase, GraduationCap } from 'lucide-react';
import { api } from '../lib/api';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import jsPDF from 'jspdf';

interface CalculationDetail {
  id: string;
  type: 'authenticated' | 'detailed' | 'partial';
  user_id?: number;
  user_name?: string;
  user_email?: string;
  user_phone?: string;
  calculation_date: string;
  score?: number;
  category_breakdown: {
    coreHumanCapital?: number;
    spousePartner?: number;
    skillTransferability?: number;
    additionalPoints?: number;
  };
  input_data: any;
  improvement_suggestions?: any;
  status: string;
  created_at: string;
  updated_at: string;
  current_step?: string;
  completed_steps?: string[];
}

export function CRSCalculationDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const [calculation, setCalculation] = useState<CalculationDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [generatingPDF, setGeneratingPDF] = useState(false);
  const pdfRef = useRef<HTMLDivElement>(null);

  // Get the return path from location state, default to dashboard with calculations tab
  const returnPath = (location.state as any)?.from || '/admin/dashboard?tab=calculations';

  useEffect(() => {
    if (id) {
      fetchCalculation();
    }
  }, [id]);

  const fetchCalculation = async () => {
    try {
      setLoading(true);
      const data = await api.get(`/api/crs/calculation/${id}`);
      setCalculation(data);
    } catch (error) {
      console.error('Error fetching calculation:', error);
    } finally {
      setLoading(false);
    }
  };

  const generatePDF = () => {
    if (!calculation) return;

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

      // Helper function to add a new page if needed
      const checkPageBreak = (requiredHeight: number) => {
        if (yPosition + requiredHeight > pageHeight - margin) {
          pdf.addPage();
          yPosition = margin;
          return true;
        }
        return false;
      };

      // Helper function to add text with word wrap
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

      // Helper function to add a section header (professional design)
      const addSectionHeader = (text: string) => {
        checkPageBreak(lineHeight * 4);
        yPosition += sectionSpacing;
        
        // Background bar for section header - Light blue with dark text for visibility
        pdf.setFillColor(219, 234, 254); // Blue-100 - light blue background
        pdf.setDrawColor(147, 197, 253); // Blue-300 - border
        pdf.setLineWidth(0.3);
        pdf.rect(margin, yPosition - 1, pageWidth - (margin * 2), 5);
        pdf.fill();
        pdf.stroke();
        
        // Dark text on light blue background - ensures visibility
        pdf.setTextColor(30, 64, 175); // Blue-700 - dark blue text
        pdf.setFontSize(10.5);
        pdf.setFont('helvetica', 'bold');
        pdf.text(text.toUpperCase(), margin + 2, yPosition + 3);
        
        yPosition += 7;
      };

      // Helper function to add a field in two columns (professional styling)
      const addField = (label: string, value: string, labelWidth: number = 60) => {
        checkPageBreak(lineHeight * 2);
        const valueX = margin + labelWidth;
        const valueWidth = maxWidth - labelWidth - 5;
        
        pdf.setFontSize(8);
        pdf.setTextColor(100, 116, 139); // Slate-500 - professional gray for labels
        pdf.setFont('helvetica', 'normal');
        pdf.text(label, margin, yPosition);
        
        pdf.setFontSize(9);
        pdf.setTextColor(15, 23, 42); // Slate-900 - dark professional text
        pdf.setFont('helvetica', 'normal');
        const valueLines = pdf.splitTextToSize(value, valueWidth);
        let lineY = yPosition;
        valueLines.forEach((line: string) => {
          pdf.text(line, valueX, lineY);
          lineY += 4;
        });
        yPosition = Math.max(yPosition + 4, lineY) + 2;
      };

      // Extract candidate info
      const candidateInfo = {
        fullName: calculation.input_data?.fullName || calculation.user_name || 'N/A',
        email: calculation.input_data?.email || calculation.user_email || 'N/A',
        phone: calculation.input_data?.phone || calculation.user_phone || 'N/A',
      };

      // ===== PROFESSIONAL HEADER =====
      // Main header bar - Light blue background with dark text for better visibility
      pdf.setFillColor(219, 234, 254); // Blue-100 - light blue background
      pdf.setDrawColor(147, 197, 253); // Blue-300 - border
      pdf.setLineWidth(0.5);
      pdf.rect(0, 0, pageWidth, 45);
      pdf.fill();
      pdf.stroke();
      
      // Dark text on light blue header - ensures visibility
      pdf.setTextColor(30, 64, 175); // Blue-700 - dark blue text
      pdf.setFontSize(20);
      pdf.setFont('helvetica', 'bold');
      pdf.text('CRS CALCULATION REPORT', margin, 18);
      
      pdf.setFontSize(8.5);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(51, 65, 85); // Slate-700 - dark gray for date
      const generatedDate = new Date(calculation.created_at).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
      pdf.text(`Generated: ${generatedDate}`, margin, 25);
      
      // Candidate Information Box in Header (right side) - Professional white box
      const candidateBoxX = pageWidth - margin - 70;
      pdf.setFillColor(249, 250, 251); // Off-white background
      pdf.setDrawColor(209, 213, 219); // Subtle gray border
      pdf.setLineWidth(0.4);
      pdf.rect(candidateBoxX, 8, 70, 35);
      pdf.fill();
      pdf.stroke();
      
      pdf.setTextColor(15, 23, 42); // Dark blue for label
      pdf.setFontSize(7.5);
      pdf.setFont('helvetica', 'bold');
      pdf.text('CANDIDATE INFORMATION', candidateBoxX + 3, 13);
      
      pdf.setTextColor(30, 41, 59); // Dark slate for text
      pdf.setFontSize(7);
      pdf.setFont('helvetica', 'normal');
      pdf.text(`Name: ${candidateInfo.fullName}`, candidateBoxX + 3, 18);
      pdf.text(`Email: ${candidateInfo.email}`, candidateBoxX + 3, 22);
      pdf.text(`Phone: ${candidateInfo.phone}`, candidateBoxX + 3, 26);
      
      const calcType = calculation.type === 'authenticated' ? 'Authenticated' :
                      calculation.type === 'detailed' ? 'Anonymous' : 'In Progress';
      pdf.text(`Type: ${calcType}`, candidateBoxX + 3, 30);
      
      yPosition = 55;

      // ===== SCORE TABLE (Luxurious Design) =====
      if (calculation.score !== null && calculation.score !== undefined) {
        const breakdown = calculation.category_breakdown || {};
        const scoreStatus = calculation.score >= 500 ? 'Excellent' :
                           calculation.score >= 450 ? 'Good' : 'Needs Improvement';
        const statusColor = calculation.score >= 500 ? [0, 150, 0] :
                           calculation.score >= 450 ? [255, 150, 0] : [200, 0, 0];
        
        checkPageBreak(50);
        
        // Main Score Box - Professional and elegant
        const scoreBoxY = yPosition;
        const scoreBoxHeight = 35;
        
        // Background for score box - Professional light gray
        pdf.setFillColor(248, 250, 252); // Slate-50 - very light professional gray
        pdf.setDrawColor(203, 213, 225); // Slate-300 - subtle border
        pdf.setLineWidth(0.5);
        pdf.rect(margin, scoreBoxY, pageWidth - (margin * 2), scoreBoxHeight);
        pdf.fill();
        pdf.stroke();
        
        // Large Score Display - Professional blue
        pdf.setFontSize(38);
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(30, 64, 175); // Blue-700 - professional blue
        pdf.text(`${calculation.score}`, margin + 10, scoreBoxY + 16);
        
        // Score out of 1200 - Dark text for visibility on light background
        pdf.setFontSize(10);
        pdf.setTextColor(51, 65, 85); // Slate-700 - darker gray for better visibility
        pdf.setFont('helvetica', 'normal');
        pdf.text('out of 1200 points', margin + 10, scoreBoxY + 21);
        
        // Status Badge - Professional color coding with visible text
        const badgeColors = calculation.score >= 500 ? [22, 163, 74] : // Green-600 for excellent
                           calculation.score >= 450 ? [234, 179, 8] : // Yellow-500 for good
                           [239, 68, 68]; // Red-500 for needs improvement
        // Draw badge background with lighter shade for better text visibility
        const badgeBgColors = calculation.score >= 500 ? [220, 252, 231] : // Green-100 - light green
                             calculation.score >= 450 ? [254, 243, 199] : // Yellow-100 - light yellow
                             [254, 226, 226]; // Red-100 - light red
        pdf.setFillColor(badgeBgColors[0], badgeBgColors[1], badgeBgColors[2]);
        pdf.setDrawColor(badgeColors[0], badgeColors[1], badgeColors[2]);
        pdf.setLineWidth(0.5);
        pdf.rect(margin + 10, scoreBoxY + 23, 45, 8);
        pdf.fill();
        pdf.stroke();
        // Dark text on light colored badge - ensures visibility
        pdf.setTextColor(15, 23, 42); // Slate-900 - dark text for visibility
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(8.5);
        // Draw text with explicit color setting
        const badgeText = scoreStatus.toUpperCase();
        pdf.text(badgeText, margin + 15, scoreBoxY + 28);
        
        // Score Breakdown Table (Right side of score box) - Professional table design
        const tableX = pageWidth - margin - 75;
        const tableY = scoreBoxY + 5;
        
        // Table header background - Light blue with dark text for visibility
        pdf.setFillColor(219, 234, 254); // Blue-100 - light blue background
        pdf.setDrawColor(147, 197, 253); // Blue-300 - border
        pdf.setLineWidth(0.3);
        pdf.rect(tableX, tableY, 70, 6);
        pdf.fill();
        pdf.stroke();
        // Dark text on light blue background - ensures visibility
        pdf.setTextColor(30, 64, 175); // Blue-700 - dark blue text
        pdf.setFontSize(7.5);
        pdf.setFont('helvetica', 'bold');
        pdf.text('CATEGORY', tableX + 2, tableY + 4);
        pdf.text('POINTS', tableX + 50, tableY + 4);
        
        // Table rows
        const categories = [
          { label: 'Core Human Capital', points: breakdown.coreHumanCapital || 0 },
          { label: 'Spouse/Partner', points: breakdown.spousePartner || 0 },
          { label: 'Skill Transferability', points: breakdown.skillTransferability || 0 },
          { label: 'Additional Points', points: breakdown.additionalPoints || 0 },
        ];
        
        let rowY = tableY + 6;
        categories.forEach((cat, index) => {
          // Alternate row colors - Professional subtle alternation
          if (index % 2 === 0) {
            pdf.setFillColor(255, 255, 255);
          } else {
            pdf.setFillColor(248, 250, 252); // Very light gray
          }
          pdf.rect(tableX, rowY, 70, 5);
          pdf.fill();
          
          pdf.setTextColor(30, 41, 59); // Dark slate for text
          pdf.setFontSize(7);
          pdf.setFont('helvetica', 'normal');
          pdf.text(cat.label, tableX + 2, rowY + 3.5);
          
          pdf.setFont('helvetica', 'bold');
          pdf.setTextColor(30, 64, 175); // Professional blue for numbers
          pdf.text(`${cat.points}`, tableX + 50, rowY + 3.5);
          
          rowY += 5;
        });
        
        // Table border - Professional subtle border
        pdf.setDrawColor(203, 213, 225); // Slate-300
        pdf.setLineWidth(0.3);
        pdf.rect(tableX, tableY, 70, 26);
        pdf.stroke();
        
        yPosition = scoreBoxY + scoreBoxHeight + 15;
      }

      // Calculation Details
      const inputData = calculation.input_data || {};
      addSectionHeader('Calculation Details');

      if (inputData.age !== undefined) {
        addField('Age:', `${inputData.age} years old`);
      }

      if (inputData.education) {
        addField('Highest Level of Education:', getEducationLabel(inputData.education));
      }

      if (inputData.firstLanguage) {
        addField('First Official Language Proficiency:', '');
        yPosition -= 2;
        addField('  Speaking:', getLanguageLevelLabel(inputData.firstLanguage.speaking || 0));
        addField('  Listening:', getLanguageLevelLabel(inputData.firstLanguage.listening || 0));
        addField('  Reading:', getLanguageLevelLabel(inputData.firstLanguage.reading || 0));
        addField('  Writing:', getLanguageLevelLabel(inputData.firstLanguage.writing || 0));
      }

      if (inputData.hasSecondLanguage && inputData.secondLanguage) {
        addField('Second Official Language Proficiency:', '');
        yPosition -= 2;
        addField('  Speaking:', getLanguageLevelLabel(inputData.secondLanguage.speaking || 0));
        addField('  Listening:', getLanguageLevelLabel(inputData.secondLanguage.listening || 0));
        addField('  Reading:', getLanguageLevelLabel(inputData.secondLanguage.reading || 0));
        addField('  Writing:', getLanguageLevelLabel(inputData.secondLanguage.writing || 0));
      }

      if (inputData.canadianWorkExperience) {
        addField('Canadian Work Experience:', getWorkExperienceLabel(inputData.canadianWorkExperience));
      }

      if (inputData.foreignWorkExperience) {
        addField('Foreign Work Experience:', getWorkExperienceLabel(inputData.foreignWorkExperience));
      }

      if (inputData.hasSpouse && inputData.spouseData) {
        addSectionHeader('Spouse/Partner Information');
        if (inputData.spouseData.education) {
          addField('Education:', getEducationLabel(inputData.spouseData.education));
        }
        if (inputData.spouseData.language) {
          addField('Language Proficiency:', '');
          yPosition -= 2;
          addField('  Speaking:', getLanguageLevelLabel(inputData.spouseData.language.speaking || 0));
          addField('  Listening:', getLanguageLevelLabel(inputData.spouseData.language.listening || 0));
          addField('  Reading:', getLanguageLevelLabel(inputData.spouseData.language.reading || 0));
          addField('  Writing:', getLanguageLevelLabel(inputData.spouseData.language.writing || 0));
        }
        if (inputData.spouseData.canadianWorkExperience) {
          addField('Canadian Work Experience:', getWorkExperienceLabel(inputData.spouseData.canadianWorkExperience));
        }
      }

      addSectionHeader('Additional Factors');
      addField('Provincial Nomination:', inputData.provincialNomination ? 'Yes' : 'No');
      addField('Valid Job Offer:', inputData.hasJobOffer ? 
        `Yes${inputData.jobOfferDetails?.teerCategory ? ` (TEER ${inputData.jobOfferDetails.teerCategory})` : ''}` : 'No');
      addField('Certificate of Qualification:', inputData.hasCertificateOfQualification ? 'Yes' : 'No');
      if (inputData.canadianEducation) {
        addField('Canadian Education:', getEducationLabel(inputData.canadianEducation));
      }
      addField('Sibling in Canada:', inputData.hasSiblingInCanada ? 'Yes' : 'No');

      // Improvement Suggestions - Professional styling
      if (calculation.improvement_suggestions && Array.isArray(calculation.improvement_suggestions) && calculation.improvement_suggestions.length > 0) {
        addSectionHeader('Improvement Suggestions');
        calculation.improvement_suggestions.forEach((suggestion: string, index: number) => {
          checkPageBreak(lineHeight * 2);
          
          // Bullet point indicator
          pdf.setFillColor(30, 64, 175); // Professional blue
          pdf.circle(margin + 2, yPosition + 1.5, 1.5, 'F');
          
          pdf.setFontSize(8.5);
          pdf.setTextColor(15, 23, 42); // Dark professional text
          pdf.setFont('helvetica', 'normal');
          const lines = pdf.splitTextToSize(suggestion, maxWidth - 8);
          let lineY = yPosition;
          lines.forEach((line: string) => {
            pdf.text(line, margin + 6, lineY);
            lineY += 3.5;
          });
          yPosition = lineY + 3;
        });
      }

      // ===== PROFESSIONAL FOOTER =====
      const totalPages = pdf.internal.pages.length - 1;
      for (let i = 1; i <= totalPages; i++) {
        pdf.setPage(i);
        
        // Footer line - Professional subtle line
        pdf.setDrawColor(203, 213, 225); // Slate-300
        pdf.setLineWidth(0.3);
        pdf.line(margin, pageHeight - 12, pageWidth - margin, pageHeight - 12);
        
        // Footer text - Professional gray
        pdf.setFontSize(7.5);
        pdf.setTextColor(100, 116, 139); // Slate-500
        pdf.setFont('helvetica', 'normal');
        pdf.text(`Page ${i} of ${totalPages}`, pageWidth - margin - 15, pageHeight - 8);
        pdf.text('Canada Immigration CRS Calculator', margin, pageHeight - 8);
        
        // Confidentiality notice (centered) - Subtle professional text
        pdf.setFontSize(6.5);
        pdf.setFont('helvetica', 'normal');
        pdf.setTextColor(148, 163, 184); // Slate-400 - subtle gray
        const confText = 'This document contains confidential information. For official use only.';
        const confTextWidth = pdf.getTextWidth(confText);
        pdf.text(confText, (pageWidth - confTextWidth) / 2, pageHeight - 4);
      }

      // Save PDF
      const candidateName = calculation.input_data?.fullName || calculation.user_name || 'User';
      const sanitizedName = candidateName.replace(/[^a-zA-Z0-9_-]/g, '_');
      const fileName = `CRS_Calculation_${sanitizedName}_${new Date(calculation.created_at).toISOString().split('T')[0]}.pdf`;
      pdf.save(fileName);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert(`Failed to generate PDF: ${error instanceof Error ? error.message : 'Unknown error'}. Please try again.`);
    } finally {
      setGeneratingPDF(false);
    }
  };

  const formatValue = (value: any): string => {
    if (value === null || value === undefined) return 'N/A';
    if (typeof value === 'boolean') return value ? 'Yes' : 'No';
    if (typeof value === 'object') return JSON.stringify(value, null, 2);
    return String(value);
  };

  const getEducationLabel = (education: string): string => {
    const labels: Record<string, string> = {
      'less_than_high_school': 'Less than High School',
      'high_school': 'High School Diploma',
      'one_year_program': 'One-Year Post-Secondary Program',
      'two_year_program': 'Two-Year Post-Secondary Program',
      'bachelor': "Bachelor's Degree",
      'two_or_more_degrees': 'Two or More Degrees',
      'masters': "Master's Degree",
      'phd': 'PhD',
    };
    return labels[education] || education;
  };

  const getWorkExperienceLabel = (exp: string): string => {
    const labels: Record<string, string> = {
      'none': 'None or less than a year',
      'less_than_one': 'Less than 1 year',
      '1_year': '1 year',
      '2_years': '2 years',
      '3_years': '3 years',
      '4_years': '4 years',
      '5_plus_years': '5 or more years',
      // Legacy values (for backward compatibility)
      'one': '1 year',
      'two': '2 years',
      'three': '3 years',
      'four': '4 years',
      'five_or_more': '5 years or more',
    };
    return labels[exp] || exp;
  };

  const getLanguageLevelLabel = (level: number): string => {
    const labels: Record<number, string> = {
      0: 'No proficiency',
      1: 'Basic',
      2: 'Intermediate',
      3: 'Advanced',
      4: 'Native',
    };
    return labels[level] || `Level ${level}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-secondary-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-secondary-600">Loading calculation details...</p>
        </div>
      </div>
    );
  }

  if (!calculation) {
    return (
      <div className="min-h-screen bg-secondary-50 flex items-center justify-center">
          <div className="text-center">
            <XCircle className="w-16 h-16 text-error-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-secondary-900 mb-2">Calculation Not Found</h2>
            <p className="text-secondary-600 mb-4">The calculation you're looking for doesn't exist.</p>
            <Button onClick={() => navigate(returnPath)}>Back</Button>
          </div>
      </div>
    );
  }

  const breakdown = calculation.category_breakdown || {};
  const inputData = calculation.input_data || {};

  // Extract personal information from input_data (form data) first, then fall back to user fields
  const candidateInfo = {
    fullName: inputData.fullName || calculation.user_name || 'N/A',
    email: inputData.email || calculation.user_email || 'N/A',
    phone: inputData.phone || calculation.user_phone || 'N/A',
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
            {generatingPDF ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Generating PDF...
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                Download PDF
              </>
            )}
          </Button>
        </div>

        <div ref={pdfRef} className="bg-white rounded-xl shadow-lg p-8 space-y-8">
          {/* Header */}
          <div className="border-b border-secondary-200 pb-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-3xl font-bold text-secondary-900 mb-2">CRS Calculation Report</h1>
                <p className="text-secondary-600">
                  Generated on {new Date(calculation.created_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
              </div>
              {calculation.score !== null && calculation.score !== undefined && (
                <div className="text-right">
                  <div className="text-5xl font-bold text-primary-600 mb-1">{calculation.score}</div>
                  <div className="text-sm text-secondary-600">CRS Score</div>
                  <Badge
                    variant={
                      calculation.score >= 500 ? 'success' :
                      calculation.score >= 450 ? 'warning' : 'error'
                    }
                    className="mt-2"
                  >
                    {calculation.score >= 500 ? 'Excellent' :
                     calculation.score >= 450 ? 'Good' : 'Needs Improvement'}
                  </Badge>
                </div>
              )}
            </div>
          </div>

          {/* Candidate Personal Information Card */}
          <Card className="bg-gradient-to-br from-primary-50 via-primary-50 to-primary-100 border-primary-300 shadow-md">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-primary-200">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-primary-600 rounded-xl flex items-center justify-center shadow-lg">
                  <User className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-primary-900">Candidate Profile</h2>
                  <p className="text-sm text-primary-600">Personal information provided during calculation</p>
                </div>
              </div>
              <Badge 
                variant={calculation.type === 'authenticated' ? 'success' : calculation.type === 'detailed' ? 'info' : 'warning'}
                className="text-sm px-3 py-1"
              >
                {calculation.type === 'authenticated' ? 'Authenticated' :
                 calculation.type === 'detailed' ? 'Anonymous' : 'In Progress'}
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
                    <p className="text-lg font-bold text-primary-900 mt-1">{candidateInfo.fullName}</p>
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
                    <p className="text-lg font-bold text-primary-900 mt-1 break-all">{candidateInfo.email}</p>
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
                    <p className="text-lg font-bold text-primary-900 mt-1">{candidateInfo.phone}</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-6 pt-4 border-t border-primary-200">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2 text-primary-600">
                  <Calendar className="w-4 h-4" />
                  <span>Calculation Date: {new Date(calculation.created_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}</span>
                </div>
                <div className="text-primary-600">
                  <span className="font-medium">Status:</span>{' '}
                  <Badge variant={calculation.status === 'completed' ? 'success' : calculation.status === 'in_progress' ? 'warning' : 'secondary'} className="ml-2">
                    {calculation.status === 'completed' ? 'Completed' :
                     calculation.status === 'in_progress' ? 'In Progress' : calculation.status}
                  </Badge>
                </div>
              </div>
            </div>
          </Card>

          {/* Category Breakdown */}
          {calculation.score !== null && calculation.score !== undefined && (
            <Card>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-info-200 rounded-full flex items-center justify-center">
                  <Award className="w-5 h-5 text-info-700" />
                </div>
                <h2 className="text-xl font-bold text-secondary-900">Score Breakdown</h2>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-secondary-50 rounded-lg">
                  <p className="text-2xl font-bold text-secondary-900">{breakdown.coreHumanCapital || 0}</p>
                  <p className="text-sm text-secondary-600 mt-1">Core Human Capital</p>
                </div>
                <div className="text-center p-4 bg-secondary-50 rounded-lg">
                  <p className="text-2xl font-bold text-secondary-900">{breakdown.spousePartner || 0}</p>
                  <p className="text-sm text-secondary-600 mt-1">Spouse/Partner</p>
                </div>
                <div className="text-center p-4 bg-secondary-50 rounded-lg">
                  <p className="text-2xl font-bold text-secondary-900">{breakdown.skillTransferability || 0}</p>
                  <p className="text-sm text-secondary-600 mt-1">Skill Transferability</p>
                </div>
                <div className="text-center p-4 bg-secondary-50 rounded-lg">
                  <p className="text-2xl font-bold text-secondary-900">{breakdown.additionalPoints || 0}</p>
                  <p className="text-sm text-secondary-600 mt-1">Additional Points</p>
                </div>
              </div>
            </Card>
          )}

          {/* Input Data - Detailed Questions and Answers */}
          <Card>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-success-200 rounded-full flex items-center justify-center">
                <FileText className="w-5 h-5 text-success-700" />
              </div>
              <h2 className="text-xl font-bold text-secondary-900">Calculation Details</h2>
            </div>
            <div className="space-y-6">
              {/* Age */}
              {inputData.age !== undefined && (
                <div className="border-l-4 border-primary-500 pl-4 py-2">
                  <p className="text-sm font-medium text-secondary-500 mb-1">Age</p>
                  <p className="text-base text-secondary-900">{inputData.age} years old</p>
                </div>
              )}

              {/* Education */}
              {inputData.education && (
                <div className="border-l-4 border-primary-500 pl-4 py-2">
                  <p className="text-sm font-medium text-secondary-500 mb-1">Highest Level of Education</p>
                  <p className="text-base text-secondary-900">{getEducationLabel(inputData.education)}</p>
                </div>
              )}

              {/* First Language */}
              {inputData.firstLanguage && (
                <div className="border-l-4 border-primary-500 pl-4 py-2">
                  <p className="text-sm font-medium text-secondary-500 mb-1">First Official Language Proficiency</p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-2">
                    <div>
                      <p className="text-xs text-secondary-500">Speaking</p>
                      <p className="text-sm font-medium text-secondary-900">
                        {getLanguageLevelLabel(inputData.firstLanguage.speaking || 0)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-secondary-500">Listening</p>
                      <p className="text-sm font-medium text-secondary-900">
                        {getLanguageLevelLabel(inputData.firstLanguage.listening || 0)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-secondary-500">Reading</p>
                      <p className="text-sm font-medium text-secondary-900">
                        {getLanguageLevelLabel(inputData.firstLanguage.reading || 0)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-secondary-500">Writing</p>
                      <p className="text-sm font-medium text-secondary-900">
                        {getLanguageLevelLabel(inputData.firstLanguage.writing || 0)}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Second Language */}
              {inputData.hasSecondLanguage && inputData.secondLanguage && (
                <div className="border-l-4 border-primary-500 pl-4 py-2">
                  <p className="text-sm font-medium text-secondary-500 mb-1">Second Official Language Proficiency</p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-2">
                    <div>
                      <p className="text-xs text-secondary-500">Speaking</p>
                      <p className="text-sm font-medium text-secondary-900">
                        {getLanguageLevelLabel(inputData.secondLanguage.speaking || 0)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-secondary-500">Listening</p>
                      <p className="text-sm font-medium text-secondary-900">
                        {getLanguageLevelLabel(inputData.secondLanguage.listening || 0)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-secondary-500">Reading</p>
                      <p className="text-sm font-medium text-secondary-900">
                        {getLanguageLevelLabel(inputData.secondLanguage.reading || 0)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-secondary-500">Writing</p>
                      <p className="text-sm font-medium text-secondary-900">
                        {getLanguageLevelLabel(inputData.secondLanguage.writing || 0)}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Work Experience */}
              {inputData.canadianWorkExperience && (
                <div className="border-l-4 border-primary-500 pl-4 py-2">
                  <p className="text-sm font-medium text-secondary-500 mb-1">Canadian Work Experience</p>
                  <p className="text-base text-secondary-900">{getWorkExperienceLabel(inputData.canadianWorkExperience)}</p>
                </div>
              )}

              {inputData.foreignWorkExperience && (
                <div className="border-l-4 border-primary-500 pl-4 py-2">
                  <p className="text-sm font-medium text-secondary-500 mb-1">Foreign Work Experience</p>
                  <p className="text-base text-secondary-900">{getWorkExperienceLabel(inputData.foreignWorkExperience)}</p>
                </div>
              )}

              {/* Spouse Information */}
              {inputData.hasSpouse && (
                <div className="border-l-4 border-primary-500 pl-4 py-2">
                  <p className="text-sm font-medium text-secondary-500 mb-1">Spouse/Partner Information</p>
                  {inputData.spouseData && (
                    <div className="mt-2 space-y-2">
                      {inputData.spouseData.education && (
                        <p className="text-sm text-secondary-900">
                          <span className="font-medium">Education:</span> {getEducationLabel(inputData.spouseData.education)}
                        </p>
                      )}
                      {inputData.spouseData.language && (
                        <div>
                          <p className="text-sm font-medium text-secondary-900 mb-1">Language Proficiency:</p>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                            <span>Speaking: {getLanguageLevelLabel(inputData.spouseData.language.speaking || 0)}</span>
                            <span>Listening: {getLanguageLevelLabel(inputData.spouseData.language.listening || 0)}</span>
                            <span>Reading: {getLanguageLevelLabel(inputData.spouseData.language.reading || 0)}</span>
                            <span>Writing: {getLanguageLevelLabel(inputData.spouseData.language.writing || 0)}</span>
                          </div>
                        </div>
                      )}
                      {inputData.spouseData.canadianWorkExperience && (
                        <p className="text-sm text-secondary-900">
                          <span className="font-medium">Canadian Work Experience:</span> {getWorkExperienceLabel(inputData.spouseData.canadianWorkExperience)}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Additional Factors */}
              <div className="border-l-4 border-primary-500 pl-4 py-2">
                <p className="text-sm font-medium text-secondary-500 mb-2">Additional Factors</p>
                <div className="space-y-1">
                  {inputData.provincialNomination !== undefined && (
                    <div className="flex items-center gap-2">
                      {inputData.provincialNomination ? (
                        <CheckCircle className="w-4 h-4 text-success-600" />
                      ) : (
                        <XCircle className="w-4 h-4 text-secondary-400" />
                      )}
                      <span className="text-sm text-secondary-900">Provincial Nomination</span>
                    </div>
                  )}
                  {inputData.hasJobOffer !== undefined && (
                    <div className="flex items-center gap-2">
                      {inputData.hasJobOffer ? (
                        <CheckCircle className="w-4 h-4 text-success-600" />
                      ) : (
                        <XCircle className="w-4 h-4 text-secondary-400" />
                      )}
                      <span className="text-sm text-secondary-900">Valid Job Offer</span>
                      {inputData.hasJobOffer && inputData.jobOfferDetails?.teerCategory && (
                        <span className="text-xs text-secondary-500 ml-2">
                          (TEER {inputData.jobOfferDetails.teerCategory})
                        </span>
                      )}
                    </div>
                  )}
                  {inputData.hasCertificateOfQualification !== undefined && (
                    <div className="flex items-center gap-2">
                      {inputData.hasCertificateOfQualification ? (
                        <CheckCircle className="w-4 h-4 text-success-600" />
                      ) : (
                        <XCircle className="w-4 h-4 text-secondary-400" />
                      )}
                      <span className="text-sm text-secondary-900">Certificate of Qualification</span>
                    </div>
                  )}
                  {inputData.canadianEducation && (
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-success-600" />
                      <span className="text-sm text-secondary-900">
                        Canadian Education: {getEducationLabel(inputData.canadianEducation)}
                      </span>
                    </div>
                  )}
                  {inputData.hasSiblingInCanada !== undefined && (
                    <div className="flex items-center gap-2">
                      {inputData.hasSiblingInCanada ? (
                        <CheckCircle className="w-4 h-4 text-success-600" />
                      ) : (
                        <XCircle className="w-4 h-4 text-secondary-400" />
                      )}
                      <span className="text-sm text-secondary-900">Sibling in Canada</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </Card>

          {/* Improvement Suggestions */}
          {calculation.improvement_suggestions && Array.isArray(calculation.improvement_suggestions) && calculation.improvement_suggestions.length > 0 && (
            <Card className="bg-warning-50 border-warning-200">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-warning-200 rounded-full flex items-center justify-center">
                  <Award className="w-5 h-5 text-warning-700" />
                </div>
                <h2 className="text-xl font-bold text-warning-900">Improvement Suggestions</h2>
              </div>
              <ul className="space-y-2">
                {calculation.improvement_suggestions.map((suggestion: string, index: number) => (
                  <li key={index} className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-warning-600 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-warning-900">{suggestion}</span>
                  </li>
                ))}
              </ul>
            </Card>
          )}

          {/* Footer */}
          <div className="border-t border-secondary-200 pt-6 text-center text-sm text-secondary-500">
            <p>This report was generated automatically by the Canada Immigration CRS Calculator.</p>
            <p className="mt-1">For questions or support, please contact our team.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

