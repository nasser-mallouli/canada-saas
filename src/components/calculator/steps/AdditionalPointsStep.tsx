import { useState } from 'react';
import { CRSInputData } from '../../../types';

interface AdditionalPointsStepProps {
  data: Partial<CRSInputData>;
  updateData: (data: Partial<CRSInputData>) => void;
}

export function AdditionalPointsStep({ data, updateData }: AdditionalPointsStepProps) {
  const [hasJobOffer, setHasJobOffer] = useState(data.hasJobOffer || false);
  const [hasCanadianEducation, setHasCanadianEducation] = useState(!!data.canadianEducation);

  const toggleJobOffer = (enabled: boolean) => {
    setHasJobOffer(enabled);
    updateData({
      hasJobOffer: enabled,
      jobOfferDetails: enabled ? { teerCategory: 'teer_0' } : undefined,
    });
  };

  const toggleCanadianEducation = (enabled: boolean) => {
    setHasCanadianEducation(enabled);
    updateData({
      canadianEducation: enabled ? 'one_two_year' : undefined,
    });
  };

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-semibold text-secondary-900 mb-4">Provincial Nomination</h3>
        <label className="flex items-start p-4 rounded-lg border-2 border-secondary-200 cursor-pointer hover:border-primary-300">
          <input
            type="checkbox"
            checked={data.provincialNomination || false}
            onChange={(e) => updateData({ provincialNomination: e.target.checked })}
            className="mt-1 w-5 h-5 text-primary-600 focus:ring-primary-500 rounded"
          />
          <div className="ml-3">
            <span className="text-secondary-900 font-medium">I have a provincial nomination</span>
            <p className="text-sm text-secondary-600 mt-1">
              +600 points - Virtually guarantees an invitation to apply
            </p>
          </div>
        </label>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-secondary-900 mb-4">Valid Job Offer</h3>
        <label className="flex items-center p-4 rounded-lg border-2 border-secondary-200 cursor-pointer hover:border-primary-300 mb-4">
          <input
            type="checkbox"
            checked={hasJobOffer}
            onChange={(e) => toggleJobOffer(e.target.checked)}
            className="w-5 h-5 text-primary-600 focus:ring-primary-500 rounded"
          />
          <span className="ml-3 text-secondary-900">
            I have a valid job offer from a Canadian employer
          </span>
        </label>

        {hasJobOffer && (
          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-2">
              TEER Category of Job Offer
            </label>
            <select
              value={data.jobOfferDetails?.teerCategory || 'teer_0'}
              onChange={(e) =>
                updateData({
                  jobOfferDetails: { teerCategory: e.target.value },
                })
              }
              className="w-full px-4 py-3 rounded-lg border border-secondary-300 bg-white text-secondary-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="teer_0">TEER 0 - Management jobs (+200 points)</option>
              <option value="teer_1">TEER 1, 2, or 3 - Other skilled jobs (+50 points)</option>
            </select>
          </div>
        )}
      </div>

      <div>
        <h3 className="text-lg font-semibold text-secondary-900 mb-4">Canadian Education</h3>
        <label className="flex items-center p-4 rounded-lg border-2 border-secondary-200 cursor-pointer hover:border-primary-300 mb-4">
          <input
            type="checkbox"
            checked={hasCanadianEducation}
            onChange={(e) => toggleCanadianEducation(e.target.checked)}
            className="w-5 h-5 text-primary-600 focus:ring-primary-500 rounded"
          />
          <span className="ml-3 text-secondary-900">
            I have a Canadian post-secondary credential
          </span>
        </label>

        {hasCanadianEducation && (
          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-2">
              Type of Credential
            </label>
            <select
              value={data.canadianEducation || 'one_two_year'}
              onChange={(e) => updateData({ canadianEducation: e.target.value })}
              className="w-full px-4 py-3 rounded-lg border border-secondary-300 bg-white text-secondary-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="one_two_year">1 or 2-year credential (+15 points)</option>
              <option value="three_plus_year">3+ year credential or higher (+30 points)</option>
              <option value="two_or_more">Two or more credentials (+30 points)</option>
            </select>
          </div>
        )}
      </div>

      <div>
        <h3 className="text-lg font-semibold text-secondary-900 mb-4">Sibling in Canada</h3>
        <label className="flex items-start p-4 rounded-lg border-2 border-secondary-200 cursor-pointer hover:border-primary-300">
          <input
            type="checkbox"
            checked={data.hasSiblingInCanada || false}
            onChange={(e) => updateData({ hasSiblingInCanada: e.target.checked })}
            className="mt-1 w-5 h-5 text-primary-600 focus:ring-primary-500 rounded"
          />
          <div className="ml-3">
            <span className="text-secondary-900 font-medium">
              I have a sibling in Canada who is a citizen or permanent resident
            </span>
            <p className="text-sm text-secondary-600 mt-1">
              +15 points - Must be 18 or older and living in Canada
            </p>
          </div>
        </label>
      </div>

      <div className="bg-success-50 border border-success-200 rounded-lg p-4">
        <p className="text-sm text-success-900">
          <strong>Almost done!</strong> Click "Calculate Score" to see your CRS score and get your personalized roadmap.
        </p>
      </div>
    </div>
  );
}
