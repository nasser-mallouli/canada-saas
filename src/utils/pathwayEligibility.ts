export interface PathwayAdvisorData {
  userName: string;
  userEmail: string;
  userPhone: string;
  birthDate: string;
  citizenshipCountry: string;
  residenceCountry: string;
  educationLevel: string;
  workExperienceYears: number;
  fieldOfStudy: string;
  languageTests: Array<{
    type: string;
    listening?: number;
    reading?: number;
    writing?: number;
    speaking?: number;
    overall?: number;
  }>;
  maritalStatus: string;
  hasCanadianRelative: boolean;
  hasJobOffer: boolean;
  hasCanadianExperience: boolean;
  hasPoliceRecord: boolean;
  availableFunds: number;
  pathwayGoal: string;
  pathwaySpecificData: any;
}

export interface PathwayEligibility {
  pathway: string;
  readinessScore: number;
  eligible: boolean;
  missingRequirements: string[];
  recommendations: string[];
  details: string;
}

function calculateAge(birthDate: string): number {
  const today = new Date();
  const birth = new Date(birthDate);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
}

function getIELTSCLB(score: number): number {
  if (score >= 8.5) return 10;
  if (score >= 8.0) return 9;
  if (score >= 7.5) return 9;
  if (score >= 7.0) return 9;
  if (score >= 6.5) return 8;
  if (score >= 6.0) return 7;
  if (score >= 5.5) return 6;
  if (score >= 5.0) return 5;
  if (score >= 4.5) return 4;
  return 0;
}

export function evaluateStudyVisa(data: PathwayAdvisorData): PathwayEligibility {
  let score = 0;
  const missing: string[] = [];
  const recommendations: string[] = [];
  const specific = data.pathwaySpecificData;

  if (specific.hasAcceptanceLetter) {
    score += 40;
  } else {
    missing.push('Letter of Acceptance from a Designated Learning Institution (DLI)');
  }

  const ielts = data.languageTests.find(t => t.type === 'IELTS Academic');
  if (ielts && ielts.overall && ielts.overall >= 6.0) {
    score += 30;
  } else if (ielts && ielts.overall && ielts.overall >= 5.5) {
    score += 20;
    recommendations.push('Improve IELTS score to 6.5+ for better university options');
  } else {
    missing.push('IELTS Academic score of 6.0 or higher');
  }

  const minFunds = 20635 + (specific.tuitionCost || 15000);
  if (data.availableFunds >= minFunds) {
    score += 20;
  } else {
    missing.push(`Proof of funds: $${minFunds.toLocaleString()} CAD (tuition + living expenses)`);
    score += Math.floor((data.availableFunds / minFunds) * 20);
  }

  if (specific.hasHomeCountryTies) {
    score += 10;
  } else {
    recommendations.push('Strengthen ties to home country (job, property, family)');
  }

  const eligible = score >= 70 && specific.hasAcceptanceLetter;

  if (eligible) {
    recommendations.push('Prepare all required documents for visa application');
    recommendations.push('Book medical exam and biometrics appointment');
  }

  return {
    pathway: 'Study Visa',
    readinessScore: score,
    eligible,
    missingRequirements: missing,
    recommendations,
    details: eligible
      ? 'You meet the basic requirements for a Study Permit. Complete your application as soon as possible.'
      : 'You need to address the missing requirements before applying for a Study Permit.'
  };
}

export function evaluateWorkPermit(data: PathwayAdvisorData): PathwayEligibility {
  let score = 0;
  const missing: string[] = [];
  const recommendations: string[] = [];
  const specific = data.pathwaySpecificData;

  if (data.hasJobOffer) {
    score += 50;
    if (specific.hasLMIA) {
      score += 20;
    } else {
      missing.push('LMIA (Labour Market Impact Assessment) approval from employer');
    }
  } else {
    missing.push('Valid job offer from a Canadian employer');
  }

  if (data.workExperienceYears >= 2) {
    score += 20;
  } else if (data.workExperienceYears >= 1) {
    score += 10;
  } else {
    recommendations.push('Gain more relevant work experience in your field');
  }

  if (data.educationLevel === 'Master' || data.educationLevel === 'PhD') {
    score += 10;
  } else if (data.educationLevel === 'Bachelor') {
    score += 5;
  }

  const eligible = data.hasJobOffer && (specific.hasLMIA || specific.isLMIAExempt);

  if (!eligible) {
    recommendations.push('Consider gaining Canadian experience through study (PGWP) first');
    recommendations.push('Look for LMIA-exempt positions (intra-company transfer, CUSMA)');
  }

  return {
    pathway: 'Work Permit',
    readinessScore: score,
    eligible,
    missingRequirements: missing,
    recommendations,
    details: eligible
      ? 'You are eligible for a Work Permit. Your employer must submit the LMIA application.'
      : 'You need a job offer and LMIA approval to qualify for a Work Permit.'
  };
}

