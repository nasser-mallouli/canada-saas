import { CRSInputData, CategoryBreakdown } from '../types';

export interface ImprovementSuggestion {
  id: string;
  category: string;
  title: string;
  description: string;
  potentialGain: string;
  difficulty: 'easy' | 'medium' | 'hard';
  timeframe: string;
  priority: 'high' | 'medium' | 'low';
  actionSteps: string[];
  icon: string;
}

export interface ImprovementAnalysis {
  currentScore: number;
  maxPossibleScore: number;
  suggestions: ImprovementSuggestion[];
  quickWins: ImprovementSuggestion[];
  strategicMoves: ImprovementSuggestion[];
}

export function analyzeImprovements(
  input: CRSInputData,
  currentScore: number,
  breakdown: CategoryBreakdown
): ImprovementAnalysis {
  const suggestions: ImprovementSuggestion[] = [];

  // Analyze Age
  analyzeAge(input, suggestions);

  // Analyze Education
  analyzeEducation(input, suggestions);

  // Analyze Language (First)
  analyzeFirstLanguage(input, suggestions);

  // Analyze Second Language
  analyzeSecondLanguage(input, suggestions);

  // Analyze Canadian Work Experience
  analyzeCanadianWork(input, suggestions);

  // Analyze Foreign Work Experience
  analyzeForeignWork(input, suggestions);

  // Analyze Spouse Factors
  analyzeSpouse(input, suggestions);

  // Analyze Additional Points
  analyzeAdditionalPoints(input, suggestions);

  // Analyze Skill Transferability
  analyzeSkillTransferability(input, suggestions);

  // Sort by priority and potential gain
  suggestions.sort((a, b) => {
    const priorityOrder = { high: 3, medium: 2, low: 1 };
    return priorityOrder[b.priority] - priorityOrder[a.priority];
  });

  const quickWins = suggestions.filter(s => s.difficulty === 'easy' && s.priority === 'high');
  const strategicMoves = suggestions.filter(s => s.potentialGain.includes('600') || parseInt(s.potentialGain) >= 50);

  return {
    currentScore,
    maxPossibleScore: 1200,
    suggestions,
    quickWins,
    strategicMoves,
  };
}

function analyzeAge(input: CRSInputData, suggestions: ImprovementSuggestion[]) {
  const age = input.age;
  const hasSpouse = input.hasSpouse;

  if (age > 29 && age < 45) {
    if (hasSpouse && input.spouseData) {
      const spouseAge = input.spouseData.age || age;
      if (spouseAge < age && spouseAge >= 20 && spouseAge <= 29) {
        suggestions.push({
          id: 'switch-principal-applicant',
          category: 'Age Strategy',
          title: 'Switch Principal Applicant',
          description: 'Your spouse is younger and could receive more age points. Consider making them the principal applicant.',
          potentialGain: '40-100 points',
          difficulty: 'easy',
          timeframe: 'Immediate',
          priority: 'high',
          actionSteps: [
            'Compare both profiles completely',
            'Calculate CRS with spouse as principal applicant',
            'Submit new Express Entry profile with spouse as main applicant',
          ],
          icon: '🔄',
        });
      }
    }

    if (age >= 35) {
      suggestions.push({
        id: 'compensate-age',
        category: 'Age Strategy',
        title: 'Compensate for Age with Other Factors',
        description: 'As age points decline, focus on maximizing language, education, and securing a PNP nomination.',
        potentialGain: '100-600 points',
        difficulty: 'medium',
        timeframe: '3-12 months',
        priority: 'high',
        actionSteps: [
          'Aim for CLB 9+ in language tests',
          'Apply to Provincial Nominee Programs',
          'Consider upgrading education',
          'Gain Canadian work experience if possible',
        ],
        icon: '⚡',
      });
    }
  }
}

