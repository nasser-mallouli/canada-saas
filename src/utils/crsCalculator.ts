import { CRSInputData, CategoryBreakdown } from '../types';

export function calculateCRS(input: CRSInputData): { score: number; breakdown: CategoryBreakdown } {
  const hasSpouse = input.hasSpouse;

  const coreHumanCapital = calculateCoreHumanCapital(input, hasSpouse);
  const spousePartner = hasSpouse ? calculateSpousePoints(input) : 0;
  const skillTransferability = calculateSkillTransferability(input);
  const additionalPoints = calculateAdditionalPoints(input);

  const breakdown: CategoryBreakdown = {
    coreHumanCapital,
    spousePartner,
    skillTransferability,
    additionalPoints,
  };

  const score = coreHumanCapital + spousePartner + skillTransferability + additionalPoints;

  return { score, breakdown };
}

function calculateCoreHumanCapital(input: CRSInputData, hasSpouse: boolean): number {
  let points = 0;

  points += calculateAgePoints(input.age, hasSpouse);
  points += calculateEducationPoints(input.education, hasSpouse);
  points += calculateFirstLanguagePoints(input.firstLanguage, hasSpouse);
  points += calculateCanadianWorkPoints(input.canadianWorkExperience, hasSpouse);

  return points;
}

function calculateAgePoints(age: number, hasSpouse: boolean): number {
  if (hasSpouse) {
    if (age < 18) return 0;
    if (age === 18) return 90;
    if (age === 19) return 95;
    if (age >= 20 && age <= 29) return 100;
    if (age === 30) return 95;
    if (age === 31) return 90;
    if (age === 32) return 85;
    if (age === 33) return 80;
    if (age === 34) return 75;
    if (age === 35) return 70;
    if (age === 36) return 65;
    if (age === 37) return 60;
    if (age === 38) return 55;
    if (age === 39) return 50;
    if (age === 40) return 45;
    if (age === 41) return 35;
    if (age === 42) return 25;
    if (age === 43) return 15;
    if (age === 44) return 5;
    return 0;
  } else {
    if (age < 18) return 0;
    if (age === 18) return 99;
    if (age === 19) return 105;
    if (age >= 20 && age <= 29) return 110;
    if (age === 30) return 105;
    if (age === 31) return 99;
    if (age === 32) return 94;
    if (age === 33) return 88;
    if (age === 34) return 83;
    if (age === 35) return 77;
    if (age === 36) return 72;
    if (age === 37) return 66;
    if (age === 38) return 61;
    if (age === 39) return 55;
    if (age === 40) return 50;
    if (age === 41) return 39;
    if (age === 42) return 28;
    if (age === 43) return 17;
    if (age === 44) return 6;
    return 0;
  }
}

function calculateEducationPoints(education: string, hasSpouse: boolean): number {
  const pointsMap = hasSpouse
    ? {
        'less_than_secondary': 0,
        'secondary': 28,
        'one_year_post_secondary': 84,
        'two_year_post_secondary': 91,
        'bachelor': 112,
        'two_or_more_certificates': 119,
        'master': 126,
        'phd': 140,
      }
    : {
        'less_than_secondary': 0,
        'secondary': 30,
        'one_year_post_secondary': 90,
        'two_year_post_secondary': 98,
        'bachelor': 120,
        'two_or_more_certificates': 128,
        'master': 135,
        'phd': 150,
      };

  return pointsMap[education as keyof typeof pointsMap] || 0;
}

