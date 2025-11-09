import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { TrendingUp, Award, Calendar, CheckCircle, AlertCircle, ArrowRight, Download } from 'lucide-react';
import { CRSInputData, CategoryBreakdown } from '../../types';
import { calculateCRS } from '../../utils/crsCalculator';
import { analyzeImprovements } from '../../utils/crsImprovements';
import { ImprovementSuggestions } from './ImprovementSuggestions';
import { supabase } from '../../lib/supabase';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';

interface ResultsPageProps {
  score: number;
  userInfo: { fullName: string; email: string; phone: string };
  calculationData: CRSInputData;
  onStartOver: () => void;
}

export function ResultsPage({ score, userInfo, calculationData, onStartOver }: ResultsPageProps) {
  const { breakdown } = calculateCRS(calculationData);
  const improvementAnalysis = analyzeImprovements(calculationData, score, breakdown);

  useEffect(() => {
    const saveCalculation = async () => {
      try {
        await supabase.from('crs_calculations_detailed').insert([
          {
            user_name: userInfo.fullName,
            user_email: userInfo.email,
            user_phone: userInfo.phone,
            input_data: calculationData,
            crs_score: score,
            category_breakdown: breakdown,
            improvement_suggestions: improvementAnalysis.suggestions,
            session_id: sessionStorage.getItem('sessionId') || 'unknown',
          },
        ]);
      } catch (error) {
        console.error('Error saving calculation:', error);
      }
    };

    saveCalculation();
  }, [score, userInfo, calculationData, breakdown, improvementAnalysis]);

  const getScoreMessage = () => {
    if (score >= 520) return { text: 'Excellent Score!', color: 'success', icon: Award };
    if (score >= 500) return { text: 'Competitive Score', color: 'info', icon: TrendingUp };
    if (score >= 450) return { text: 'Good Progress', color: 'warning', icon: CheckCircle };
    return { text: 'Needs Improvement', color: 'error', icon: AlertCircle };
  };

  const message = getScoreMessage();
  const MessageIcon = message.icon;

  const maxScores = {
    coreHumanCapital: calculationData.hasSpouse ? 460 : 500,
    spousePartner: 40,
    skillTransferability: 100,
    additionalPoints: 600,
  };

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-8 animate-slide-up">
          <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full bg-${message.color}-100 text-${message.color}-600 mb-4`}>
            <MessageIcon className="w-8 h-8" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-secondary-900 mb-4">
            Your CRS Score
          </h1>
          <div className="inline-flex items-baseline gap-2 mb-4">
            <span className="text-7xl md:text-8xl font-bold text-primary-600">{score}</span>
            <span className="text-3xl text-secondary-500">/ 1200</span>
          </div>
          <Badge variant={message.color} className="text-lg px-4 py-2">
            {message.text}
          </Badge>

          <div className="mt-6">
            <Button
              onClick={() => {}}
              disabled={true}
              size="lg"
              className="inline-flex items-center"
              title="PDF download coming soon"
            >
              <Download className="w-5 h-5 mr-2" />
              Download Report (PDF)
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card>
            <h3 className="text-lg font-semibold text-secondary-900 mb-4">Your Information</h3>
            <div className="space-y-2 text-sm">
              <p className="text-secondary-700">
                <strong>Name:</strong> {userInfo.fullName}
              </p>
              <p className="text-secondary-700">
                <strong>Email:</strong> {userInfo.email}
              </p>
              <p className="text-secondary-700">
                <strong>Phone:</strong> {userInfo.phone}
              </p>
              <p className="text-secondary-700 flex items-center">
                <Calendar className="w-4 h-4 mr-1" />
                <strong>Calculated:</strong> {new Date().toLocaleDateString()}
              </p>
            </div>
          </Card>

          <Card>
            <h3 className="text-lg font-semibold text-secondary-900 mb-4">Score Breakdown</h3>
            <div className="space-y-3">
              {Object.entries(breakdown).map(([key, value]) => {
                const labels: Record<string, string> = {
                  coreHumanCapital: 'Core/Human Capital',
                  spousePartner: 'Spouse/Partner',
                  skillTransferability: 'Skill Transferability',
                  additionalPoints: 'Additional Points',
                };
                const max = maxScores[key as keyof CategoryBreakdown];
                const percentage = (value / max) * 100;

                return (
                  <div key={key}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-secondary-700">{labels[key]}</span>
                      <span className="font-semibold text-secondary-900">
                        {value} / {max}
                      </span>
                    </div>
                    <div className="h-2 bg-secondary-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary-600 transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>

        <Card className="mb-8">
          <h3 className="text-xl font-semibold text-secondary-900 mb-4">
            What Your Score Means
          </h3>
          {score >= 520 ? (
            <div className="space-y-3">
              <p className="text-secondary-700">
                With a score of <strong>{score}</strong>, you have an excellent chance of receiving an Invitation to Apply (ITA) in most Express Entry draws.
              </p>
              <ul className="list-disc list-inside space-y-2 text-secondary-700">
                <li>Your score is above the typical cut-off for general draws</li>
                <li>You may receive an ITA in the next few draws</li>
                <li>Focus on preparing your documents and maintaining your qualifications</li>
              </ul>
            </div>
          ) : score >= 500 ? (
            <div className="space-y-3">
              <p className="text-secondary-700">
                With a score of <strong>{score}</strong>, you have a competitive score for Express Entry. You may receive an ITA in general or category-based draws.
              </p>
              <ul className="list-disc list-inside space-y-2 text-secondary-700">
                <li>Monitor recent draw results to see where you stand</li>
                <li>Consider improving language scores or gaining more work experience</li>
                <li>Look into Provincial Nominee Programs (PNPs) for guaranteed selection</li>
              </ul>
            </div>
          ) : score >= 450 ? (
            <div className="space-y-3">
              <p className="text-secondary-700">
                With a score of <strong>{score}</strong>, you have a foundation to build on. Focus on improving your qualifications to become more competitive.
              </p>
              <ul className="list-disc list-inside space-y-2 text-secondary-700">
                <li>Improve language test scores (CLB 9+ in all skills adds significant points)</li>
                <li>Consider additional education or Canadian credentials</li>
                <li>Explore Provincial Nominee Programs that match your profile</li>
                <li>Gain more Canadian work experience if possible</li>
              </ul>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-secondary-700">
                With a score of <strong>{score}</strong>, you'll need to improve your qualifications significantly to be competitive in Express Entry.
              </p>
              <ul className="list-disc list-inside space-y-2 text-secondary-700">
                <li>Focus on achieving high language test scores (target CLB 9+)</li>
                <li>Consider pursuing higher education or Canadian credentials</li>
                <li>Research Provincial Nominee Programs with lower requirements</li>
                <li>Book a consultation to explore all your immigration pathways</li>
              </ul>
            </div>
          )}
        </Card>

        {/* Improvement Suggestions Section */}
        <div className="my-12">
          <ImprovementSuggestions analysis={improvementAnalysis} />
        </div>

        <div className="bg-gradient-to-br from-primary-600 to-primary-700 rounded-xl p-8 text-white text-center mb-8">
          <h3 className="text-2xl font-bold mb-4">Ready for the Next Step?</h3>
          <p className="text-primary-100 mb-6 max-w-2xl mx-auto">
            Book a professional consultation to get personalized guidance on improving your score and navigating the immigration process.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/consultation">
              <Button size="lg" variant="secondary">
                Book Consultation
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            <Button size="lg" variant="outline" onClick={onStartOver} className="border-white text-white hover:bg-white hover:text-primary-600">
              Calculate Again
            </Button>
          </div>
        </div>

        <Card>
          <h3 className="text-lg font-semibold text-secondary-900 mb-4">Important Reminders</h3>
          <ul className="space-y-2 text-sm text-secondary-700">
            <li className="flex items-start">
              <CheckCircle className="w-5 h-5 mr-2 text-success-500 flex-shrink-0 mt-0.5" />
              <span>This calculator provides an estimate. Your official score is determined by IRCC when you create an Express Entry profile.</span>
            </li>
            <li className="flex items-start">
              <CheckCircle className="w-5 h-5 mr-2 text-success-500 flex-shrink-0 mt-0.5" />
              <span>CRS scores and draw cut-offs change regularly. Monitor official IRCC announcements for the latest information.</span>
            </li>
            <li className="flex items-start">
              <CheckCircle className="w-5 h-5 mr-2 text-success-500 flex-shrink-0 mt-0.5" />
              <span>All claims in your Express Entry profile must be supported by valid documents.</span>
            </li>
          </ul>
        </Card>
      </div>
    </div>
  );
}