export function evaluateExpressEntry(data: PathwayAdvisorData): PathwayEligibility {
  let score = 0;
  const missing: string[] = [];
  const recommendations: string[] = [];
  const specific = data.pathwaySpecificData;
  const age = calculateAge(data.birthDate);

  if (age >= 18 && age <= 35) {
    score += 20;
  } else if (age <= 45) {
    score += Math.floor((45 - age) * 2);
  }

  if (specific.hasECA) {
    if (data.educationLevel === 'PhD') score += 20;
    else if (data.educationLevel === 'Master') score += 18;
    else if (data.educationLevel === 'Bachelor') score += 15;
    else score += 10;
  } else {
    missing.push('Educational Credential Assessment (ECA) from WES, IQAS, or ICAS');
  }

  if (data.workExperienceYears >= 6) score += 15;
  else if (data.workExperienceYears >= 3) score += 12;
  else if (data.workExperienceYears >= 1) score += 8;
  else missing.push('At least 1 year of skilled work experience');

  const ielts = data.languageTests.find(t => t.type === 'IELTS General' || t.type === 'CELPIP');
  if (ielts && ielts.listening && ielts.reading && ielts.writing && ielts.speaking) {
    const avgCLB = (getIELTSCLB(ielts.listening) + getIELTSCLB(ielts.reading) +
                   getIELTSCLB(ielts.writing) + getIELTSCLB(ielts.speaking)) / 4;

    if (avgCLB >= 9) score += 25;
    else if (avgCLB >= 7) score += 20;
    else if (avgCLB >= 5) score += 10;

    if (avgCLB < 7) {
      missing.push('Minimum CLB 7 language proficiency (FSW program)');
    }

    if (avgCLB < 9) {
      recommendations.push('Improve language scores to CLB 9+ for maximum CRS points');
    }
  } else {
    missing.push('Valid IELTS General or CELPIP test (less than 2 years old)');
  }

  if (data.hasJobOffer) score += 10;
  if (data.hasCanadianExperience) score += 5;
  if (data.hasCanadianRelative) score += 5;

  const minFunds = data.maritalStatus === 'Married' ? 18300 : 14700;
  if (data.availableFunds >= minFunds) {
    score += 5;
  } else {
    missing.push(`Proof of funds: $${minFunds.toLocaleString()} CAD`);
  }

  const eligible = score >= 60 && missing.length <= 2;

  if (score < 70) {
    recommendations.push('Consider Provincial Nominee Program (PNP) for 600 additional CRS points');
  }

  if (!data.hasJobOffer) {
    recommendations.push('Obtain a Canadian job offer for 50-200 additional CRS points');
  }

  return {
    pathway: 'Express Entry (PR)',
    readinessScore: score,
    eligible,
    missingRequirements: missing,
    recommendations,
    details: eligible
      ? `You have good prospects for Express Entry. Estimated CRS: ${Math.floor(score * 5)}-${Math.floor(score * 6)} points.`
      : 'You need to improve your profile to be competitive in Express Entry.'
  };
}

export function evaluatePNP(data: PathwayAdvisorData): PathwayEligibility {
  let score = 0;
  const missing: string[] = [];
  const recommendations: string[] = [];
  const specific = data.pathwaySpecificData;

  if (specific.preferredProvince) {
    score += 20;
  } else {
    recommendations.push('Research and select a target province');
  }

  if (data.hasJobOffer && specific.jobInPreferredProvince) {
    score += 30;
  } else {
    missing.push('Job offer in your preferred province');
    recommendations.push('Look for jobs in provinces with active PNP streams');
  }

  const ielts = data.languageTests.find(t => t.type === 'IELTS General' || t.type === 'CELPIP');
  if (ielts) {
    const avgScore = ((ielts.listening || 0) + (ielts.reading || 0) +
                     (ielts.writing || 0) + (ielts.speaking || 0)) / 4;
    if (avgScore >= 6.0) score += 20;
    else if (avgScore >= 5.0) score += 10;
    else missing.push('Minimum CLB 4-7 language proficiency (varies by province)');
  }

  if (data.workExperienceYears >= 2) score += 15;
  if (data.hasCanadianExperience && specific.experienceInProvince) score += 15;

  const eligible = score >= 60 && data.hasJobOffer;

  if (eligible) {
    recommendations.push('Create Express Entry profile if eligible (PNP adds 600 points)');
  } else {
    recommendations.push('Focus on gaining provincial work experience or job offer');
  }

  return {
    pathway: 'Provincial Nominee Program (PNP)',
    readinessScore: score,
    eligible,
    missingRequirements: missing,
    recommendations,
    details: eligible
      ? 'You have good potential for PNP. Focus on provinces that match your profile.'
      : 'PNP typically requires a job offer or provincial work experience.'
  };
}

