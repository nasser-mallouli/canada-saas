import { useState } from 'react';
import { CRSInputData } from '../../../types';

interface LanguageStepProps {
  data: Partial<CRSInputData>;
  updateData: (data: Partial<CRSInputData>) => void;
}

type TestType = 'ielts' | 'celpip' | 'tef' | 'tcf';
type SkillType = 'speaking' | 'listening' | 'reading' | 'writing';

const skills: SkillType[] = ['speaking', 'listening', 'reading', 'writing'];

const ieltsScores = ['0', '1.0', '1.5', '2.0', '2.5', '3.0', '3.5', '4.0', '4.5', '5.0', '5.5', '6.0', '6.5', '7.0', '7.5', '8.0', '8.5', '9.0'];
const celpipScores = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'];

const ieltsToClb: Record<SkillType, Record<string, number>> = {
  speaking: {
    '0': 0, '1.0': 0, '1.5': 0, '2.0': 0, '2.5': 0, '3.0': 0, '3.5': 0,
    '4.0': 4, '4.5': 5, '5.0': 6, '5.5': 6, '6.0': 7, '6.5': 8, '7.0': 9, '7.5': 10, '8.0': 11, '8.5': 12, '9.0': 12
  },
  listening: {
    '0': 0, '1.0': 0, '1.5': 0, '2.0': 0, '2.5': 0, '3.0': 0, '3.5': 0,
    '4.0': 4, '4.5': 4, '5.0': 5, '5.5': 6, '6.0': 7, '6.5': 8, '7.0': 8, '7.5': 9, '8.0': 9, '8.5': 10, '9.0': 10
  },
  reading: {
    '0': 0, '1.0': 0, '1.5': 0, '2.0': 0, '2.5': 0, '3.0': 0, '3.5': 0,
    '4.0': 3, '4.5': 4, '5.0': 5, '5.5': 6, '6.0': 6, '6.5': 7, '7.0': 8, '7.5': 9, '8.0': 9, '8.5': 10, '9.0': 10
  },
  writing: {
    '0': 0, '1.0': 0, '1.5': 0, '2.0': 0, '2.5': 0, '3.0': 0, '3.5': 0,
    '4.0': 4, '4.5': 5, '5.0': 5, '5.5': 6, '6.0': 6, '6.5': 7, '7.0': 7, '7.5': 8, '8.0': 9, '8.5': 10, '9.0': 10
  }
};

const tefToNclc: Record<SkillType, Record<string, number>> = {
  speaking: {
    '0-180': 0, '181-225': 4, '226-270': 5, '271-309': 6, '310-348': 7,
    '349-370': 8, '371-392': 9, '393-415': 10, '416-450': 11, '451-500': 12
  },
  listening: {
    '0-144': 0, '145-180': 4, '181-216': 5, '217-248': 6, '249-279': 7,
    '280-297': 8, '298-315': 9, '316-333': 10, '334-360': 11, '361-400': 12
  },
  reading: {
    '0-120': 0, '121-150': 4, '151-180': 5, '181-206': 6, '207-232': 7,
    '233-247': 8, '248-262': 9, '263-277': 10, '278-300': 11, '301-360': 12
  },
  writing: {
    '0-180': 0, '181-225': 4, '226-270': 5, '271-309': 6, '310-348': 7,
    '349-370': 8, '371-392': 9, '393-415': 10, '416-450': 11, '451-500': 12
  }
};

const tcfToNclc: Record<SkillType, Record<string, number>> = {
  speaking: {
    '0-5': 0, '6-9': 4, '10-11': 5, '12-13': 6, '14-15': 7,
    '16-17': 8, '18-19': 9, '20': 10
  },
  listening: {
    '0-330': 0, '331-368': 4, '369-397': 5, '398-457': 6, '458-502': 7,
    '503-522': 8, '523-548': 9, '549-600': 10
  },
  reading: {
    '0-341': 0, '342-374': 4, '375-405': 5, '406-452': 6, '453-498': 7,
    '499-523': 8, '524-548': 9, '549-600': 10
  },
  writing: {
    '0-5': 0, '6-9': 4, '10-11': 5, '12-13': 6, '14-15': 7,
    '16-17': 8, '18-19': 9, '20': 10
  }
};

