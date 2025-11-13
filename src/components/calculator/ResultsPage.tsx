import { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { TrendingUp, Award, Calendar, CheckCircle, AlertCircle, ArrowRight, Download, Sparkles, Loader2 } from 'lucide-react';
import { CRSInputData, CategoryBreakdown } from '../../types';
import { calculateCRS } from '../../utils/crsCalculator';
import { analyzeImprovements } from '../../utils/crsImprovements';
import { ImprovementSuggestions } from './ImprovementSuggestions';
import { api } from '../../lib/api';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import jsPDF from 'jspdf';

interface ResultsPageProps {
  score: number;
  userInfo: { fullName: string; email: string; phone: string };
  calculationData: CRSInputData;
  onStartOver: () => void;
}

export function ResultsPage({ score, userInfo, calculationData, onStartOver }: ResultsPageProps) {
  const { breakdown } = calculateCRS(calculationData);
  const improvementAnalysis = analyzeImprovements(calculationData, score, breakdown);
  const [generatingPDF, setGeneratingPDF] = useState(false);
  const [generatingGuideline, setGeneratingGuideline] = useState(false);
  const [guidelineReport, setGuidelineReport] = useState<any>(null);
  // Use ref to track request state synchronously (prevents race conditions)
  const isGeneratingRef = useRef(false);

  useEffect(() => {
    const saveCalculation = async () => {
      try {
        await api.post('/api/crs/calculate-detailed', {
          user_name: userInfo.fullName,
          user_email: userInfo.email,
          user_phone: userInfo.phone,
          input_data: calculationData,
          crs_score: score,
          category_breakdown: breakdown,
          improvement_suggestions: improvementAnalysis.suggestions,
          session_id: sessionStorage.getItem('sessionId') || 'unknown',
        }, { skipAuth: true });
      } catch (error) {
        console.error('Error saving calculation:', error);
      }
    };

    saveCalculation();
  }, [score, userInfo, calculationData, breakdown, improvementAnalysis]);

  const getScoreMessage = () => {
    if (score >= 520) return { text: 'Excellent Score!', color: 'success', icon: Award };
    if (score >= 500) return { text: 'Competitive Score', color: 'info', icon: TrendingUp };
    if (score >= 450) return { text: 'Good Progress', color: 'warning', icon: CheckCircle };
    return { text: 'Needs Improvement', color: 'error', icon: AlertCircle };
  };

  const message = getScoreMessage();
  const MessageIcon = message.icon;

  const maxScores = {
    coreHumanCapital: calculationData.hasSpouse ? 460 : 500,
    spousePartner: 40,
    skillTransferability: 100,
    additionalPoints: 600,
  };

  // Helper functions for PDF generation
  const getEducationLabel = (education: string): string => {
    const labels: Record<string, string> = {
      'less_than_secondary': 'Less than High School',
      'secondary': 'High School Diploma',
      'one_year_post_secondary': 'One-year Post-Secondary',
      'two_year_post_secondary': 'Two-year Post-Secondary',
      'bachelor': "Bachelor's Degree",
      'two_or_more_certificates': 'Two or More Degrees',
      'master': "Master's Degree",
      'phd': 'PhD/Doctorate',
    };
    return labels[education] || education;
  };

  const getLanguageLevelLabel = (level: number): string => {
    if (level === 0) return 'No proficiency';
    if (level >= 11) return `CLB ${level} (or NCLC ${level})`;
    return `CLB ${level}`;
  };

  const getWorkExperienceLabel = (exp: string | number | undefined): string => {
    if (exp === undefined || exp === null) return 'None';
    
    // Handle string values
    if (typeof exp === 'string') {
      const labels: Record<string, string> = {
        'none': 'None or less than a year',
        '1_year': '1 year',
        '2_years': '2 years',
        '3_years': '3 years',
        '4_years': '4 years',
        '5_plus_years': '5 or more years',
      };
      return labels[exp] || exp;
    }
    
    // Handle numeric values (for backward compatibility)
    if (typeof exp === 'number') {
      if (exp === 0) return 'None';
      if (exp === 1) return '1 year';
      if (exp < 5) return `${exp} years`;
      return '5+ years';
    }
    
    return 'None';
  };

  // Convert CRSInputData to ImmigrationProfileSchema format
  const convertToImmigrationProfile = () => {
    // Map education levels (matching CRS calculator values)
    const educationMap: Record<string, string> = {
      'less_than_secondary': 'Less than High School',
      'secondary': 'High School Diploma',
      'one_year_post_secondary': 'One-year Post-Secondary',
      'two_year_post_secondary': 'Two-year Post-Secondary',
      'bachelor': "Bachelor's Degree",
      'two_or_more_certificates': 'Two or More Degrees',
      'master': "Master's Degree",
      'phd': 'PhD/Doctorate',
    };

    // Convert language scores to string format
    const formatLanguageScores = (lang: { speaking: number; listening: number; reading: number; writing: number }) => {
      return `L${lang.listening} R${lang.reading} W${lang.writing} S${lang.speaking} (CLB ${Math.min(lang.speaking, lang.listening, lang.reading, lang.writing)})`;
    };

    // Determine pathway based on score and profile
    let pathway = 'Express Entry';
    if (calculationData.provincialNomination) {
      pathway = 'PNP';
    } else if (score < 400) {
      pathway = 'Study Visa'; // Suggest study visa for lower scores
    }

    // Get work experience years
    const getWorkYears = (exp: string): number => {
      if (exp === 'none') return 0;
      if (exp === '1_year') return 1;
      if (exp === '2_years') return 2;
      if (exp === '3_years') return 3;
      if (exp === '4_years') return 4;
      if (exp === '5_plus_years') return 5;
      return 0;
    };

    return {
      user_name: userInfo.fullName,
      user_email: userInfo.email,
      user_phone: userInfo.phone,
      path: pathway,
      age: calculationData.age,
      marital_status: calculationData.hasSpouse ? 'Married' : 'Single',
      citizenship: 'Not specified',
      residence_country: 'Not specified',
      highest_degree: educationMap[calculationData.education] || calculationData.education,
      field_of_study: 'Not specified',
      canadian_credential: calculationData.canadianEducation ? educationMap[calculationData.canadianEducation] : 'No',
      eca_completed: 'Not specified',
      english_test: 'IELTS/CELPIP',
      english_scores: formatLanguageScores(calculationData.firstLanguage),
      french_test: calculationData.hasSecondLanguage && calculationData.secondLanguage ? 'TEF Canada/TCF Canada' : 'None',
      french_scores: calculationData.hasSecondLanguage && calculationData.secondLanguage 
        ? formatLanguageScores(calculationData.secondLanguage)
        : 'None',
      foreign_experience_years: getWorkYears(calculationData.foreignWorkExperience || 'none'),
      canadian_experience_years: getWorkYears(calculationData.canadianWorkExperience),
      occupation_noc: 'Not specified',
      funds: 'Not specified',
      spouse: calculationData.hasSpouse ? 'Yes' : 'No',
      sibling_in_canada: calculationData.hasSiblingInCanada ? 'Yes' : 'No',
      relative_in_canada: 'Not specified',
      user_notes: `CRS Score: ${score} points. ${calculationData.provincialNomination ? 'Has Provincial Nomination.' : ''} ${calculationData.hasJobOffer ? 'Has Job Offer.' : ''} ${calculationData.hasCertificateOfQualification ? 'Has Certificate of Qualification.' : ''}`,
    };
  };

  const generateAIGuideline = async () => {
    // Prevent multiple simultaneous requests using ref (synchronous check)
    if (isGeneratingRef.current) {
      console.log('AI guideline generation already in progress, ignoring duplicate request');
      return;
    }

    try {
      console.log('Starting AI guideline generation...');
      // Set loading state immediately and mark as in progress
      isGeneratingRef.current = true;
      setGeneratingGuideline(true);
      
      // Validate required data
      if (!calculationData || !userInfo) {
        throw new Error('Missing required data. Please complete the calculator first.');
      }
      
      // Convert CRS data to immigration profile format
      console.log('Converting CRS data to immigration profile...', { calculationData, userInfo, score });
      const profile = convertToImmigrationProfile();
      console.log('Converted profile:', profile);
      
      // Validate profile has required fields
      if (!profile.user_name || !profile.user_email) {
        throw new Error('Missing user information. Please ensure name and email are provided.');
      }
      
      // Call AI provider endpoint
      console.log('Calling AI provider endpoint:', '/api/ai-provider/generate-report');
      console.log('Request payload:', JSON.stringify(profile, null, 2));
      const response = await api.post('/api/ai-provider/generate-report', profile, { skipAuth: true });
      console.log('AI provider response:', response);
      
      // Store the report
      setGuidelineReport(response);
      console.log('Report stored:', response);
      
      // Download PDF file
      if (response.pdf_url) {
        // Construct full URL
        let pdfUrl = response.pdf_url;
        
        // If it's a relative URL, make it absolute
        if (!pdfUrl.startsWith('http')) {
          // Ensure it starts with a slash
          if (!pdfUrl.startsWith('/')) {
            pdfUrl = '/' + pdfUrl;
          }
          // Construct full URL with API base URL
          // Use dynamic API URL detection
          const { getApiUrl } = await import('../../lib/api');
          const apiBaseUrl = getApiUrl();
          pdfUrl = `${apiBaseUrl}${pdfUrl}`;
        }
        
        console.log('Downloading PDF from:', pdfUrl);
        
        try {
          // Fetch the PDF file
          const pdfResponse = await fetch(pdfUrl);
          if (!pdfResponse.ok) {
            throw new Error(`Failed to fetch PDF: ${pdfResponse.status} ${pdfResponse.statusText}`);
          }
          
          // Get the PDF as a blob
          const blob = await pdfResponse.blob();
          console.log('PDF blob received, size:', blob.size, 'bytes');
          
          // Create a blob URL
          const blobUrl = window.URL.createObjectURL(blob);
          
          // Create a temporary anchor element to trigger download
          const link = document.createElement('a');
          link.href = blobUrl;
          link.download = response.pdf_filename || `immigration_report_${new Date().toISOString().split('T')[0]}.pdf`;
          link.style.display = 'none';
          
          // Append to body, click, and remove
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          
          // Clean up the blob URL after a short delay
          setTimeout(() => {
            window.URL.revokeObjectURL(blobUrl);
          }, 100);
          
          console.log('PDF download initiated successfully');
          
          // Show success message (non-blocking)
          console.log('✅ AI Guideline PDF downloaded successfully!');
        } catch (fetchError) {
          console.error('Error downloading PDF:', fetchError);
          // Fallback: try to open in new tab
          console.log('Falling back to opening PDF in new tab...');
          const fallbackWindow = window.open(pdfUrl, '_blank');
          if (!fallbackWindow) {
            alert('PDF generated successfully! However, the download was blocked. Please click the link in the console or check your browser settings.');
            console.log('PDF URL:', pdfUrl);
          }
        }
      } else {
        console.warn('No PDF URL in response:', response);
        alert('PDF generated but URL is missing. Please check the console for details.');
      }
    } catch (error: any) {
      console.error('Error generating AI guideline:', error);
      console.error('Error details:', {
        message: error?.message,
        response: error?.response,
        stack: error?.stack
      });
      
      const errorMessage = error?.response?.data?.detail 
        || error?.response?.data?.message 
        || error?.message 
        || 'Unknown error occurred';
      
      alert(`Failed to generate guideline: ${errorMessage}`);
    } finally {
      // Reset both state and ref
      isGeneratingRef.current = false;
      setGeneratingGuideline(false);
    }
  };

  const generatePDF = () => {
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
      pdf.text('CRS CALCULATION REPORT', margin, 18);
      
      pdf.setFontSize(8.5);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(51, 65, 85);
      const generatedDate = new Date().toLocaleDateString('en-US', {
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
      pdf.text(`Name: ${userInfo.fullName}`, candidateBoxX + 3, 18);
      pdf.text(`Email: ${userInfo.email}`, candidateBoxX + 3, 22);
      pdf.text(`Phone: ${userInfo.phone}`, candidateBoxX + 3, 26);
      pdf.text('Type: Anonymous', candidateBoxX + 3, 30);
      
      yPosition = 55;

      // Score Box
      if (score !== null && score !== undefined) {
        const scoreStatus = score >= 500 ? 'Excellent' :
                           score >= 450 ? 'Good' : 'Needs Improvement';
        
        checkPageBreak(50);
        
        const scoreBoxY = yPosition;
        const scoreBoxHeight = 35;
        
        pdf.setFillColor(248, 250, 252);
        pdf.setDrawColor(203, 213, 225);
        pdf.setLineWidth(0.5);
        pdf.rect(margin, scoreBoxY, pageWidth - (margin * 2), scoreBoxHeight);
        pdf.fill();
        pdf.stroke();
        
        pdf.setFontSize(38);
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(30, 64, 175);
        pdf.text(`${score}`, margin + 10, scoreBoxY + 16);
        
        pdf.setFontSize(10);
        pdf.setTextColor(51, 65, 85);
        pdf.setFont('helvetica', 'normal');
        pdf.text('out of 1200 points', margin + 10, scoreBoxY + 21);
        
        const badgeBgColors = score >= 500 ? [220, 252, 231] :
                             score >= 450 ? [254, 243, 199] :
                             [254, 226, 226];
        const badgeColors = score >= 500 ? [22, 163, 74] :
                           score >= 450 ? [234, 179, 8] :
                           [239, 68, 68];
        pdf.setFillColor(badgeBgColors[0], badgeBgColors[1], badgeBgColors[2]);
        pdf.setDrawColor(badgeColors[0], badgeColors[1], badgeColors[2]);
        pdf.setLineWidth(0.5);
        pdf.rect(margin + 10, scoreBoxY + 23, 45, 8);
        pdf.fill();
        pdf.stroke();
        
        pdf.setTextColor(15, 23, 42);
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(8.5);
        pdf.text(scoreStatus.toUpperCase(), margin + 15, scoreBoxY + 28);
        
        // Score Breakdown Table
        const tableX = pageWidth - margin - 75;
        const tableY = scoreBoxY + 5;
        
        pdf.setFillColor(219, 234, 254);
        pdf.setDrawColor(147, 197, 253);
        pdf.setLineWidth(0.3);
        pdf.rect(tableX, tableY, 70, 6);
        pdf.fill();
        pdf.stroke();
        
        pdf.setTextColor(30, 64, 175);
        pdf.setFontSize(7.5);
        pdf.setFont('helvetica', 'bold');
        pdf.text('CATEGORY', tableX + 2, tableY + 4);
        pdf.text('POINTS', tableX + 50, tableY + 4);
        
        const categories = [
          { label: 'Core Human Capital', points: breakdown.coreHumanCapital || 0 },
          { label: 'Spouse/Partner', points: breakdown.spousePartner || 0 },
          { label: 'Skill Transferability', points: breakdown.skillTransferability || 0 },
          { label: 'Additional Points', points: breakdown.additionalPoints || 0 },
        ];
        
        let rowY = tableY + 6;
        categories.forEach((cat, index) => {
          if (index % 2 === 0) {
            pdf.setFillColor(255, 255, 255);
          } else {
            pdf.setFillColor(248, 250, 252);
          }
          pdf.rect(tableX, rowY, 70, 5);
          pdf.fill();
          
          pdf.setTextColor(30, 41, 59);
          pdf.setFontSize(7);
          pdf.setFont('helvetica', 'normal');
          pdf.text(cat.label, tableX + 2, rowY + 3.5);
          
          pdf.setFont('helvetica', 'bold');
          pdf.setTextColor(30, 64, 175);
          pdf.text(`${cat.points}`, tableX + 50, rowY + 3.5);
          
          rowY += 5;
        });
        
        pdf.setDrawColor(203, 213, 225);
        pdf.setLineWidth(0.3);
        pdf.rect(tableX, tableY, 70, 26);
        pdf.stroke();
        
        yPosition = scoreBoxY + scoreBoxHeight + 15;
      }

      // Calculation Details
      addSectionHeader('Calculation Details');

      if (calculationData.age !== undefined) {
        addField('Age:', `${calculationData.age} years old`);
      }

      if (calculationData.education) {
        addField('Highest Level of Education:', getEducationLabel(calculationData.education));
      }

      if (calculationData.firstLanguage) {
        addField('First Official Language Proficiency:', '');
        yPosition -= 2;
        addField('  Speaking:', getLanguageLevelLabel(calculationData.firstLanguage.speaking || 0));
        addField('  Listening:', getLanguageLevelLabel(calculationData.firstLanguage.listening || 0));
        addField('  Reading:', getLanguageLevelLabel(calculationData.firstLanguage.reading || 0));
        addField('  Writing:', getLanguageLevelLabel(calculationData.firstLanguage.writing || 0));
      }

      if (calculationData.hasSecondLanguage && calculationData.secondLanguage) {
        addField('Second Official Language Proficiency:', '');
        yPosition -= 2;
        addField('  Speaking:', getLanguageLevelLabel(calculationData.secondLanguage.speaking || 0));
        addField('  Listening:', getLanguageLevelLabel(calculationData.secondLanguage.listening || 0));
        addField('  Reading:', getLanguageLevelLabel(calculationData.secondLanguage.reading || 0));
        addField('  Writing:', getLanguageLevelLabel(calculationData.secondLanguage.writing || 0));
      }

      if (calculationData.canadianWorkExperience) {
        addField('Canadian Work Experience:', getWorkExperienceLabel(calculationData.canadianWorkExperience));
      }

      if (calculationData.foreignWorkExperience) {
        addField('Foreign Work Experience:', getWorkExperienceLabel(calculationData.foreignWorkExperience));
      }

      if (calculationData.hasSpouse && calculationData.spouseData) {
        addSectionHeader('Spouse/Partner Information');
        if (calculationData.spouseData.education) {
          addField('Education:', getEducationLabel(calculationData.spouseData.education));
        }
        if (calculationData.spouseData.language) {
          addField('Language Proficiency:', '');
          yPosition -= 2;
          addField('  Speaking:', getLanguageLevelLabel(calculationData.spouseData.language.speaking || 0));
          addField('  Listening:', getLanguageLevelLabel(calculationData.spouseData.language.listening || 0));
          addField('  Reading:', getLanguageLevelLabel(calculationData.spouseData.language.reading || 0));
          addField('  Writing:', getLanguageLevelLabel(calculationData.spouseData.language.writing || 0));
        }
        if (calculationData.spouseData.canadianWorkExperience) {
          addField('Canadian Work Experience:', getWorkExperienceLabel(calculationData.spouseData.canadianWorkExperience));
        }
      }

      addSectionHeader('Additional Factors');
      addField('Provincial Nomination:', calculationData.provincialNomination ? 'Yes' : 'No');
      addField('Valid Job Offer:', calculationData.hasJobOffer ? 
        `Yes${calculationData.jobOfferDetails?.teerCategory ? ` (TEER ${calculationData.jobOfferDetails.teerCategory})` : ''}` : 'No');
      addField('Certificate of Qualification:', calculationData.hasCertificateOfQualification ? 'Yes' : 'No');
      if (calculationData.canadianEducation) {
        addField('Canadian Education:', getEducationLabel(calculationData.canadianEducation));
      }
      addField('Sibling in Canada:', calculationData.hasSiblingInCanada ? 'Yes' : 'No');

      // Improvement Suggestions
      if (improvementAnalysis.suggestions && improvementAnalysis.suggestions.length > 0) {
        addSectionHeader('Improvement Suggestions');
        improvementAnalysis.suggestions.forEach((suggestion: any) => {
          checkPageBreak(lineHeight * 8);
          
          // Suggestion Title (no icon)
          pdf.setFontSize(9.5);
          pdf.setTextColor(30, 64, 175);
          pdf.setFont('helvetica', 'bold');
          const titleText = suggestion.title || 'Suggestion';
          const titleLines = pdf.splitTextToSize(titleText, maxWidth - 8);
          let lineY = yPosition;
          titleLines.forEach((line: string) => {
            pdf.text(line, margin + 6, lineY);
            lineY += 4;
          });
          yPosition = lineY + 2;
          
          // Category and Potential Gain
          pdf.setFontSize(7.5);
          pdf.setTextColor(100, 116, 139);
          pdf.setFont('helvetica', 'normal');
          const metaInfo = `${suggestion.category || ''} | Potential Gain: ${suggestion.potentialGain || 'N/A'} | Difficulty: ${suggestion.difficulty || 'N/A'}`;
          pdf.text(metaInfo, margin + 6, yPosition);
          yPosition += 4;
          
          // Description
          if (suggestion.description) {
            pdf.setFontSize(8.5);
            pdf.setTextColor(15, 23, 42);
            pdf.setFont('helvetica', 'normal');
            const descLines = pdf.splitTextToSize(suggestion.description, maxWidth - 8);
            descLines.forEach((line: string) => {
              pdf.text(line, margin + 6, yPosition);
              yPosition += 3.5;
            });
            yPosition += 2;
          }
          
          // Action Steps
          if (suggestion.actionSteps && suggestion.actionSteps.length > 0) {
            pdf.setFontSize(8);
            pdf.setTextColor(100, 116, 139);
            pdf.setFont('helvetica', 'normal');
            pdf.text('Action Steps:', margin + 6, yPosition);
            yPosition += 4;
            
            suggestion.actionSteps.forEach((step: string, index: number) => {
              checkPageBreak(lineHeight * 2);
              pdf.setFontSize(7.5);
              pdf.setTextColor(51, 65, 85);
              pdf.setFont('helvetica', 'normal');
              const stepText = `${index + 1}. ${step}`;
              const stepLines = pdf.splitTextToSize(stepText, maxWidth - 12);
              stepLines.forEach((line: string) => {
                pdf.text(line, margin + 6, yPosition);
                yPosition += 3;
              });
            });
            yPosition += 2;
          }
          
          yPosition += 3;
        });
      }

      // Footer
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
        pdf.text('Canada Immigration CRS Calculator', margin, pageHeight - 8);
        
        pdf.setFontSize(6.5);
        pdf.setTextColor(148, 163, 184);
        const confText = 'This document contains confidential information. For official use only.';
        const confTextWidth = pdf.getTextWidth(confText);
        pdf.text(confText, (pageWidth - confTextWidth) / 2, pageHeight - 4);
      }

      // Save PDF
      const sanitizedName = userInfo.fullName.replace(/[^a-zA-Z0-9_-]/g, '_');
      const fileName = `CRS_Calculation_${sanitizedName}_${new Date().toISOString().split('T')[0]}.pdf`;
      pdf.save(fileName);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert(`Failed to generate PDF: ${error instanceof Error ? error.message : 'Unknown error'}. Please try again.`);
    } finally {
      setGeneratingPDF(false);
    }
  };

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-8 animate-slide-up">
          <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full bg-${message.color}-100 text-${message.color}-600 mb-4`}>
            <MessageIcon className="w-8 h-8" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-secondary-900 mb-4">
            Your CRS Score
          </h1>
          <div className="inline-flex items-baseline gap-2 mb-4">
            <span className="text-7xl md:text-8xl font-bold text-primary-600">{score}</span>
            <span className="text-3xl text-secondary-500">/ 1200</span>
          </div>
          <Badge variant={message.color} className="text-lg px-4 py-2">
            {message.text}
          </Badge>

          <div className="mt-6 flex gap-4 justify-center flex-wrap">
            <Button
              onClick={generatePDF}
              disabled={generatingPDF}
              size="lg"
              variant="outline"
              className="inline-flex items-center"
            >
              <Download className="w-5 h-5 mr-2" />
              {generatingPDF ? 'Generating PDF...' : 'Download Report (PDF)'}
            </Button>
            <Button
              onClick={(e) => {
                e.preventDefault();
                console.log('Button clicked, calling generateAIGuideline...');
                generateAIGuideline();
              }}
              disabled={generatingGuideline}
              size="lg"
              className="inline-flex items-center"
            >
              {generatingGuideline ? (
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              ) : (
                <Sparkles className="w-5 h-5 mr-2" />
              )}
              {generatingGuideline ? 'Generating Guideline...' : 'Get Your Guideline'}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card>
            <h3 className="text-lg font-semibold text-secondary-900 mb-4">Your Information</h3>
            <div className="space-y-2 text-sm">
              <p className="text-secondary-700">
                <strong>Name:</strong> {userInfo.fullName}
              </p>
              <p className="text-secondary-700">
                <strong>Email:</strong> {userInfo.email}
              </p>
              <p className="text-secondary-700">
                <strong>Phone:</strong> {userInfo.phone}
              </p>
              <p className="text-secondary-700 flex items-center">
                <Calendar className="w-4 h-4 mr-1" />
                <strong>Calculated:</strong> {new Date().toLocaleDateString()}
              </p>
            </div>
          </Card>

          <Card>
            <h3 className="text-lg font-semibold text-secondary-900 mb-4">Score Breakdown</h3>
            <div className="space-y-3">
              {Object.entries(breakdown).map(([key, value]) => {
                const labels: Record<string, string> = {
                  coreHumanCapital: 'Core/Human Capital',
                  spousePartner: 'Spouse/Partner',
                  skillTransferability: 'Skill Transferability',
                  additionalPoints: 'Additional Points',
                };
                const max = maxScores[key as keyof CategoryBreakdown];
                const percentage = (value / max) * 100;

                return (
                  <div key={key}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-secondary-700">{labels[key]}</span>
                      <span className="font-semibold text-secondary-900">
                        {value} / {max}
                      </span>
                    </div>
                    <div className="h-2 bg-secondary-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary-600 transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>

        <Card className="mb-8">
          <h3 className="text-xl font-semibold text-secondary-900 mb-4">
            What Your Score Means
          </h3>
          {score >= 520 ? (
            <div className="space-y-3">
              <p className="text-secondary-700">
                With a score of <strong>{score}</strong>, you have an excellent chance of receiving an Invitation to Apply (ITA) in most Express Entry draws.
              </p>
              <ul className="list-disc list-inside space-y-2 text-secondary-700">
                <li>Your score is above the typical cut-off for general draws</li>
                <li>You may receive an ITA in the next few draws</li>
                <li>Focus on preparing your documents and maintaining your qualifications</li>
              </ul>
            </div>
          ) : score >= 500 ? (
            <div className="space-y-3">
              <p className="text-secondary-700">
                With a score of <strong>{score}</strong>, you have a competitive score for Express Entry. You may receive an ITA in general or category-based draws.
              </p>
              <ul className="list-disc list-inside space-y-2 text-secondary-700">
                <li>Monitor recent draw results to see where you stand</li>
                <li>Consider improving language scores or gaining more work experience</li>
                <li>Look into Provincial Nominee Programs (PNPs) for guaranteed selection</li>
              </ul>
            </div>
          ) : score >= 450 ? (
            <div className="space-y-3">
              <p className="text-secondary-700">
                With a score of <strong>{score}</strong>, you have a foundation to build on. Focus on improving your qualifications to become more competitive.
              </p>
              <ul className="list-disc list-inside space-y-2 text-secondary-700">
                <li>Improve language test scores (CLB 9+ in all skills adds significant points)</li>
                <li>Consider additional education or Canadian credentials</li>
                <li>Explore Provincial Nominee Programs that match your profile</li>
                <li>Gain more Canadian work experience if possible</li>
              </ul>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-secondary-700">
                With a score of <strong>{score}</strong>, you'll need to improve your qualifications significantly to be competitive in Express Entry.
              </p>
              <ul className="list-disc list-inside space-y-2 text-secondary-700">
                <li>Focus on achieving high language test scores (target CLB 9+)</li>
                <li>Consider pursuing higher education or Canadian credentials</li>
                <li>Research Provincial Nominee Programs with lower requirements</li>
                <li>Book a consultation to explore all your immigration pathways</li>
              </ul>
            </div>
          )}
        </Card>

        {/* Improvement Suggestions Section */}
        <div className="my-12">
          <ImprovementSuggestions analysis={improvementAnalysis} />
        </div>

        <div className="bg-gradient-to-br from-primary-600 to-primary-700 rounded-xl p-8 text-white text-center mb-8">
          <h3 className="text-2xl font-bold mb-4">Ready for the Next Step?</h3>
          <p className="text-primary-100 mb-6 max-w-2xl mx-auto">
            Book a professional consultation to get personalized guidance on improving your score and navigating the immigration process.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/consultation">
              <Button size="lg" variant="secondary">
                Book Consultation
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            <Button size="lg" variant="outline" onClick={onStartOver} className="border-white text-white hover:bg-white hover:text-primary-600">
              Calculate Again
            </Button>
          </div>
        </div>

        <Card>
          <h3 className="text-lg font-semibold text-secondary-900 mb-4">Important Reminders</h3>
          <ul className="space-y-2 text-sm text-secondary-700">
            <li className="flex items-start">
              <CheckCircle className="w-5 h-5 mr-2 text-success-500 flex-shrink-0 mt-0.5" />
              <span>This calculator provides an estimate. Your official score is determined by IRCC when you create an Express Entry profile.</span>
            </li>
            <li className="flex items-start">
              <CheckCircle className="w-5 h-5 mr-2 text-success-500 flex-shrink-0 mt-0.5" />
              <span>CRS scores and draw cut-offs change regularly. Monitor official IRCC announcements for the latest information.</span>
            </li>
            <li className="flex items-start">
              <CheckCircle className="w-5 h-5 mr-2 text-success-500 flex-shrink-0 mt-0.5" />
              <span>All claims in your Express Entry profile must be supported by valid documents.</span>
            </li>
          </ul>
        </Card>
      </div>
    </div>
  );
}