export function evaluateQuebecPR(data: PathwayAdvisorData): PathwayEligibility {
  let score = 0;
  const missing: string[] = [];
  const recommendations: string[] = [];
  const specific = data.pathwaySpecificData;

  const french = data.languageTests.find(t => t.type === 'TEF' || t.type === 'TCF');
  if (french && specific.frenchLevel) {
    if (specific.frenchLevel === 'B2' || specific.frenchLevel === 'C1' || specific.frenchLevel === 'C2') {
      score += 40;
    } else if (specific.frenchLevel === 'B1') {
      score += 20;
      missing.push('French B2 level or higher (intermediate-high)');
    } else {
      missing.push('French B2 level or higher (intermediate-high)');
    }
  } else {
    missing.push('TEF or TCF French language test with B2+ level');
  }

  if (data.educationLevel === 'Master' || data.educationLevel === 'PhD') score += 20;
  else if (data.educationLevel === 'Bachelor') score += 15;

  if (data.workExperienceYears >= 2) score += 15;
  if (specific.hasQuebecJobOffer) score += 15;

  const age = calculateAge(data.birthDate);
  if (age >= 18 && age <= 35) score += 10;

  const eligible = score >= 60 && french && specific.frenchLevel >= 'B2';

  if (!eligible) {
    recommendations.push('Focus on improving French language skills to B2 level');
    recommendations.push('Consider French language courses in Quebec or online');
  }

  return {
    pathway: 'Quebec PR (CSQ)',
    readinessScore: score,
    eligible,
    missingRequirements: missing,
    recommendations,
    details: eligible
      ? 'You meet Quebec\'s language requirements. Apply through Arrima portal.'
      : 'Quebec requires strong French language skills (B2+) for immigration.'
  };
}

export function evaluateCitizenship(data: PathwayAdvisorData): PathwayEligibility {
  let score = 0;
  const missing: string[] = [];
  const recommendations: string[] = [];
  const specific = data.pathwaySpecificData;

  if (!specific.isPR) {
    missing.push('You must be a Permanent Resident first');
    return {
      pathway: 'Canadian Citizenship',
      readinessScore: 0,
      eligible: false,
      missingRequirements: missing,
      recommendations: ['Complete PR application before considering citizenship'],
      details: 'Citizenship is only available to Permanent Residents.'
    };
  }

  score += 30;

  if (specific.yearsInCanada >= 3) {
    score += 30;
  } else {
    missing.push(`${3 - specific.yearsInCanada} more years of physical presence in Canada`);
  }

  if (specific.filedTaxes) {
    score += 20;
  } else {
    missing.push('Tax filing for at least 3 years');
  }

  const age = calculateAge(data.birthDate);
  if (age >= 18 && age <= 54) {
    const hasLanguage = data.languageTests.some(t => {
      const avg = ((t.listening || 0) + (t.reading || 0) + (t.writing || 0) + (t.speaking || 0)) / 4;
      return avg >= 4.0;
    });

    if (hasLanguage) {
      score += 20;
    } else {
      missing.push('CLB 4 language proficiency proof');
    }
  } else {
    score += 20;
  }

  const eligible = specific.isPR && specific.yearsInCanada >= 3 && specific.filedTaxes && !data.hasPoliceRecord;

  if (eligible) {
    recommendations.push('Prepare citizenship application and study for citizenship test');
    recommendations.push('Gather all PR documents and tax records');
  }

  return {
    pathway: 'Canadian Citizenship',
    readinessScore: score,
    eligible,
    missingRequirements: missing,
    recommendations,
    details: eligible
      ? 'You are eligible to apply for Canadian citizenship.'
      : 'Complete the missing requirements before applying for citizenship.'
  };
}

export function evaluateAllPathways(data: PathwayAdvisorData): PathwayEligibility[] {
  const results: PathwayEligibility[] = [];

  if (data.pathwayGoal === 'study' || data.pathwayGoal === 'all') {
    results.push(evaluateStudyVisa(data));
  }

  if (data.pathwayGoal === 'work' || data.pathwayGoal === 'all') {
    results.push(evaluateWorkPermit(data));
  }

  if (data.pathwayGoal === 'pr' || data.pathwayGoal === 'all') {
    results.push(evaluateExpressEntry(data));
    results.push(evaluatePNP(data));
  }

  if (data.pathwayGoal === 'quebec' || data.pathwayGoal === 'all') {
    results.push(evaluateQuebecPR(data));
  }

  if (data.pathwayGoal === 'citizenship' || data.pathwayGoal === 'all') {
    results.push(evaluateCitizenship(data));
  }

  return results.sort((a, b) => b.readinessScore - a.readinessScore);
}
