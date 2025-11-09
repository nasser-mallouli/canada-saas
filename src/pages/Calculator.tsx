import { useState } from 'react';
import { UserInfoStep } from '../components/calculator/UserInfoStep';
import { CRSWizard } from '../components/calculator/CRSWizard';
import { ResultsPage } from '../components/calculator/ResultsPage';
import { CRSInputData } from '../types';

export function Calculator() {
  const [step, setStep] = useState<'user-info' | 'calculator' | 'results'>('user-info');
  const [userInfo, setUserInfo] = useState<{ fullName: string; email: string; phone: string } | null>(null);
  const [calculationData, setCalculationData] = useState<CRSInputData | null>(null);
  const [score, setScore] = useState<number>(0);

  const handleUserInfoComplete = (info: { fullName: string; email: string; phone: string }) => {
    setUserInfo(info);
    setStep('calculator');
  };

  const handleCalculationComplete = (data: CRSInputData, finalScore: number) => {
    setCalculationData(data);
    setScore(finalScore);
    setStep('results');
  };

  const handleStartOver = () => {
    setStep('user-info');
    setUserInfo(null);
    setCalculationData(null);
    setScore(0);
  };

  return (
    <div className="min-h-screen bg-secondary-50">
      {step === 'user-info' && <UserInfoStep onComplete={handleUserInfoComplete} />}
      {step === 'calculator' && userInfo && (
        <CRSWizard userInfo={userInfo} onComplete={handleCalculationComplete} />
      )}
      {step === 'results' && userInfo && calculationData && (
        <ResultsPage
          score={score}
          userInfo={userInfo}
          calculationData={calculationData}
          onStartOver={handleStartOver}
        />
      )}
    </div>
  );
}
