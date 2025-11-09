import { useState } from 'react';
import { CRSInputData } from '../../../types';

interface SpouseStepProps {
  data: Partial<CRSInputData>;
  updateData: (data: Partial<CRSInputData>) => void;
}

const educationOptions = [
  { value: 'less_than_secondary', label: 'Less than secondary school' },
  { value: 'secondary', label: 'Secondary diploma' },
  { value: 'one_year_post_secondary', label: 'One-year program' },
  { value: 'two_year_post_secondary', label: 'Two-year program' },
  { value: 'bachelor', label: 'Bachelor\'s degree' },
  { value: 'two_or_more_certificates', label: 'Two or more certificates' },
  { value: 'master', label: 'Master\'s degree' },
  { value: 'phd', label: 'Doctoral degree' },
];

const workOptions = [
  { value: 'none', label: 'None or less than a year' },
  { value: '1_year', label: '1 year' },
  { value: '2_years', label: '2 years' },
  { value: '3_years', label: '3 years' },
  { value: '4_years', label: '4 years' },
  { value: '5_plus_years', label: '5 or more years' },
];

const clbLevels = Array.from({ length: 13 }, (_, i) => i);
const skills = ['speaking', 'listening', 'reading', 'writing'] as const;

export function SpouseStep({ data, updateData }: SpouseStepProps) {
  const [hasSpouse, setHasSpouse] = useState(data.hasSpouse || false);

  const toggleSpouse = (enabled: boolean) => {
    setHasSpouse(enabled);
    updateData({
      hasSpouse: enabled,
      spouseData: enabled
        ? {
            education: 'bachelor',
            language: { speaking: 7, listening: 7, reading: 7, writing: 7 },
            canadianWorkExperience: 'none',
          }
        : undefined,
    });
  };

  const updateSpouseData = (field: string, value: any) => {
    updateData({
      spouseData: {
        ...data.spouseData!,
        [field]: value,
      },
    });
  };

  const updateSpouseLanguage = (skill: typeof skills[number], level: number) => {
    updateData({
      spouseData: {
        ...data.spouseData!,
        language: {
          ...data.spouseData!.language,
          [skill]: level,
        },
      },
    });
  };

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-semibold text-secondary-900 mb-4">Marital Status</h3>
        <label className="flex items-center p-4 rounded-lg border-2 border-secondary-200 cursor-pointer hover:border-primary-300">
          <input
            type="checkbox"
            checked={hasSpouse}
            onChange={(e) => toggleSpouse(e.target.checked)}
            className="w-5 h-5 text-primary-600 focus:ring-primary-500 rounded"
          />
          <span className="ml-3 text-secondary-900">
            I have a spouse or common-law partner who will come with me to Canada
          </span>
        </label>
      </div>

      {hasSpouse && (
        <>
          <div>
            <h3 className="text-lg font-semibold text-secondary-900 mb-4">Spouse's Education</h3>
            <select
              value={data.spouseData?.education || 'bachelor'}
              onChange={(e) => updateSpouseData('education', e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-secondary-300 bg-white text-secondary-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              {educationOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-secondary-900 mb-4">Spouse's Language Skills</h3>
            <p className="text-secondary-600 mb-4 text-sm">
              Enter your spouse's CLB levels for their first official language
            </p>
            <div className="space-y-4">
              {skills.map((skill) => (
                <div key={skill}>
                  <label className="block text-sm font-medium text-secondary-700 mb-2 capitalize">
                    {skill}
                  </label>
                  <select
                    value={data.spouseData?.language?.[skill] || 7}
                    onChange={(e) => updateSpouseLanguage(skill, parseInt(e.target.value))}
                    className="w-full px-4 py-3 rounded-lg border border-secondary-300 bg-white text-secondary-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    {clbLevels.map((level) => (
                      <option key={level} value={level}>
                        CLB {level}
                      </option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-secondary-900 mb-4">
              Spouse's Canadian Work Experience
            </h3>
            <select
              value={data.spouseData?.canadianWorkExperience || 'none'}
              onChange={(e) => updateSpouseData('canadianWorkExperience', e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-secondary-300 bg-white text-secondary-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              {workOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </>
      )}

      <div className="bg-primary-50 border border-primary-200 rounded-lg p-4">
        <p className="text-sm text-primary-900">
          <strong>Note:</strong> Having a spouse affects your points. If your spouse has strong qualifications, they may earn you extra points. However, your individual points in some categories will be slightly reduced.
        </p>
      </div>
    </div>
  );
}
