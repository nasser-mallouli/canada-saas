import { CRSInputData } from '../../../types';
import { Input } from '../../ui/Input';
import { Calendar, TrendingUp, Award } from 'lucide-react';
import { useTranslation } from '../../../i18n/useTranslation';

interface AgeStepProps {
  data: Partial<CRSInputData>;
  updateData: (data: Partial<CRSInputData>) => void;
}

export function AgeStep({ data, updateData }: AgeStepProps) {
  const { t } = useTranslation();
  const age = data.age || 25;
  const hasSpouse = data.hasSpouse || false;

  const getAgePoints = (age: number, hasSpouse: boolean): number => {
    if (hasSpouse) {
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
      if (age >= 45) return 0;
      return 0;
    } else {
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
      if (age >= 45) return 0;
      return 0;
    }
  };

  const points = getAgePoints(age, hasSpouse);
  const maxPoints = hasSpouse ? 100 : 110;
  const percentage = (points / maxPoints) * 100;

  return (
    <div className="space-y-8">
      <div className="text-center">
        <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Calendar className="w-8 h-8 text-primary-600" />
        </div>
        <h3 className="text-2xl font-bold text-secondary-900 mb-2">{t('calculator.steps.age.question')}</h3>
        <p className="text-secondary-600 max-w-2xl mx-auto">
          {t('calculator.steps.age.subtitle')}
        </p>
      </div>

      <div className="max-w-md mx-auto">
        <label className="block text-sm font-medium text-secondary-700 mb-3">
          {t('calculator.steps.age.label')} <span className="text-error-500">*</span>
        </label>
        <Input
          type="number"
          value={age}
          onChange={(e) => updateData({ age: parseInt(e.target.value) || 18 })}
          min={18}
          max={65}
          required
          className="text-center text-2xl font-bold"
        />
        <p className="text-xs text-secondary-500 mt-2 text-center">
          {t('calculator.steps.age.helper')}
        </p>
      </div>

      <div className="bg-gradient-to-br from-primary-50 to-secondary-50 border border-primary-200 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Award className="w-6 h-6 text-primary-600" />
            <span className="font-semibold text-secondary-900">{t('calculator.steps.age.pointsLabel')}</span>
          </div>
          <div className="text-3xl font-bold text-primary-600">
            {points} <span className="text-lg text-secondary-500">/ {maxPoints}</span>
          </div>
        </div>

        <div className="w-full bg-secondary-200 rounded-full h-4 mb-4">
          <div
            className="bg-gradient-to-r from-primary-500 to-primary-600 h-4 rounded-full transition-all duration-500"
            style={{ width: `${percentage}%` }}
          />
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-start gap-2">
            <TrendingUp className="w-4 h-4 text-success-600 flex-shrink-0 mt-0.5" />
            <div>
              <strong className="text-secondary-900">{t('calculator.steps.age.peakAge')}:</strong>
              <p className="text-secondary-600">{t('calculator.steps.age.peakAgeDesc')}</p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <Calendar className="w-4 h-4 text-info-600 flex-shrink-0 mt-0.5" />
            <div>
              <strong className="text-secondary-900">{t('calculator.steps.age.pointsDecline')}:</strong>
              <p className="text-secondary-600">{t('calculator.steps.age.pointsDeclineDesc')}</p>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