function calculateFirstLanguagePoints(
  language: { speaking: number; listening: number; reading: number; writing: number },
  hasSpouse: boolean
): number {
  let totalPoints = 0;

  const pointsPerSkill = (clbLevel: number, hasSpouse: boolean): number => {
    if (hasSpouse) {
      if (clbLevel >= 10) return 32;
      if (clbLevel === 9) return 29;
      if (clbLevel === 8) return 22;
      if (clbLevel === 7) return 16;
      if (clbLevel === 6) return 8;
      if (clbLevel === 5) return 6;
      if (clbLevel === 4) return 6;
      return 0;
    } else {
      if (clbLevel >= 10) return 34;
      if (clbLevel === 9) return 31;
      if (clbLevel === 8) return 23;
      if (clbLevel === 7) return 17;
      if (clbLevel === 6) return 9;
      if (clbLevel === 5) return 6;
      if (clbLevel === 4) return 6;
      return 0;
    }
  };

  totalPoints += pointsPerSkill(language.speaking, hasSpouse);
  totalPoints += pointsPerSkill(language.listening, hasSpouse);
  totalPoints += pointsPerSkill(language.reading, hasSpouse);
  totalPoints += pointsPerSkill(language.writing, hasSpouse);

  return totalPoints;
}

function calculateCanadianWorkPoints(experience: string, hasSpouse: boolean): number {
  const pointsMap = hasSpouse
    ? {
        'none': 0,
        '1_year': 35,
        '2_years': 46,
        '3_years': 56,
        '4_years': 63,
        '5_plus_years': 70,
      }
    : {
        'none': 0,
        '1_year': 40,
        '2_years': 53,
        '3_years': 64,
        '4_years': 72,
        '5_plus_years': 80,
      };

  return pointsMap[experience as keyof typeof pointsMap] || 0;
}

function calculateSpousePoints(input: CRSInputData): number {
  if (!input.spouseData) return 0;

  let points = 0;

  const educationMap = {
    'less_than_secondary': 0,
    'secondary': 2,
    'one_year_post_secondary': 6,
    'two_year_post_secondary': 7,
    'bachelor': 8,
    'two_or_more_certificates': 9,
    'master': 10,
    'phd': 10,
  };

  points += educationMap[input.spouseData.education as keyof typeof educationMap] || 0;

  const pointsPerSkill = (clbLevel: number): number => {
    if (clbLevel >= 9) return 5;
    if (clbLevel === 8) return 3;
    if (clbLevel === 7) return 3;
    if (clbLevel >= 5) return 1;
    return 0;
  };

  points += pointsPerSkill(input.spouseData.language.speaking);
  points += pointsPerSkill(input.spouseData.language.listening);
  points += pointsPerSkill(input.spouseData.language.reading);
  points += pointsPerSkill(input.spouseData.language.writing);

  const workMap = {
    'none': 0,
    '1_year': 5,
    '2_years': 7,
    '3_years': 8,
    '4_years': 9,
    '5_plus_years': 10,
  };

  points += workMap[input.spouseData.canadianWorkExperience as keyof typeof workMap] || 0;

  return points;
}

