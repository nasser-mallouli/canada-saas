import { CRSInputData } from '../../../types';
import { useTranslation } from '../../../i18n/useTranslation';

interface EducationStepProps {
  data: Partial<CRSInputData>;
  updateData: (data: Partial<CRSInputData>) => void;
}

export function EducationStep({ data, updateData }: EducationStepProps) {
  const { t } = useTranslation();

  const educationOptions = [
    { value: 'less_than_secondary', label: t('calculator.steps.education.options.less_than_secondary') },
    { value: 'secondary', label: t('calculator.steps.education.options.secondary') },
    { value: 'one_year_post_secondary', label: t('calculator.steps.education.options.one_year_post_secondary') },
    { value: 'two_year_post_secondary', label: t('calculator.steps.education.options.two_year_post_secondary') },
    { value: 'bachelor', label: t('calculator.steps.education.options.bachelor') },
    { value: 'two_or_more_certificates', label: t('calculator.steps.education.options.two_or_more_certificates') },
    { value: 'master', label: t('calculator.steps.education.options.master') },
    { value: 'phd', label: t('calculator.steps.education.options.phd') },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-secondary-900 mb-2">{t('calculator.steps.education.title')}</h3>
        <p className="text-secondary-600 mb-6">
          {t('calculator.steps.education.subtitle')}
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
          <strong>{t('common.labels.warning')}:</strong> {t('calculator.steps.education.important')}
        </p>
      </div>
    </div>
  );
}