function analyzeEducation(input: CRSInputData, suggestions: ImprovementSuggestion[]) {
  const education = input.education;
  const hasSpouse = input.hasSpouse;
  const maxPoints = hasSpouse ? 140 : 150;

  const educationLevels = [
    'less_than_secondary',
    'secondary',
    'one_year_post_secondary',
    'two_year_post_secondary',
    'bachelor',
    'two_or_more_certificates',
    'master',
    'phd',
  ];

  const currentIndex = educationLevels.indexOf(education);

  if (currentIndex < educationLevels.length - 1) {
    if (education === 'bachelor') {
      suggestions.push({
        id: 'pursue-masters',
        category: 'Education',
        title: 'Pursue a Master\'s Degree',
        description: 'Upgrading from Bachelor\'s to Master\'s adds 15 extra points and improves skill transferability.',
        potentialGain: '15-50 points',
        difficulty: 'hard',
        timeframe: '1-2 years',
        priority: 'medium',
        actionSteps: [
          'Research Master\'s programs in Canada (adds bonus points)',
          'Apply to accredited universities',
          'Consider 1-year intensive programs',
          'Get ECA done upon completion',
        ],
        icon: '🎓',
      });
    }

    if (education === 'master') {
      suggestions.push({
        id: 'consider-phd',
        category: 'Education',
        title: 'Consider a Doctoral Degree',
        description: 'A PhD adds 15 more points. Consider if aligned with career goals.',
        potentialGain: '15 points',
        difficulty: 'hard',
        timeframe: '3-5 years',
        priority: 'low',
        actionSteps: [
          'Evaluate if PhD aligns with career plan',
          'Research funded PhD programs in Canada',
          'Apply to top research institutions',
        ],
        icon: '🔬',
      });
    }
  }

  if (!input.canadianEducation) {
    suggestions.push({
      id: 'canadian-credential',
      category: 'Education',
      title: 'Earn a Canadian Credential',
      description: 'Studying in Canada for 1-3 years adds 15-30 bonus points and opens path to PGWP.',
      potentialGain: '15-30 points + PGWP',
      difficulty: 'hard',
      timeframe: '1-3 years',
      priority: 'medium',
      actionSteps: [
        'Research 1-year graduate certificate programs',
        'Apply to DLI (Designated Learning Institutions)',
        'Obtain study permit',
        'Upon graduation, apply for Post-Graduate Work Permit',
        'Gain Canadian work experience',
      ],
      icon: '🇨🇦',
    });
  }
}

function analyzeFirstLanguage(input: CRSInputData, suggestions: ImprovementSuggestion[]) {
  const lang = input.firstLanguage;
  const minCLB = Math.min(lang.speaking, lang.listening, lang.reading, lang.writing);
  const avgCLB = (lang.speaking + lang.listening + lang.reading + lang.writing) / 4;

  if (minCLB < 9) {
    const potentialGain = minCLB < 7 ? '50-100 points' : '30-80 points';
    const priority = minCLB < 8 ? 'high' : 'medium';

    suggestions.push({
      id: 'improve-first-language',
      category: 'Language',
      title: 'Improve First Official Language Score',
      description: `Your current CLB levels are not maximized. Reaching CLB 9+ in all skills significantly boosts both core and transferability points.`,
      potentialGain,
      difficulty: 'medium',
      timeframe: '1-3 months',
      priority,
      actionSteps: [
        'Identify weakest skill (Listening, Reading, Writing, Speaking)',
        'Enroll in IELTS/CELPIP preparation course',
        'Practice with official test materials daily',
        'Consider hiring a language tutor',
        'Retake test when consistently scoring CLB 9+ in practice',
      ],
      icon: '📚',
    });
  }

  if (avgCLB >= 7 && avgCLB < 9) {
    suggestions.push({
      id: 'target-clb9',
      category: 'Language',
      title: 'Target CLB 9 for Skill Transferability',
      description: 'CLB 9+ unlocks maximum skill transferability points (up to 50 additional points).',
      potentialGain: '25-50 points',
      difficulty: 'medium',
      timeframe: '2-4 months',
      priority: 'high',
      actionSteps: [
        'Focus on achieving CLB 9 in all four skills',
        'IELTS GT scores needed: L8 R7 W7 S7',
        'Join online study groups',
        'Take multiple practice tests',
      ],
      icon: '🎯',
    });
  }
}