function calculateSkillTransferability(input: CRSInputData): number {
  let points = 0;

  const hasPostSecondary = ['one_year_post_secondary', 'two_year_post_secondary', 'bachelor', 'two_or_more_certificates', 'master', 'phd'].includes(input.education);

  const canadianWorkYears = getWorkYears(input.canadianWorkExperience);
  const foreignWorkYears = input.foreignWorkExperience ? getWorkYears(input.foreignWorkExperience) : 0;

  const firstLangCLB = Math.min(
    input.firstLanguage.speaking,
    input.firstLanguage.listening,
    input.firstLanguage.reading,
    input.firstLanguage.writing
  );
  const hasStrongLanguage = firstLangCLB >= 7;
  const hasVeryStrongLanguage = firstLangCLB >= 9;

  let educationWithLanguagePoints = 0;
  if (hasPostSecondary && hasVeryStrongLanguage) {
    educationWithLanguagePoints = 50;
  } else if (hasPostSecondary && hasStrongLanguage) {
    educationWithLanguagePoints = 25;
  }

  let educationWithCanadianWorkPoints = 0;
  if (hasPostSecondary && canadianWorkYears >= 1) {
    if (canadianWorkYears === 1) educationWithCanadianWorkPoints = 13;
    else if (canadianWorkYears >= 2) educationWithCanadianWorkPoints = 25;
  }

  let foreignWorkWithLanguagePoints = 0;
  if (foreignWorkYears >= 1 && hasVeryStrongLanguage) {
    if (foreignWorkYears >= 3) foreignWorkWithLanguagePoints = 50;
    else if (foreignWorkYears === 2) foreignWorkWithLanguagePoints = 25;
    else foreignWorkWithLanguagePoints = 13;
  } else if (foreignWorkYears >= 1 && hasStrongLanguage) {
    if (foreignWorkYears >= 3) foreignWorkWithLanguagePoints = 25;
    else if (foreignWorkYears === 2) foreignWorkWithLanguagePoints = 13;
    else foreignWorkWithLanguagePoints = 13;
  }

  let foreignWorkWithCanadianWorkPoints = 0;
  if (foreignWorkYears >= 1 && canadianWorkYears >= 1) {
    if (foreignWorkYears >= 3 && canadianWorkYears >= 2) foreignWorkWithCanadianWorkPoints = 50;
    else if (foreignWorkYears >= 3 && canadianWorkYears === 1) foreignWorkWithCanadianWorkPoints = 25;
    else if (foreignWorkYears <= 2 && canadianWorkYears >= 2) foreignWorkWithCanadianWorkPoints = 25;
    else foreignWorkWithCanadianWorkPoints = 13;
  }

  let tradeWithLanguagePoints = 0;
  if (input.hasCertificateOfQualification && hasStrongLanguage) {
    tradeWithLanguagePoints = 50;
  } else if (input.hasCertificateOfQualification) {
    tradeWithLanguagePoints = 25;
  }

  points = Math.max(
    educationWithLanguagePoints,
    educationWithCanadianWorkPoints,
    foreignWorkWithLanguagePoints,
    foreignWorkWithCanadianWorkPoints,
    tradeWithLanguagePoints
  );

  return Math.min(points, 100);
}

function getWorkYears(experience: string): number {
  const map: Record<string, number> = {
    'none': 0,
    '1_year': 1,
    '2_years': 2,
    '3_years': 3,
    '4_years': 4,
    '5_plus_years': 5,
  };
  return map[experience] || 0;
}

function calculateAdditionalPoints(input: CRSInputData): number {
  let points = 0;

  if (input.provincialNomination) {
    points += 600;
  }

  if (input.canadianEducation) {
    const educationMap: Record<string, number> = {
      'one_two_year': 15,
      'three_plus_year': 30,
      'two_or_more': 30,
    };
    points += educationMap[input.canadianEducation] || 0;
  }

  if (input.hasSiblingInCanada) {
    points += 15;
  }

  if (input.hasSecondLanguage && input.secondLanguage) {
    const clbLevels = [
      input.secondLanguage.speaking,
      input.secondLanguage.listening,
      input.secondLanguage.reading,
      input.secondLanguage.writing,
    ];

    const pointsPerSkill = (clb: number): number => {
      if (clb >= 9) return 6;
      if (clb >= 7) return 6;
      if (clb >= 5) return 6;
      return 0;
    };

    const secondLangPoints = clbLevels.reduce((sum, clb) => sum + pointsPerSkill(clb), 0);
    points += Math.min(secondLangPoints, 24);
  }

  const firstLangCLB = Math.min(
    input.firstLanguage.speaking,
    input.firstLanguage.listening,
    input.firstLanguage.reading,
    input.firstLanguage.writing
  );

  if (input.hasSecondLanguage && input.secondLanguage) {
    const secondLangCLB = Math.min(
      input.secondLanguage.speaking,
      input.secondLanguage.listening,
      input.secondLanguage.reading,
      input.secondLanguage.writing
    );

    if (secondLangCLB >= 7) {
      if (firstLangCLB >= 5) {
        points += 50;
      } else if (firstLangCLB >= 4) {
        points += 25;
      }
    }
  }

  return points;
}
