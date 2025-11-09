import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { UserInfoStep } from '../components/calculator/UserInfoStep';
import { CRSWizard } from '../components/calculator/CRSWizard';
import { ResultsPage } from '../components/calculator/ResultsPage';
import { CRSInputData } from '../types';
import { getCalculatorSessionId, trackCalculatorStep, setCalculationId } from '../utils/calculatorSession';
import { api } from '../lib/api';

export function Calculator() {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const [step, setStep] = useState<'user-info' | 'calculator' | 'results'>('user-info');
  const [userInfo, setUserInfo] = useState<{ fullName: string; email: string; phone: string } | null>(null);
  const [calculationData, setCalculationData] = useState<CRSInputData | null>(null);
  const [score, setScore] = useState<number>(0);
  const [loading, setLoading] = useState(false);

  // Load session data if ID is in URL
  useEffect(() => {
    if (id) {
      loadSession(id);
    } else {
      // Track when calculator page is accessed (new session)
    trackCalculatorStep('started', [], {});
    }
  }, [id]);

  const loadSession = async (sessionId: string) => {
    try {
      setLoading(true);
      const session = await api.get(`/api/crs/session/${sessionId}`, { skipAuth: true });
      
      // Restore session_id to sessionStorage so future updates use the same session
      if (session.session_id) {
        sessionStorage.setItem('calculator_session_id', session.session_id);
      }
      
      // Restore user info
      if (session.user_name && session.user_email) {
        setUserInfo({
          fullName: session.user_name,
          email: session.user_email,
          phone: session.user_phone || '',
        });
      }

      // Restore calculation data
      if (session.partial_data && Object.keys(session.partial_data).length > 0) {
        setCalculationData(session.partial_data as CRSInputData);
      }

      // Restore step based on completion status
      if (session.is_completed) {
        // If completed, we need to check if there's a detailed calculation
        // For now, show results if we have calculation data
        if (session.partial_data && session.partial_data.age) {
          // Calculate score from partial data
          const { calculateCRS } = await import('../utils/crsCalculator');
          const { score: calculatedScore } = calculateCRS(session.partial_data as CRSInputData);
          setScore(calculatedScore);
          setStep('results');
        } else {
          setStep('calculator');
        }
      } else {
        // Determine step based on current_step
        if (session.current_step === 'started' || !session.user_name) {
          setStep('user-info');
        } else if (session.current_step === 'completed') {
          setStep('results');
        } else {
          setStep('calculator');
        }
      }

      // Store the calculation ID
      setCalculationId(session.id);
    } catch (error) {
      console.error('Error loading session:', error);
      // If session not found, start fresh
      navigate('/calculator', { replace: true });
    } finally {
      setLoading(false);
    }
  };

  const handleUserInfoComplete = async (info: { fullName: string; email: string; phone: string }) => {
    setUserInfo(info);
    setStep('calculator');
    
    // Track user info and get session ID immediately (no debounce)
    const sessionId = getCalculatorSessionId();
    try {
      const response = await api.post(
        '/api/crs/session',
        {
          session_id: sessionId,
          current_step: 'age',
          completed_steps: [],
          partial_data: {},
          user_name: info.fullName,
          user_email: info.email,
          user_phone: info.phone,
          is_completed: false,
        },
        { skipAuth: true }
      );
      
      if (response?.id) {
        // Update URL with calculation ID
        navigate(`/calculator/${response.id}`, { replace: true });
        setCalculationId(response.id);
      }
    } catch (error) {
      console.error('Error creating session:', error);
      // Continue anyway - tracking shouldn't block the flow
    }
  };

  const handleCalculationComplete = async (data: CRSInputData, finalScore: number) => {
    setCalculationData(data);
    setScore(finalScore);
    setStep('results');
    
    // Update session as completed
    if (id) {
      await trackCalculatorStep('completed', [], data, userInfo || undefined, true);
    }
  };

  const handleStartOver = () => {
    // Clear session storage and navigate to fresh calculator
    sessionStorage.removeItem('calculation_id');
    sessionStorage.removeItem('calculator_session_id');
    navigate('/calculator', { replace: true });
    setStep('user-info');
    setUserInfo(null);
    setCalculationData(null);
    setScore(0);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-secondary-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-secondary-600">Loading your calculation...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-secondary-50">
      {step === 'user-info' && <UserInfoStep onComplete={handleUserInfoComplete} />}
      {step === 'calculator' && userInfo && (
        <CRSWizard 
          userInfo={userInfo} 
          onComplete={handleCalculationComplete}
          initialData={calculationData}
          calculationId={id}
        />
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
