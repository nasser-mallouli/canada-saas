import { useState, useEffect } from 'react';
import { ArrowLeft, ArrowRight, Check } from 'lucide-react';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { CRSInputData } from '../../types';
import { calculateCRS } from '../../utils/crsCalculator';
import { api } from '../../lib/api';
import { trackCalculatorStep } from '../../utils/calculatorSession';
import { AgeStep } from './steps/AgeStep';
import { EducationStep } from './steps/EducationStep';
import { LanguageStep } from './steps/LanguageStep';
import { WorkExperienceStep } from './steps/WorkExperienceStep';
import { SpouseStep } from './steps/SpouseStep';
import { AdditionalPointsStep } from './steps/AdditionalPointsStep';
import { useTranslation } from '../../i18n/useTranslation';

interface CRSWizardProps {
  userInfo: { fullName: string; email: string; phone: string };
  onComplete: (data: CRSInputData, score: number) => void;
  initialData?: Partial<CRSInputData> | null;
  calculationId?: string;
}

export function CRSWizard({ userInfo, onComplete, initialData, calculationId }: CRSWizardProps) {
  const { t } = useTranslation();
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    { id: 'age', title: t('calculator.steps.age.title'), description: t('calculator.steps.age.description') },
    { id: 'education', title: t('calculator.steps.education.title'), description: t('calculator.steps.education.description') },
    { id: 'language', title: t('calculator.steps.language.title'), description: t('calculator.steps.language.description') },
    { id: 'work', title: t('calculator.steps.work.title'), description: t('calculator.steps.work.description') },
    { id: 'spouse', title: t('calculator.steps.spouse.title'), description: t('calculator.steps.spouse.description') },
    { id: 'additional', title: t('calculator.steps.additional.title'), description: t('calculator.steps.additional.description') },
  ];
  const [formData, setFormData] = useState<Partial<CRSInputData>>({
    age: 25,
    education: 'bachelor',
    firstLanguage: { speaking: 0, listening: 0, reading: 0, writing: 0 },
    hasSecondLanguage: false,
    canadianWorkExperience: 'none',
    foreignWorkExperience: 'none',
    hasCertificateOfQualification: false,
    hasSpouse: false,
    provincialNomination: false,
    hasJobOffer: false,
    hasSiblingInCanada: false,
    ...initialData, // Merge initial data if provided
  });

  // Restore step if we have initial data
  useEffect(() => {
    if (initialData && Object.keys(initialData).length > 0) {
      // Determine which step to show based on what data we have
      if (initialData.additionalPoints !== undefined) {
        setCurrentStep(5); // Additional points step
      } else if (initialData.hasSpouse !== undefined || initialData.spouseData) {
        setCurrentStep(4); // Spouse step
      } else if (initialData.canadianWorkExperience || initialData.foreignWorkExperience) {
        setCurrentStep(3); // Work experience step
      } else if (initialData.firstLanguage || initialData.secondLanguage) {
        setCurrentStep(2); // Language step
      } else if (initialData.education) {
        setCurrentStep(1); // Education step
      } else if (initialData.age) {
        setCurrentStep(0); // Age step
      }
    }
  }, [initialData]);

  const updateFormData = (data: Partial<CRSInputData>) => {
    setFormData((prev) => ({ ...prev, ...data }));
  };

  // Track step progress when step changes (not on every form data change to avoid excessive API calls)
  useEffect(() => {
    const stepId = steps[currentStep].id;
    const completedSteps = steps.slice(0, currentStep).map(s => s.id);
    
    // Track current step with partial data (debounced by step change only)
    trackCalculatorStep(
      stepId,
      completedSteps,
      formData,
      userInfo
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentStep]); // Only track when step changes, not on every form data update

  const handleNext = async () => {
    if (currentStep < steps.length - 1) {
      // Track step completion before moving to next
      const completedStepId = steps[currentStep].id;
      const completedSteps = steps.slice(0, currentStep + 1).map(s => s.id);
      
      await trackCalculatorStep(
        steps[currentStep + 1].id, // Next step
        completedSteps,
        formData,
        userInfo
      );
      
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = async () => {
    const completeData: CRSInputData = {
      ...formData,
      age: formData.age!,
      education: formData.education!,
      firstLanguage: formData.firstLanguage!,
      hasSecondLanguage: formData.hasSecondLanguage!,
      canadianWorkExperience: formData.canadianWorkExperience!,
      hasSpouse: formData.hasSpouse!,
      provincialNomination: formData.provincialNomination!,
      hasJobOffer: formData.hasJobOffer!,
      hasSiblingInCanada: formData.hasSiblingInCanada!,
    };

    const { score, breakdown } = calculateCRS(completeData);

    try {
      await api.post('/api/crs/calculate', {
        score,
        category_breakdown: breakdown,
        input_data: {
          ...completeData,
          fullName: userInfo.fullName,
          email: userInfo.email,
          phone: userInfo.phone,
        },
      });
    } catch (error) {
      console.error('Error saving calculation:', error);
    }

    // Mark session as completed
    const allSteps = steps.map(s => s.id);
    await trackCalculatorStep(
      'completed',
      allSteps,
      completeData,
      userInfo,
      true // is_completed
    );

    onComplete(completeData, score);
  };

  const renderStep = () => {
    switch (steps[currentStep].id) {
      case 'age':
        return <AgeStep data={formData} updateData={updateFormData} />;
      case 'education':
        return <EducationStep data={formData} updateData={updateFormData} />;
      case 'language':
        return <LanguageStep data={formData} updateData={updateFormData} />;
      case 'work':
        return <WorkExperienceStep data={formData} updateData={updateFormData} />;
      case 'spouse':
        return <SpouseStep data={formData} updateData={updateFormData} />;
      case 'additional':
        return <AdditionalPointsStep data={formData} updateData={updateFormData} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div
                  className={`flex items-center justify-center w-10 h-10 rounded-full font-semibold transition-all ${
                    index < currentStep
                      ? 'bg-success-500 text-white'
                      : index === currentStep
                      ? 'bg-primary-600 text-white'
                      : 'bg-secondary-200 text-secondary-600'
                  }`}
                >
                  {index < currentStep ? <Check className="w-5 h-5" /> : index + 1}
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`h-1 w-12 md:w-20 mx-2 transition-all ${
                      index < currentStep ? 'bg-success-500' : 'bg-secondary-200'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>

          <div className="text-center">
            <p className="text-sm text-secondary-500 mb-1">
              {t('calculator.steps.stepOf', { current: currentStep + 1, total: steps.length })}
            </p>
            <h2 className="text-2xl font-bold text-secondary-900">{steps[currentStep].title}</h2>
            <p className="text-secondary-600">{steps[currentStep].description}</p>
          </div>
        </div>

        <Card className="mb-6">{renderStep()}</Card>

        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={handleBack}
            disabled={currentStep === 0}
            className={currentStep === 0 ? 'invisible' : ''}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            {t('common.buttons.back')}
          </Button>
          <Button onClick={handleNext}>
            {currentStep === steps.length - 1 ? (
              <>
                {t('calculator.steps.calculateScore')}
                <Check className="w-4 h-4 ml-2" />
              </>
            ) : (
              <>
                {t('common.buttons.next')}
                <ArrowRight className="w-4 h-4 ml-2" />
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