function analyzeSecondLanguage(input: CRSInputData, suggestions: ImprovementSuggestion[]) {
  if (!input.hasSecondLanguage || !input.secondLanguage) {
    suggestions.push({
      id: 'learn-french',
      category: 'Language',
      title: 'Learn French as Second Language',
      description: 'French proficiency adds 24 base points plus up to 50 bonus points. This is a major score booster.',
      potentialGain: '25-74 points',
      difficulty: 'hard',
      timeframe: '6-12 months',
      priority: 'high',
      actionSteps: [
        'Enroll in French language courses (aim for CLB 7+)',
        'Use apps like Duolingo, Babbel for daily practice',
        'Take TEF Canada or TCF Canada test',
        'Target minimum CLB 7 in all skills for bonus points',
        'With CLB 7+ French + CLB 5+ English = +50 bonus points',
      ],
      icon: '🇫🇷',
    });
  } else {
    const frenchLang = input.secondLanguage;
    const minFrenchCLB = Math.min(
      frenchLang.speaking,
      frenchLang.listening,
      frenchLang.reading,
      frenchLang.writing
    );

    if (minFrenchCLB < 7) {
      suggestions.push({
        id: 'improve-french',
        category: 'Language',
        title: 'Improve French to CLB 7+',
        description: 'Reaching CLB 7+ in French unlocks major bonus points (25-50 points).',
        potentialGain: '25-50 points',
        difficulty: 'medium',
        timeframe: '3-6 months',
        priority: 'high',
        actionSteps: [
          'Continue French studies to reach CLB 7+',
          'Practice all four skills equally',
          'Retake TEF Canada or TCF Canada',
          'Achieve CLB 7 minimum in all skills',
        ],
        icon: '📖',
      });
    }
  }
}

function analyzeCanadianWork(input: CRSInputData, suggestions: ImprovementSuggestion[]) {
  const experience = input.canadianWorkExperience;

  if (experience === 'none') {
    suggestions.push({
      id: 'gain-canadian-experience',
      category: 'Work Experience',
      title: 'Gain Canadian Work Experience',
      description: 'Even 1 year of Canadian experience adds 40-80 points and dramatically improves skill transferability.',
      potentialGain: '40-130 points',
      difficulty: 'hard',
      timeframe: '1-5 years',
      priority: 'high',
      actionSteps: [
        'Apply for Post-Graduate Work Permit (if studied in Canada)',
        'Consider IEC Working Holiday visa (if eligible)',
        'Search for LMIA-supported job offers',
        'Look into intra-company transfers',
        'Network with Canadian employers in your field',
      ],
      icon: '💼',
    });
  }

  if (experience === '1_year') {
    suggestions.push({
      id: 'extend-canadian-work',
      category: 'Work Experience',
      title: 'Work Towards 2+ Years Canadian Experience',
      description: 'Each additional year adds more points (up to 5 years for maximum).',
      potentialGain: '13-40 points',
      difficulty: 'medium',
      timeframe: '1-4 years',
      priority: 'medium',
      actionSteps: [
        'Continue working in NOC 0, A, or B position',
        'Extend work permit if needed',
        'Document all work experience properly',
      ],
      icon: '📈',
    });
  }
}

function analyzeForeignWork(input: CRSInputData, suggestions: ImprovementSuggestion[]) {
  const experience = input.foreignWorkExperience;

  if (!experience || experience === 'none') {
    suggestions.push({
      id: 'document-foreign-work',
      category: 'Work Experience',
      title: 'Document Foreign Work Experience',
      description: 'Foreign work experience combined with strong language scores adds up to 50 skill transferability points.',
      potentialGain: '0-50 points',
      difficulty: 'easy',
      timeframe: 'Immediate',
      priority: 'medium',
      actionSteps: [
        'Gather reference letters from previous employers',
        'Ensure letters include job duties, dates, and hours',
        'Verify work is in NOC 0, A, or B category',
        'Include all relevant experience',
      ],
      icon: '📋',
    });
  }
}

function analyzeSpouse(input: CRSInputData, suggestions: ImprovementSuggestion[]) {
  if (input.hasSpouse && input.spouseData) {
    const spouseEducation = input.spouseData.education;
    const spouseLang = input.spouseData.language;
    const spouseWork = input.spouseData.canadianWorkExperience;

    const minSpouseCLB = Math.min(
      spouseLang.speaking,
      spouseLang.listening,
      spouseLang.reading,
      spouseLang.writing
    );

    if (minSpouseCLB < 9) {
      suggestions.push({
        id: 'spouse-language',
        category: 'Spouse Factors',
        title: 'Improve Spouse\'s Language Score',
        description: 'Your spouse can contribute up to 20 points through language ability.',
        potentialGain: '5-15 points',
        difficulty: 'medium',
        timeframe: '2-4 months',
        priority: 'medium',
        actionSteps: [
          'Spouse should take IELTS/CELPIP',
          'Target CLB 9+ in all skills',
          'Join language preparation courses together',
        ],
        icon: '👥',
      });
    }

    if (spouseEducation === 'secondary' || spouseEducation === 'less_than_secondary') {
      suggestions.push({
        id: 'spouse-education',
        category: 'Spouse Factors',
        title: 'Upgrade Spouse\'s Education',
        description: 'Higher education for spouse adds up to 10 points.',
        potentialGain: '8-10 points',
        difficulty: 'hard',
        timeframe: '1-4 years',
        priority: 'low',
        actionSteps: [
          'Consider spouse completing post-secondary education',
          'Get ECA done for spouse\'s credentials',
        ],
        icon: '🎓',
      });
    }

    if (spouseWork === 'none') {
      suggestions.push({
        id: 'spouse-canadian-work',
        category: 'Spouse Factors',
        title: 'Spouse Gains Canadian Experience',
        description: 'Spouse\'s Canadian work experience adds up to 10 points.',
        potentialGain: '5-10 points',
        difficulty: 'hard',
        timeframe: '1+ years',
        priority: 'low',
        actionSteps: [
          'Spouse applies for open work permit',
          'Secures NOC 0, A, or B position in Canada',
        ],
        icon: '💼',
      });
    }
  }
}

