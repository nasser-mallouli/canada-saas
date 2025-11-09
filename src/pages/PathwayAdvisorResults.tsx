import { useLocation, Link } from 'react-router-dom';
import {  CheckCircle, XCircle, AlertCircle, ArrowRight, TrendingUp, Home as HomeIcon } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { PathwayEligibility } from '../utils/pathwayEligibility';

export function PathwayAdvisorResults() {
  const location = useLocation();
  const { results, formData } = location.state || { results: [], formData: {} };

  if (!results || results.length === 0) {
    return (
      <div className="min-h-screen bg-secondary-50 flex items-center justify-center px-4">
        <Card className="max-w-md text-center">
          <h2 className="text-2xl font-bold text-secondary-900 mb-4">No Results Found</h2>
          <p className="text-secondary-600 mb-6">
            Please complete the pathway advisor form to see your results.
          </p>
          <Link to="/pathway-advisor">
            <Button>Start Advisor</Button>
          </Link>
        </Card>
      </div>
    );
  }

  const topPathway = results[0];
  const eligiblePathways = results.filter((r: PathwayEligibility) => r.eligible);

  return (
    <div className="min-h-screen bg-secondary-50 py-12 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <Badge variant="success" className="mb-4 text-lg px-6 py-2">
            Assessment Complete
          </Badge>
          <h1 className="text-4xl font-bold text-secondary-900 mb-4">
            Your Immigration Pathway Results
          </h1>
          <p className="text-xl text-secondary-600">
            Based on your profile, here are your personalized recommendations
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <Card className="text-center">
            <div className="text-4xl font-bold text-primary-600 mb-2">{eligiblePathways.length}</div>
            <div className="text-secondary-600">Eligible Pathways</div>
          </Card>
          <Card className="text-center">
            <div className="text-4xl font-bold text-success-600 mb-2">{topPathway.readinessScore}%</div>
            <div className="text-secondary-600">Best Match Score</div>
          </Card>
          <Card className="text-center">
            <div className="text-4xl font-bold text-warning-600 mb-2">{results.length}</div>
            <div className="text-secondary-600">Total Options Evaluated</div>
          </Card>
        </div>

        {eligiblePathways.length > 0 && (
          <Card className="mb-8 bg-gradient-to-br from-success-50 to-primary-50 border-success-200">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-success-500 flex items-center justify-center flex-shrink-0">
                <CheckCircle className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-success-900 mb-2">
                  Great News! You're Eligible for {eligiblePathways.length} Pathway{eligiblePathways.length > 1 ? 's' : ''}
                </h3>
                <p className="text-success-800">
                  You meet the basic requirements for {eligiblePathways.map((p: PathwayEligibility) => p.pathway).join(', ')}.
                  Review the details below and take action on your best options.
                </p>
              </div>
            </div>
          </Card>
        )}

        <div className="space-y-6 mb-12">
          {results.map((pathway: PathwayEligibility, index: number) => (
            <PathwayResultCard key={index} pathway={pathway} rank={index + 1} />
          ))}
        </div>

        <Card className="bg-gradient-to-br from-primary-600 to-primary-800 text-white">
          <h3 className="text-2xl font-bold mb-4">Ready to Take the Next Step?</h3>
          <p className="text-primary-100 mb-6">
            Book a consultation with our immigration experts to create a personalized action plan
            and maximize your chances of success.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link to="/information-session">
              <Button size="lg" variant="secondary">
                Book Consultation
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            <Link to="/calculator">
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-primary-600">
                Calculate CRS Score
              </Button>
            </Link>
            <Link to="/">
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-primary-600">
                <HomeIcon className="w-5 h-5 mr-2" />
                Back to Home
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}

function PathwayResultCard({ pathway, rank }: { pathway: PathwayEligibility; rank: number }) {
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'success';
    if (score >= 60) return 'info';
    if (score >= 40) return 'warning';
    return 'error';
  };

  const scoreColor = getScoreColor(pathway.readinessScore);

  return (
    <Card className={`relative ${pathway.eligible ? 'border-l-4 border-l-success-500' : ''}`}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start gap-4">
          <div className={`w-10 h-10 rounded-full bg-${scoreColor}-100 text-${scoreColor}-600 flex items-center justify-center font-bold flex-shrink-0`}>
            #{rank}
          </div>
          <div>
            <h3 className="text-2xl font-bold text-secondary-900 mb-2">{pathway.pathway}</h3>
            <p className="text-secondary-600">{pathway.details}</p>
          </div>
        </div>
        <div className="text-right flex-shrink-0 ml-4">
          <div className={`text-3xl font-bold text-${scoreColor}-600`}>{pathway.readinessScore}%</div>
          <div className="text-sm text-secondary-500">Readiness</div>
        </div>
      </div>

      <div className="mb-6">
        <div className="h-3 bg-secondary-200 rounded-full overflow-hidden">
          <div
            className={`h-full bg-${scoreColor}-500 transition-all duration-500`}
            style={{ width: `${pathway.readinessScore}%` }}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {pathway.missingRequirements.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <XCircle className="w-5 h-5 text-error-500" />
              <h4 className="font-semibold text-secondary-900">Missing Requirements</h4>
            </div>
            <ul className="space-y-2">
              {pathway.missingRequirements.map((req, idx) => (
                <li key={idx} className="text-sm text-secondary-600 flex items-start gap-2">
                  <span className="text-error-500 flex-shrink-0 mt-0.5">•</span>
                  <span>{req}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {pathway.recommendations.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="w-5 h-5 text-info-500" />
              <h4 className="font-semibold text-secondary-900">Recommendations</h4>
            </div>
            <ul className="space-y-2">
              {pathway.recommendations.map((rec, idx) => (
                <li key={idx} className="text-sm text-secondary-600 flex items-start gap-2">
                  <ArrowRight className="w-4 h-4 text-info-500 flex-shrink-0 mt-0.5" />
                  <span>{rec}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {pathway.eligible && (
        <div className="mt-6 pt-6 border-t border-secondary-200">
          <div className="flex items-center gap-3 p-4 bg-success-50 rounded-lg">
            <CheckCircle className="w-6 h-6 text-success-600 flex-shrink-0" />
            <div>
              <div className="font-semibold text-success-900 mb-1">You're Eligible!</div>
              <p className="text-sm text-success-700">
                You meet the basic requirements for this pathway. Book a consultation to start your application.
              </p>
            </div>
          </div>
        </div>
      )}

      {!pathway.eligible && pathway.readinessScore >= 50 && (
        <div className="mt-6 pt-6 border-t border-secondary-200">
          <div className="flex items-center gap-3 p-4 bg-warning-50 rounded-lg">
            <AlertCircle className="w-6 h-6 text-warning-600 flex-shrink-0" />
            <div>
              <div className="font-semibold text-warning-900 mb-1">Almost There!</div>
              <p className="text-sm text-warning-700">
                You're close to meeting the requirements. Focus on the missing items listed above.
              </p>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}