export function LanguageStep({ data, updateData }: LanguageStepProps) {
  const [firstLangType, setFirstLangType] = useState<'english' | 'french'>('english');
  const [firstTestType, setFirstTestType] = useState<TestType>('ielts');
  const [firstScores, setFirstScores] = useState<Record<SkillType, string>>({
    speaking: '0',
    listening: '0',
    reading: '0',
    writing: '0',
  });

  const [hasSecondLanguage, setHasSecondLanguage] = useState(data.hasSecondLanguage || false);
  const [secondLangType, setSecondLangType] = useState<'english' | 'french'>('french');
  const [secondTestType, setSecondTestType] = useState<TestType>('tef');
  const [secondScores, setSecondScores] = useState<Record<SkillType, string>>({
    speaking: '0',
    listening: '0',
    reading: '0',
    writing: '0',
  });

  const convertScoreToClb = (testType: TestType, skill: SkillType, score: string): number => {
    if (testType === 'celpip') {
      return parseInt(score) || 0;
    }
    if (testType === 'ielts') {
      return ieltsToClb[skill][score] || 0;
    }
    if (testType === 'tef') {
      const ranges = Object.keys(tefToNclc[skill]);
      for (const range of ranges) {
        const [min, max] = range.split('-').map(Number);
        const scoreNum = parseInt(score);
        if (scoreNum >= min && scoreNum <= max) {
          return tefToNclc[skill][range];
        }
      }
    }
    if (testType === 'tcf') {
      if (skill === 'speaking' || skill === 'writing') {
        return tcfToNclc[skill][score] || 0;
      } else {
        const ranges = Object.keys(tcfToNclc[skill]);
        for (const range of ranges) {
          const [min, max] = range.split('-').map(Number);
          const scoreNum = parseInt(score);
          if (scoreNum >= min && scoreNum <= max) {
            return tcfToNclc[skill][range];
          }
        }
      }
    }
    return 0;
  };

  const updateFirstScore = (skill: SkillType, score: string) => {
    const newScores = { ...firstScores, [skill]: score };
    setFirstScores(newScores);

    const clbScores = {
      speaking: convertScoreToClb(firstTestType, 'speaking', newScores.speaking),
      listening: convertScoreToClb(firstTestType, 'listening', newScores.listening),
      reading: convertScoreToClb(firstTestType, 'reading', newScores.reading),
      writing: convertScoreToClb(firstTestType, 'writing', newScores.writing),
    };

    updateData({ firstLanguage: clbScores });
  };

  const updateSecondScore = (skill: SkillType, score: string) => {
    const newScores = { ...secondScores, [skill]: score };
    setSecondScores(newScores);

    const clbScores = {
      speaking: convertScoreToClb(secondTestType, 'speaking', newScores.speaking),
      listening: convertScoreToClb(secondTestType, 'listening', newScores.listening),
      reading: convertScoreToClb(secondTestType, 'reading', newScores.reading),
      writing: convertScoreToClb(secondTestType, 'writing', newScores.writing),
    };

    updateData({ hasSecondLanguage: true, secondLanguage: clbScores });
  };

  const changeFirstTestType = (newType: TestType) => {
    setFirstTestType(newType);
    setFirstScores({ speaking: '0', listening: '0', reading: '0', writing: '0' });
    updateData({ firstLanguage: { speaking: 0, listening: 0, reading: 0, writing: 0 } });
  };

  const changeSecondTestType = (newType: TestType) => {
    setSecondTestType(newType);
    setSecondScores({ speaking: '0', listening: '0', reading: '0', writing: '0' });
    updateData({ secondLanguage: { speaking: 0, listening: 0, reading: 0, writing: 0 } });
  };

  const getScoreOptions = (testType: TestType, skill: SkillType) => {
    if (testType === 'celpip') return celpipScores;
    if (testType === 'ielts') return ieltsScores;
    if (testType === 'tef') {
      if (skill === 'speaking' || skill === 'writing') return Array.from({ length: 21 }, (_, i) => (i * 25).toString());
      if (skill === 'listening') return Array.from({ length: 21 }, (_, i) => (i * 20).toString());
      return Array.from({ length: 19 }, (_, i) => (i * 20).toString());
    }
    if (testType === 'tcf') {
      if (skill === 'speaking' || skill === 'writing') return Array.from({ length: 21 }, (_, i) => i.toString());
      return Array.from({ length: 31 }, (_, i) => (i * 20).toString());
    }
    return [];
  };

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-semibold text-secondary-900 mb-2">First Official Language</h3>
        <p className="text-secondary-600 mb-6">
          Select your language test and enter your test scores. We'll automatically convert them to CLB/NCLC levels.
        </p>

        <div className="mb-6">
          <label className="block text-sm font-medium text-secondary-700 mb-2">Language</label>
          <div className="grid grid-cols-2 gap-3">
            <label className={`flex items-center justify-center p-4 rounded-lg border-2 cursor-pointer transition-all ${
              firstLangType === 'english' ? 'border-primary-600 bg-primary-50' : 'border-secondary-200 hover:border-primary-300'
            }`}>
              <input
                type="radio"
                name="firstLang"
                checked={firstLangType === 'english'}
                onChange={() => {
                  setFirstLangType('english');
                  setFirstTestType('ielts');
                  setFirstScores({ speaking: '0', listening: '0', reading: '0', writing: '0' });
                }}
                className="sr-only"
              />
              <span className="font-medium text-secondary-900">English</span>
            </label>
            <label className={`flex items-center justify-center p-4 rounded-lg border-2 cursor-pointer transition-all ${
              firstLangType === 'french' ? 'border-primary-600 bg-primary-50' : 'border-secondary-200 hover:border-primary-300'
            }`}>
              <input
                type="radio"
                name="firstLang"
                checked={firstLangType === 'french'}
                onChange={() => {
                  setFirstLangType('french');
                  setFirstTestType('tef');
                  setFirstScores({ speaking: '0', listening: '0', reading: '0', writing: '0' });
                }}
                className="sr-only"
              />
              <span className="font-medium text-secondary-900">French</span>
            </label>
          </div>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-secondary-700 mb-2">Test Type</label>
          <select
            value={firstTestType}
            onChange={(e) => changeFirstTestType(e.target.value as TestType)}
            className="w-full px-4 py-3 rounded-lg border border-secondary-300 bg-white text-secondary-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            {firstLangType === 'english' ? (
              <>
                <option value="ielts">IELTS General Training</option>
                <option value="celpip">CELPIP-G</option>
              </>
            ) : (
              <>
                <option value="tef">TEF Canada</option>
                <option value="tcf">TCF Canada</option>
              </>
            )}
          </select>
        </div>

        <div className="space-y-4">
          {skills.map((skill) => (
            <div key={skill} className="grid grid-cols-2 gap-4 items-center">
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2 capitalize">
                  {skill}
                </label>
                <select
                  value={firstScores[skill]}
                  onChange={(e) => updateFirstScore(skill, e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-secondary-300 bg-white text-secondary-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  {getScoreOptions(firstTestType, skill).map((score) => (
                    <option key={score} value={score}>
                      {score}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">
                  {firstLangType === 'english' ? 'CLB Level' : 'NCLC Level'}
                </label>
                <div className="px-4 py-3 rounded-lg border border-secondary-200 bg-secondary-50 text-secondary-900 font-semibold">
                  {convertScoreToClb(firstTestType, skill, firstScores[skill])}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-primary-50 border border-primary-200 rounded-lg p-4">
        <p className="text-sm text-primary-900">
          <strong>Accepted Tests:</strong> IELTS General Training, CELPIP-G for English | TEF Canada, TCF Canada for French
        </p>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-secondary-900 mb-4">Second Official Language (Optional)</h3>
        <label className="flex items-center p-4 rounded-lg border-2 border-secondary-200 cursor-pointer hover:border-primary-300 mb-4">
          <input
            type="checkbox"
            checked={hasSecondLanguage}
            onChange={(e) => {
              const enabled = e.target.checked;
              setHasSecondLanguage(enabled);
              if (!enabled) {
                updateData({ hasSecondLanguage: false, secondLanguage: undefined });
              } else {
                setSecondLangType(firstLangType === 'english' ? 'french' : 'english');
                setSecondTestType(firstLangType === 'english' ? 'tef' : 'ielts');
                updateData({ hasSecondLanguage: true, secondLanguage: { speaking: 0, listening: 0, reading: 0, writing: 0 } });
              }
            }}
            className="w-5 h-5 text-primary-600 focus:ring-primary-500 rounded"
          />
          <span className="ml-3 text-secondary-900">
            I have test results for a second official language (+24 points if CLB 5+)
          </span>
        </label>

        {hasSecondLanguage && (
          <>
            <div className="mb-6">
              <label className="block text-sm font-medium text-secondary-700 mb-2">Second Language</label>
              <div className="grid grid-cols-2 gap-3">
                <label className={`flex items-center justify-center p-4 rounded-lg border-2 cursor-pointer transition-all ${
                  secondLangType === 'english' ? 'border-primary-600 bg-primary-50' : 'border-secondary-200 hover:border-primary-300'
                }`}>
                  <input
                    type="radio"
                    name="secondLang"
                    checked={secondLangType === 'english'}
                    onChange={() => {
                      setSecondLangType('english');
                      setSecondTestType('ielts');
                      setSecondScores({ speaking: '0', listening: '0', reading: '0', writing: '0' });
                    }}
                    className="sr-only"
                  />
                  <span className="font-medium text-secondary-900">English</span>
                </label>
                <label className={`flex items-center justify-center p-4 rounded-lg border-2 cursor-pointer transition-all ${
                  secondLangType === 'french' ? 'border-primary-600 bg-primary-50' : 'border-secondary-200 hover:border-primary-300'
                }`}>
                  <input
                    type="radio"
                    name="secondLang"
                    checked={secondLangType === 'french'}
                    onChange={() => {
                      setSecondLangType('french');
                      setSecondTestType('tef');
                      setSecondScores({ speaking: '0', listening: '0', reading: '0', writing: '0' });
                    }}
                    className="sr-only"
                  />
                  <span className="font-medium text-secondary-900">French</span>
                </label>
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-secondary-700 mb-2">Test Type</label>
              <select
                value={secondTestType}
                onChange={(e) => changeSecondTestType(e.target.value as TestType)}
                className="w-full px-4 py-3 rounded-lg border border-secondary-300 bg-white text-secondary-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                {secondLangType === 'english' ? (
                  <>
                    <option value="ielts">IELTS General Training</option>
                    <option value="celpip">CELPIP-G</option>
                  </>
                ) : (
                  <>
                    <option value="tef">TEF Canada</option>
                    <option value="tcf">TCF Canada</option>
                  </>
                )}
              </select>
            </div>

            <div className="space-y-4">
              {skills.map((skill) => (
                <div key={skill} className="grid grid-cols-2 gap-4 items-center">
                  <div>
                    <label className="block text-sm font-medium text-secondary-700 mb-2 capitalize">
                      {skill}
                    </label>
                    <select
                      value={secondScores[skill]}
                      onChange={(e) => updateSecondScore(skill, e.target.value)}
                      className="w-full px-4 py-3 rounded-lg border border-secondary-300 bg-white text-secondary-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    >
                      {getScoreOptions(secondTestType, skill).map((score) => (
                        <option key={score} value={score}>
                          {score}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-secondary-700 mb-2">
                      {secondLangType === 'english' ? 'CLB Level' : 'NCLC Level'}
                    </label>
                    <div className="px-4 py-3 rounded-lg border border-secondary-200 bg-secondary-50 text-secondary-900 font-semibold">
                      {convertScoreToClb(secondTestType, skill, secondScores[skill])}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
