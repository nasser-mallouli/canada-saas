import { Target, TrendingUp, Clock, Zap, Award } from 'lucide-react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { ImprovementAnalysis, ImprovementSuggestion } from '../../utils/crsImprovements';

interface ImprovementSuggestionsProps {
  analysis: ImprovementAnalysis;
}

export function ImprovementSuggestions({ analysis }: ImprovementSuggestionsProps) {
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return 'success';
      case 'medium':
        return 'warning';
      case 'hard':
        return 'error';
      default:
        return 'info';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high':
        return '🔥';
      case 'medium':
        return '⭐';
      case 'low':
        return '💡';
      default:
        return '📌';
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <TrendingUp className="w-8 h-8 text-primary-600" />
        </div>
        <h2 className="text-3xl font-bold text-secondary-900 mb-3">
          Personalized Improvement Plan
        </h2>
        <p className="text-lg text-secondary-600 max-w-2xl mx-auto">
          Based on your profile, here are strategic ways to boost your CRS score and improve your chances of receiving an Invitation to Apply.
        </p>
      </div>

      {/* Quick Wins Section */}
      {analysis.quickWins.length > 0 && (
        <Card className="bg-gradient-to-br from-success-50 to-primary-50 border-success-200">
          <div className="flex items-center gap-3 mb-4">
            <Zap className="w-6 h-6 text-success-600" />
            <h3 className="text-2xl font-bold text-secondary-900">Quick Wins</h3>
          </div>
          <p className="text-secondary-700 mb-6">
            These improvements are relatively easy to achieve and can boost your score quickly.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {analysis.quickWins.map((suggestion) => (
              <SuggestionCard
                key={suggestion.id}
                suggestion={suggestion}
                compact
                getDifficultyColor={getDifficultyColor}
                getPriorityIcon={getPriorityIcon}
              />
            ))}
          </div>
        </Card>
      )}

      {/* Strategic Moves */}
      {analysis.strategicMoves.length > 0 && (
        <Card className="bg-gradient-to-br from-primary-50 to-secondary-50 border-primary-200">
          <div className="flex items-center gap-3 mb-4">
            <Award className="w-6 h-6 text-primary-600" />
            <h3 className="text-2xl font-bold text-secondary-900">Strategic Moves</h3>
          </div>
          <p className="text-secondary-700 mb-6">
            High-impact strategies that can significantly increase your score. These may require more time or effort.
          </p>
          <div className="space-y-4">
            {analysis.strategicMoves.slice(0, 3).map((suggestion) => (
              <SuggestionCard
                key={suggestion.id}
                suggestion={suggestion}
                getDifficultyColor={getDifficultyColor}
                getPriorityIcon={getPriorityIcon}
              />
            ))}
          </div>
        </Card>
      )}

      {/* All Suggestions */}
      <div>
        <div className="flex items-center gap-3 mb-6">
          <Target className="w-6 h-6 text-secondary-700" />
          <h3 className="text-2xl font-bold text-secondary-900">All Improvement Opportunities</h3>
        </div>
        <div className="space-y-4">
          {analysis.suggestions.map((suggestion) => (
            <SuggestionCard
              key={suggestion.id}
              suggestion={suggestion}
              getDifficultyColor={getDifficultyColor}
              getPriorityIcon={getPriorityIcon}
            />
          ))}
        </div>
      </div>

      {/* Additional Resources */}
      <Card className="bg-info-50 border-info-200">
        <h3 className="text-xl font-bold text-info-900 mb-4 flex items-center gap-2">
          <Award className="w-5 h-5" />
          Need Professional Guidance?
        </h3>
        <p className="text-info-800 mb-4">
          Our certified immigration consultants can create a personalized strategy to maximize your CRS score and navigate the Express Entry process.
        </p>
        <div className="flex flex-col sm:flex-row gap-3">
          <a
            href="/consultation"
            className="inline-flex items-center justify-center px-6 py-3 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 transition-colors"
          >
            Book a Consultation
          </a>
          <a
            href="/pathway-advisor"
            className="inline-flex items-center justify-center px-6 py-3 bg-white text-primary-600 font-semibold rounded-lg border-2 border-primary-600 hover:bg-primary-50 transition-colors"
          >
            Take Free Assessment
          </a>
        </div>
      </Card>
    </div>
  );
}

interface SuggestionCardProps {
  suggestion: ImprovementSuggestion;
  compact?: boolean;
  getDifficultyColor: (difficulty: string) => string;
  getPriorityIcon: (priority: string) => string;
}

function SuggestionCard({
  suggestion,
  compact = false,
  getDifficultyColor,
  getPriorityIcon,
}: SuggestionCardProps) {
  if (compact) {
    return (
      <Card className="bg-white hover:shadow-lg transition-shadow">
        <div className="flex items-start gap-3">
          <div className="text-3xl">{suggestion.icon}</div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-lg">{getPriorityIcon(suggestion.priority)}</span>
              <h4 className="font-bold text-secondary-900">{suggestion.title}</h4>
            </div>
            <p className="text-sm text-secondary-600 mb-3">{suggestion.description}</p>
            <div className="flex flex-wrap gap-2">
              <Badge variant={getDifficultyColor(suggestion.difficulty) as any}>
                {suggestion.difficulty}
              </Badge>
              <Badge variant="info">
                <TrendingUp className="w-3 h-3 mr-1 inline" />
                {suggestion.potentialGain}
              </Badge>
            </div>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="hover:shadow-lg transition-shadow bg-white">
      <div className="flex items-start gap-4">
        <div className="text-4xl flex-shrink-0">{suggestion.icon}</div>
        <div className="flex-1">
          <div className="flex items-start justify-between mb-3">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xl">{getPriorityIcon(suggestion.priority)}</span>
                <h4 className="text-xl font-bold text-secondary-900">{suggestion.title}</h4>
              </div>
              <Badge variant="info" className="text-xs">
                {suggestion.category}
              </Badge>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-primary-600">{suggestion.potentialGain}</div>
              <div className="text-xs text-secondary-500">potential gain</div>
            </div>
          </div>

          <p className="text-secondary-700 mb-4">{suggestion.description}</p>

          <div className="flex flex-wrap gap-2 mb-4">
            <Badge variant={getDifficultyColor(suggestion.difficulty) as any}>
              Difficulty: {suggestion.difficulty}
            </Badge>
            <Badge variant="secondary">
              <Clock className="w-3 h-3 mr-1 inline" />
              {suggestion.timeframe}
            </Badge>
          </div>

          <div className="bg-secondary-50 rounded-lg p-4">
            <h5 className="font-semibold text-secondary-900 mb-2 text-sm">Action Steps:</h5>
            <ul className="space-y-2">
              {suggestion.actionSteps.map((step, index) => (
                <li key={index} className="flex items-start gap-2 text-sm text-secondary-700">
                  <span className="flex-shrink-0 w-5 h-5 bg-primary-100 text-primary-700 rounded-full flex items-center justify-center text-xs font-bold">
                    {index + 1}
                  </span>
                  <span>{step}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </Card>
  );
}