function analyzeAdditionalPoints(input: CRSInputData, suggestions: ImprovementSuggestion[]) {
  if (!input.provincialNomination) {
    suggestions.push({
      id: 'apply-pnp',
      category: 'Provincial Nomination',
      title: 'Apply for Provincial Nominee Program (PNP)',
      description: 'A provincial nomination instantly adds 600 points, virtually guaranteeing an ITA. This is the fastest path to PR.',
      potentialGain: '600 points',
      difficulty: 'medium',
      timeframe: '3-12 months',
      priority: 'high',
      actionSteps: [
        'Research PNP programs: Ontario, BC, Alberta, Saskatchewan, Manitoba, Atlantic',
        'Check eligibility for Express Entry-aligned streams',
        'Popular programs: OINP, BC PNP Tech, Alberta Opportunity Stream',
        'Submit Expression of Interest (EOI) to provinces',
        'Prepare all documentation in advance',
        'Consider provinces with in-demand occupations matching your NOC',
      ],
      icon: '🏆',
    });
  }

  if (!input.hasJobOffer) {
    suggestions.push({
      id: 'secure-job-offer',
      category: 'Job Offer',
      title: 'Secure a Canadian Job Offer with LMIA',
      description: 'A valid job offer supported by LMIA adds 50-200 points depending on NOC level.',
      potentialGain: '50-200 points',
      difficulty: 'hard',
      timeframe: '3-12 months',
      priority: 'medium',
      actionSteps: [
        'Search for employers willing to provide LMIA',
        'Network at industry events and job fairs',
        'Use LinkedIn, Indeed, Job Bank',
        'NOC 00 (senior management) = 200 points',
        'NOC 0, A, B = 50 points',
        'Ensure offer is full-time and permanent',
      ],
      icon: '💼',
    });
  }

  if (!input.hasSiblingInCanada) {
    suggestions.push({
      id: 'sibling-points',
      category: 'Family Connection',
      title: 'Sibling in Canada',
      description: 'If you have a sibling who is a Canadian citizen or PR, claim 15 points.',
      potentialGain: '15 points',
      difficulty: 'easy',
      timeframe: 'Immediate',
      priority: 'medium',
      actionSteps: [
        'Verify sibling is Canadian citizen or PR',
        'Sibling must be 18+ years old',
        'Gather proof: birth certificates, sibling\'s PR card/passport',
        'Update Express Entry profile',
      ],
      icon: '👨‍👩‍👧‍👦',
    });
  }
}

function analyzeSkillTransferability(input: CRSInputData, suggestions: ImprovementSuggestion[]) {
  const hasPostSecondary = [
    'one_year_post_secondary',
    'two_year_post_secondary',
    'bachelor',
    'two_or_more_certificates',
    'master',
    'phd',
  ].includes(input.education);

  const minCLB = Math.min(
    input.firstLanguage.speaking,
    input.firstLanguage.listening,
    input.firstLanguage.reading,
    input.firstLanguage.writing
  );

  if (hasPostSecondary && minCLB >= 7 && minCLB < 9) {
    suggestions.push({
      id: 'maximize-transferability',
      category: 'Skill Transferability',
      title: 'Unlock Maximum Transferability Points',
      description: 'Your education + CLB 9 language = 50 transferability points. This is a quick win.',
      potentialGain: '25-50 points',
      difficulty: 'medium',
      timeframe: '1-3 months',
      priority: 'high',
      actionSteps: [
        'Focus on language improvement to reach CLB 9',
        'This combination unlocks maximum transferability',
        'Much faster than gaining work experience',
      ],
      icon: '⚡',
    });
  }
}
