import { CRSInputData } from '../../../types';

interface EducationStepProps {
  data: Partial<CRSInputData>;
  updateData: (data: Partial<CRSInputData>) => void;
}

const educationOptions = [
  { value: 'less_than_secondary', label: 'Less than secondary school (high school)' },
  { value: 'secondary', label: 'Secondary diploma (high school graduation)' },
  { value: 'one_year_post_secondary', label: 'One-year post-secondary program' },
  { value: 'two_year_post_secondary', label: 'Two-year post-secondary program' },
  { value: 'bachelor', label: 'Bachelor\'s degree (3+ years)' },
  { value: 'two_or_more_certificates', label: 'Two or more certificates, diplomas, or degrees' },
  { value: 'master', label: 'Master\'s degree or professional degree' },
  { value: 'phd', label: 'Doctoral level university degree (PhD)' },
];

export function EducationStep({ data, updateData }: EducationStepProps) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-secondary-900 mb-2">Level of Education</h3>
        <p className="text-secondary-600 mb-6">
          Select your highest level of education. If you studied outside Canada, you'll need an Educational Credential Assessment (ECA).
        </p>

        <div className="space-y-3">
          {educationOptions.map((option) => (
            <label
              key={option.value}
              className={`flex items-start p-4 rounded-lg border-2 cursor-pointer transition-all ${
                data.education === option.value
                  ? 'border-primary-600 bg-primary-50'
                  : 'border-secondary-200 hover:border-primary-300'
              }`}
            >
              <input
                type="radio"
                name="education"
                value={option.value}
                checked={data.education === option.value}
                onChange={(e) => updateData({ education: e.target.value })}
                className="mt-1 w-4 h-4 text-primary-600 focus:ring-primary-500"
              />
              <span className="ml-3 text-secondary-900">{option.label}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="bg-warning-50 border border-warning-200 rounded-lg p-4">
        <p className="text-sm text-warning-900">
          <strong>Important:</strong> If you completed your education outside Canada, you must have an Educational Credential Assessment (ECA) report from a designated organization.
        </p>
      </div>
    </div>
  );
}
