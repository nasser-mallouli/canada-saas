import { CRSInputData } from '../../../types';

interface WorkExperienceStepProps {
  data: Partial<CRSInputData>;
  updateData: (data: Partial<CRSInputData>) => void;
}

const workOptions = [
  { value: 'none', label: 'None or less than a year' },
  { value: '1_year', label: '1 year' },
  { value: '2_years', label: '2 years' },
  { value: '3_years', label: '3 years' },
  { value: '4_years', label: '4 years' },
  { value: '5_plus_years', label: '5 or more years' },
];

export function WorkExperienceStep({ data, updateData }: WorkExperienceStepProps) {
  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-semibold text-secondary-900 mb-2">Canadian Work Experience</h3>
        <p className="text-secondary-600 mb-6">
          How many years of skilled work experience in Canada do you have in the last 10 years? This must be full-time (or equivalent part-time) paid work in NOC TEER 0, 1, 2, or 3.
        </p>

        <div className="space-y-3">
          {workOptions.map((option) => (
            <label
              key={option.value}
              className={`flex items-center p-4 rounded-lg border-2 cursor-pointer transition-all ${
                data.canadianWorkExperience === option.value
                  ? 'border-primary-600 bg-primary-50'
                  : 'border-secondary-200 hover:border-primary-300'
              }`}
            >
              <input
                type="radio"
                name="canadian-work"
                value={option.value}
                checked={data.canadianWorkExperience === option.value}
                onChange={(e) => updateData({ canadianWorkExperience: e.target.value })}
                className="w-4 h-4 text-primary-600 focus:ring-primary-500"
              />
              <span className="ml-3 text-secondary-900">{option.label}</span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-secondary-900 mb-2">Foreign Work Experience</h3>
        <p className="text-secondary-600 mb-6">
          How many years of skilled work experience do you have outside Canada in the last 10 years? This contributes to skill transferability points.
        </p>

        <div className="space-y-3">
          {workOptions.map((option) => (
            <label
              key={option.value}
              className={`flex items-center p-4 rounded-lg border-2 cursor-pointer transition-all ${
                data.foreignWorkExperience === option.value
                  ? 'border-primary-600 bg-primary-50'
                  : 'border-secondary-200 hover:border-primary-300'
              }`}
            >
              <input
                type="radio"
                name="foreign-work"
                value={option.value}
                checked={data.foreignWorkExperience === option.value}
                onChange={(e) => updateData({ foreignWorkExperience: e.target.value })}
                className="w-4 h-4 text-primary-600 focus:ring-primary-500"
              />
              <span className="ml-3 text-secondary-900">{option.label}</span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-secondary-900 mb-4">Certificate of Qualification</h3>
        <label className="flex items-start p-4 rounded-lg border-2 border-secondary-200 cursor-pointer hover:border-primary-300">
          <input
            type="checkbox"
            checked={data.hasCertificateOfQualification || false}
            onChange={(e) => updateData({ hasCertificateOfQualification: e.target.checked })}
            className="mt-1 w-5 h-5 text-primary-600 focus:ring-primary-500 rounded"
          />
          <div className="ml-3">
            <span className="text-secondary-900 font-medium">
              I have a certificate of qualification from a Canadian province or territory
            </span>
            <p className="text-sm text-secondary-600 mt-1">
              This applies to skilled trades. Can earn up to 50 additional points in skill transferability.
            </p>
          </div>
        </label>
      </div>

      <div className="bg-primary-50 border border-primary-200 rounded-lg p-4">
        <p className="text-sm text-primary-900 mb-2">
          <strong>What counts as skilled work?</strong>
        </p>
        <ul className="text-sm text-primary-900 space-y-1 list-disc list-inside">
          <li>TEER 0: Management jobs</li>
          <li>TEER 1: Professional jobs (usually need university degree)</li>
          <li>TEER 2: Technical jobs and skilled trades (usually need college or apprenticeship)</li>
          <li>TEER 3: Jobs that need technical training or high school plus training</li>
        </ul>
      </div>
    </div>
  );
}
