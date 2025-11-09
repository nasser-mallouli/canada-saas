import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, ArrowRight, ArrowLeft } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Badge } from '../components/ui/Badge';
import { Autocomplete } from '../components/ui/Autocomplete';
import { supabase } from '../lib/supabase';
import { evaluateAllPathways, PathwayAdvisorData } from '../utils/pathwayEligibility';
import {
  COUNTRIES,
  EDUCATION_LEVELS,
  FIELDS_OF_STUDY,
  PATHWAY_GOALS,
  LANGUAGE_TESTS,
  MARITAL_STATUS,
  CANADIAN_PROVINCES,
  FRENCH_LEVELS
} from '../utils/pathwayAdvisorData';

export function PathwayAdvisor() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState<Partial<PathwayAdvisorData>>({
    userName: '',
    userEmail: '',
    userPhone: '',
    birthDate: '',
    citizenshipCountry: '',
    residenceCountry: '',
    educationLevel: '',
    workExperienceYears: 0,
    fieldOfStudy: '',
    languageTests: [],
    maritalStatus: '',
    hasCanadianRelative: false,
    hasJobOffer: false,
    hasCanadianExperience: false,
    hasPoliceRecord: false,
    availableFunds: 0,
    pathwayGoal: '',
    pathwaySpecificData: {}
  });

  const updateField = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const updateSpecificData = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      pathwaySpecificData: {
        ...prev.pathwaySpecificData,
        [field]: value
      }
    }));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const results = evaluateAllPathways(formData as PathwayAdvisorData);

      const { error } = await supabase
        .from('pathway_advisor_submissions')
        .insert({
          user_name: formData.userName,
          user_email: formData.userEmail,
          user_phone: formData.userPhone,
          birth_date: formData.birthDate,
          citizenship_country: formData.citizenshipCountry,
          residence_country: formData.residenceCountry,
          education_level: formData.educationLevel,
          work_experience_years: formData.workExperienceYears,
          field_of_study: formData.fieldOfStudy,
          language_tests: formData.languageTests,
          marital_status: formData.maritalStatus,
          has_canadian_relative: formData.hasCanadianRelative,
          has_job_offer: formData.hasJobOffer,
          has_canadian_experience: formData.hasCanadianExperience,
          has_police_record: formData.hasPoliceRecord,
          available_funds: formData.availableFunds,
          pathway_goal: formData.pathwayGoal,
          pathway_specific_data: formData.pathwaySpecificData,
          eligibility_results: results
        });

      if (error) throw error;

      navigate('/pathway-advisor/results', { state: { results, formData } });
    } catch (error) {
      console.error('Error submitting advisor form:', error);
      alert('Failed to submit form. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 0:
        return <ContactStep formData={formData} updateField={updateField} />;
      case 1:
        return <GoalStep formData={formData} updateField={updateField} />;
      case 2:
        return <BasicInfoStep formData={formData} updateField={updateField} />;
      case 3:
        return <EducationWorkStep formData={formData} updateField={updateField} />;
      case 4:
        return <LanguageStep formData={formData} updateField={updateField} />;
      case 5:
        return <CircumstancesStep formData={formData} updateField={updateField} />;
      case 6:
        return <PathwaySpecificStep formData={formData} updateField={updateField} updateSpecificData={updateSpecificData} />;
      default:
        return null;
    }
  };

  const canProceed = () => {
    switch (step) {
      case 0:
        return formData.userName && formData.userEmail;
      case 1:
        return formData.pathwayGoal;
      case 2:
        return formData.birthDate && formData.citizenshipCountry;
      case 3:
        return formData.educationLevel;
      case 4:
        return true;
      case 5:
        return true;
      case 6:
        return true;
      default:
        return false;
    }
  };

  const totalSteps = 7;
  const progress = ((step + 1) / totalSteps) * 100;

  return (
    <div className="min-h-screen bg-secondary-50 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-secondary-900 mb-4">
            Immigration Pathway Advisor
          </h1>
          <p className="text-lg text-secondary-600 mb-6">
            Answer a few questions to discover which Canadian immigration pathways you're eligible for
          </p>
          <div className="w-full bg-secondary-200 rounded-full h-3 mb-2">
            <div
              className="bg-primary-600 h-3 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-sm text-secondary-500">
            Step {step + 1} of {totalSteps}
          </p>
        </div>

        <Card className="mb-6">
          {renderStep()}
        </Card>

        <div className="flex justify-between gap-4">
          {step > 0 && (
            <Button variant="outline" onClick={() => setStep(step - 1)} disabled={isSubmitting}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Previous
            </Button>
          )}
          <div className="flex-1" />
          {step < totalSteps - 1 ? (
            <Button onClick={() => setStep(step + 1)} disabled={!canProceed()}>
              Next
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button onClick={handleSubmit} disabled={!canProceed() || isSubmitting}>
              {isSubmitting ? 'Calculating...' : 'Get Results'}
              <CheckCircle className="w-4 h-4 ml-2" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

function ContactStep({ formData, updateField }: any) {
  return (
    <div>
      <h2 className="text-2xl font-bold text-secondary-900 mb-4">Your Contact Information</h2>
      <p className="text-secondary-600 mb-6">
        We'll use this to save your results and send you personalized recommendations.
      </p>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-secondary-700 mb-2">
            Full Name <span className="text-error-500">*</span>
          </label>
          <Input
            value={formData.userName}
            onChange={(e) => updateField('userName', e.target.value)}
            placeholder="John Doe"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-secondary-700 mb-2">
            Email Address <span className="text-error-500">*</span>
          </label>
          <Input
            type="email"
            value={formData.userEmail}
            onChange={(e) => updateField('userEmail', e.target.value)}
            placeholder="john@example.com"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-secondary-700 mb-2">
            Phone Number (Optional)
          </label>
          <Input
            type="tel"
            value={formData.userPhone}
            onChange={(e) => updateField('userPhone', e.target.value)}
            placeholder="+1 (555) 123-4567"
          />
        </div>
      </div>
    </div>
  );
}

function GoalStep({ formData, updateField }: any) {
  return (
    <div>
      <h2 className="text-2xl font-bold text-secondary-900 mb-4">What is Your Immigration Goal?</h2>
      <p className="text-secondary-600 mb-6">
        Select your primary goal. We'll evaluate all relevant pathways for you.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {PATHWAY_GOALS.map((goal) => (
          <button
            key={goal.id}
            onClick={() => updateField('pathwayGoal', goal.id)}
            className={`text-left p-5 rounded-xl border-2 transition-all hover:shadow-md ${
              formData.pathwayGoal === goal.id
                ? 'border-primary-600 bg-primary-50 shadow-md'
                : 'border-secondary-200 hover:border-primary-300'
            }`}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="text-4xl">{goal.emoji}</div>
              {formData.pathwayGoal === goal.id && (
                <CheckCircle className="w-6 h-6 text-primary-600 flex-shrink-0" />
              )}
            </div>
            <h3 className="font-semibold text-secondary-900 mb-1">{goal.label}</h3>
            <p className="text-sm text-secondary-600">{goal.description}</p>
          </button>
        ))}
      </div>
    </div>
  );
}

function BasicInfoStep({ formData, updateField }: any) {
  return (
    <div>
      <h2 className="text-2xl font-bold text-secondary-900 mb-4">Basic Information</h2>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-secondary-700 mb-2">
            Date of Birth <span className="text-error-500">*</span>
          </label>
          <Input
            type="date"
            value={formData.birthDate}
            onChange={(e) => updateField('birthDate', e.target.value)}
            max={new Date().toISOString().split('T')[0]}
            required
            className="appearance-none"
          />
          <p className="text-xs text-secondary-500 mt-1">Age affects CRS points in Express Entry</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-secondary-700 mb-2">
            Country of Citizenship <span className="text-error-500">*</span>
          </label>
          <Autocomplete
            options={COUNTRIES}
            value={formData.citizenshipCountry}
            onChange={(value) => updateField('citizenshipCountry', value)}
            placeholder="Search for your country..."
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-secondary-700 mb-2">
            Current Country of Residence
          </label>
          <Autocomplete
            options={COUNTRIES}
            value={formData.residenceCountry}
            onChange={(value) => updateField('residenceCountry', value)}
            placeholder="Search for country..."
          />
        </div>
      </div>
    </div>
  );
}

function EducationWorkStep({ formData, updateField }: any) {
  return (
    <div>
      <h2 className="text-2xl font-bold text-secondary-900 mb-4">Education & Work Experience</h2>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-secondary-700 mb-2">
            Highest Education Level <span className="text-error-500">*</span>
          </label>
          <select
            value={formData.educationLevel}
            onChange={(e) => updateField('educationLevel', e.target.value)}
            className="w-full px-4 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent appearance-none bg-white"
            required
          >
            <option value="">Select education level</option>
            {EDUCATION_LEVELS.map((level) => (
              <option key={level.value} value={level.value}>{level.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-secondary-700 mb-2">
            Field of Study / Work Sector
          </label>
          <Autocomplete
            options={FIELDS_OF_STUDY}
            value={formData.fieldOfStudy}
            onChange={(value) => updateField('fieldOfStudy', value)}
            placeholder="Search for your field..."
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-secondary-700 mb-2">
            Years of Skilled Work Experience
          </label>
          <Input
            type="number"
            min="0"
            step="0.5"
            value={formData.workExperienceYears}
            onChange={(e) => updateField('workExperienceYears', parseFloat(e.target.value) || 0)}
            placeholder="e.g., 3.5"
          />
          <p className="text-xs text-secondary-500 mt-1">Full-time equivalent in skilled occupation</p>
        </div>
      </div>
    </div>
  );
}

function LanguageStep({ formData, updateField }: any) {
  const [selectedLanguage, setSelectedLanguage] = useState<'english' | 'french'>('english');
  const [selectedTest, setSelectedTest] = useState('');
  const [scores, setScores] = useState({ listening: 0, reading: 0, writing: 0, speaking: 0, overall: 0 });

  const addLanguageTest = () => {
    if (selectedTest) {
      const tests = [...(formData.languageTests || [])];
      tests.push({
        type: selectedTest,
        ...scores
      });
      updateField('languageTests', tests);
      setSelectedTest('');
      setScores({ listening: 0, reading: 0, writing: 0, speaking: 0, overall: 0 });
    }
  };

  const removeTest = (index: number) => {
    const tests = [...(formData.languageTests || [])];
    tests.splice(index, 1);
    updateField('languageTests', tests);
  };

  const currentTests = selectedLanguage === 'english' ? LANGUAGE_TESTS.english : LANGUAGE_TESTS.french;

  return (
    <div>
      <h2 className="text-2xl font-bold text-secondary-900 mb-4">Language Tests</h2>
      <p className="text-secondary-600 mb-6">
        Add any language tests you've taken. Multiple tests can improve your eligibility.
      </p>

      {formData.languageTests && formData.languageTests.length > 0 && (
        <div className="mb-6 space-y-2">
          {formData.languageTests.map((test: any, index: number) => (
            <div key={index} className="flex items-center justify-between p-3 bg-secondary-50 rounded-lg">
              <div>
                <Badge variant="info">{test.type}</Badge>
                <span className="ml-3 text-sm text-secondary-700">
                  L: {test.listening} R: {test.reading} W: {test.writing} S: {test.speaking}
                  {test.overall > 0 && ` | Overall: ${test.overall}`}
                </span>
              </div>
              <button
                onClick={() => removeTest(index)}
                className="text-error-500 hover:text-error-700 text-sm font-medium"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="space-y-4">
        <div className="flex gap-2 p-1 bg-secondary-100 rounded-lg">
          <button
            onClick={() => setSelectedLanguage('english')}
            className={`flex-1 py-2 px-4 rounded-md font-medium transition-colors ${
              selectedLanguage === 'english'
                ? 'bg-white text-primary-600 shadow-sm'
                : 'text-secondary-600 hover:text-secondary-900'
            }`}
          >
            🇬🇧 English Tests
          </button>
          <button
            onClick={() => setSelectedLanguage('french')}
            className={`flex-1 py-2 px-4 rounded-md font-medium transition-colors ${
              selectedLanguage === 'french'
                ? 'bg-white text-primary-600 shadow-sm'
                : 'text-secondary-600 hover:text-secondary-900'
            }`}
          >
            🇫🇷 French Tests
          </button>
        </div>

        <div>
          <label className="block text-sm font-medium text-secondary-700 mb-2">
            Select Test Type
          </label>
          <select
            value={selectedTest}
            onChange={(e) => setSelectedTest(e.target.value)}
            className="w-full px-4 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="">Choose a test</option>
            {currentTests.map((test) => (
              <option key={test.value} value={test.value}>{test.label}</option>
            ))}
          </select>
        </div>

        {selectedTest && (
          <>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">Listening</label>
                <Input
                  type="number"
                  min="0"
                  max="9"
                  step="0.5"
                  value={scores.listening}
                  onChange={(e) => setScores({ ...scores, listening: parseFloat(e.target.value) || 0 })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">Reading</label>
                <Input
                  type="number"
                  min="0"
                  max="9"
                  step="0.5"
                  value={scores.reading}
                  onChange={(e) => setScores({ ...scores, reading: parseFloat(e.target.value) || 0 })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">Writing</label>
                <Input
                  type="number"
                  min="0"
                  max="9"
                  step="0.5"
                  value={scores.writing}
                  onChange={(e) => setScores({ ...scores, writing: parseFloat(e.target.value) || 0 })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">Speaking</label>
                <Input
                  type="number"
                  min="0"
                  max="9"
                  step="0.5"
                  value={scores.speaking}
                  onChange={(e) => setScores({ ...scores, speaking: parseFloat(e.target.value) || 0 })}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">Overall Score (if applicable)</label>
              <Input
                type="number"
                min="0"
                max="9"
                step="0.5"
                value={scores.overall}
                onChange={(e) => setScores({ ...scores, overall: parseFloat(e.target.value) || 0 })}
              />
            </div>
            <Button onClick={addLanguageTest} variant="outline" size="sm" className="w-full">
              Add This Test
            </Button>
          </>
        )}
      </div>
    </div>
  );
}

function CircumstancesStep({ formData, updateField }: any) {
  return (
    <div>
      <h2 className="text-2xl font-bold text-secondary-900 mb-4">Personal Circumstances</h2>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-secondary-700 mb-2">
            Marital Status
          </label>
          <select
            value={formData.maritalStatus}
            onChange={(e) => updateField('maritalStatus', e.target.value)}
            className="w-full px-4 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="">Select status</option>
            {MARITAL_STATUS.map((status) => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>
        </div>

        <div className="space-y-3">
          <label className="flex items-center space-x-3 p-4 border border-secondary-200 rounded-lg cursor-pointer hover:bg-secondary-50 transition-colors">
            <input
              type="checkbox"
              checked={formData.hasJobOffer}
              onChange={(e) => updateField('hasJobOffer', e.target.checked)}
              className="w-5 h-5 text-primary-600 rounded focus:ring-2 focus:ring-primary-500"
            />
            <span className="text-secondary-700 font-medium">I have a Canadian job offer</span>
          </label>

          <label className="flex items-center space-x-3 p-4 border border-secondary-200 rounded-lg cursor-pointer hover:bg-secondary-50 transition-colors">
            <input
              type="checkbox"
              checked={formData.hasCanadianExperience}
              onChange={(e) => updateField('hasCanadianExperience', e.target.checked)}
              className="w-5 h-5 text-primary-600 rounded focus:ring-2 focus:ring-primary-500"
            />
            <span className="text-secondary-700 font-medium">I have studied or worked in Canada before</span>
          </label>

          <label className="flex items-center space-x-3 p-4 border border-secondary-200 rounded-lg cursor-pointer hover:bg-secondary-50 transition-colors">
            <input
              type="checkbox"
              checked={formData.hasCanadianRelative}
              onChange={(e) => updateField('hasCanadianRelative', e.target.checked)}
              className="w-5 h-5 text-primary-600 rounded focus:ring-2 focus:ring-primary-500"
            />
            <span className="text-secondary-700 font-medium">I have a relative who is a Canadian PR or citizen</span>
          </label>

          <label className="flex items-center space-x-3 p-4 border border-secondary-200 rounded-lg cursor-pointer hover:bg-secondary-50 transition-colors">
            <input
              type="checkbox"
              checked={formData.hasPoliceRecord}
              onChange={(e) => updateField('hasPoliceRecord', e.target.checked)}
              className="w-5 h-5 text-primary-600 rounded focus:ring-2 focus:ring-primary-500"
            />
            <span className="text-secondary-700 font-medium">I have a criminal record</span>
          </label>
        </div>

        <div>
          <label className="block text-sm font-medium text-secondary-700 mb-2">
            Available Funds (CAD)
          </label>
          <Input
            type="number"
            min="0"
            value={formData.availableFunds}
            onChange={(e) => updateField('availableFunds', parseFloat(e.target.value) || 0)}
            placeholder="e.g., 25000"
          />
          <p className="text-xs text-secondary-500 mt-1">Proof of funds requirement varies by pathway</p>
        </div>
      </div>
    </div>
  );
}

function PathwaySpecificStep({ formData, updateField, updateSpecificData }: any) {
  const goal = formData.pathwayGoal;

  return (
    <div>
      <h2 className="text-2xl font-bold text-secondary-900 mb-4">Additional Details</h2>
      <p className="text-secondary-600 mb-6">
        A few more questions specific to your chosen pathway.
      </p>

      <div className="space-y-4">
        {(goal === 'study' || goal === 'all') && (
          <>
            <div className="p-4 bg-primary-50 rounded-lg mb-4">
              <h3 className="font-semibold text-primary-900 mb-2">🎓 Study Visa Questions</h3>
            </div>
            <label className="flex items-center space-x-3 p-4 border border-secondary-200 rounded-lg cursor-pointer hover:bg-secondary-50 transition-colors">
              <input
                type="checkbox"
                checked={formData.pathwaySpecificData?.hasAcceptanceLetter}
                onChange={(e) => updateSpecificData('hasAcceptanceLetter', e.target.checked)}
                className="w-5 h-5 text-primary-600 rounded"
              />
              <span className="text-secondary-700 font-medium">I have a Letter of Acceptance from a DLI</span>
            </label>
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">
                Expected Tuition Cost (CAD)
              </label>
              <Input
                type="number"
                value={formData.pathwaySpecificData?.tuitionCost || ''}
                onChange={(e) => updateSpecificData('tuitionCost', parseFloat(e.target.value) || 0)}
                placeholder="e.g., 15000"
              />
            </div>
            <label className="flex items-center space-x-3 p-4 border border-secondary-200 rounded-lg cursor-pointer hover:bg-secondary-50 transition-colors">
              <input
                type="checkbox"
                checked={formData.pathwaySpecificData?.hasHomeCountryTies}
                onChange={(e) => updateSpecificData('hasHomeCountryTies', e.target.checked)}
                className="w-5 h-5 text-primary-600 rounded"
              />
              <span className="text-secondary-700 font-medium">I have strong ties to my home country (job, property, family)</span>
            </label>
          </>
        )}

        {(goal === 'work' || goal === 'all') && (
          <>
            <div className="p-4 bg-success-50 rounded-lg mb-4 mt-6">
              <h3 className="font-semibold text-success-900 mb-2">💼 Work Permit Questions</h3>
            </div>
            <label className="flex items-center space-x-3 p-4 border border-secondary-200 rounded-lg cursor-pointer hover:bg-secondary-50 transition-colors">
              <input
                type="checkbox"
                checked={formData.pathwaySpecificData?.hasLMIA}
                onChange={(e) => updateSpecificData('hasLMIA', e.target.checked)}
                className="w-5 h-5 text-primary-600 rounded"
              />
              <span className="text-secondary-700 font-medium">My job offer has LMIA approval</span>
            </label>
            <label className="flex items-center space-x-3 p-4 border border-secondary-200 rounded-lg cursor-pointer hover:bg-secondary-50 transition-colors">
              <input
                type="checkbox"
                checked={formData.pathwaySpecificData?.isLMIAExempt}
                onChange={(e) => updateSpecificData('isLMIAExempt', e.target.checked)}
                className="w-5 h-5 text-primary-600 rounded"
              />
              <span className="text-secondary-700 font-medium">My position is LMIA-exempt</span>
            </label>
          </>
        )}

        {(goal === 'pr' || goal === 'all') && (
          <>
            <div className="p-4 bg-info-50 rounded-lg mb-4 mt-6">
              <h3 className="font-semibold text-info-900 mb-2">🏠 PR / Express Entry Questions</h3>
            </div>
            <label className="flex items-center space-x-3 p-4 border border-secondary-200 rounded-lg cursor-pointer hover:bg-secondary-50 transition-colors">
              <input
                type="checkbox"
                checked={formData.pathwaySpecificData?.hasECA}
                onChange={(e) => updateSpecificData('hasECA', e.target.checked)}
                className="w-5 h-5 text-primary-600 rounded"
              />
              <span className="text-secondary-700 font-medium">I have an Educational Credential Assessment (ECA)</span>
            </label>
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">
                Preferred Province (for PNP)
              </label>
              <Autocomplete
                options={CANADIAN_PROVINCES}
                value={formData.pathwaySpecificData?.preferredProvince || ''}
                onChange={(value) => updateSpecificData('preferredProvince', value)}
                placeholder="Search for province..."
              />
            </div>
            <label className="flex items-center space-x-3 p-4 border border-secondary-200 rounded-lg cursor-pointer hover:bg-secondary-50 transition-colors">
              <input
                type="checkbox"
                checked={formData.pathwaySpecificData?.jobInPreferredProvince}
                onChange={(e) => updateSpecificData('jobInPreferredProvince', e.target.checked)}
                className="w-5 h-5 text-primary-600 rounded"
              />
              <span className="text-secondary-700 font-medium">My job offer is in my preferred province</span>
            </label>
            <label className="flex items-center space-x-3 p-4 border border-secondary-200 rounded-lg cursor-pointer hover:bg-secondary-50 transition-colors">
              <input
                type="checkbox"
                checked={formData.pathwaySpecificData?.experienceInProvince}
                onChange={(e) => updateSpecificData('experienceInProvince', e.target.checked)}
                className="w-5 h-5 text-primary-600 rounded"
              />
              <span className="text-secondary-700 font-medium">I have work/study experience in my preferred province</span>
            </label>
          </>
        )}

        {(goal === 'quebec' || goal === 'all') && (
          <>
            <div className="p-4 bg-warning-50 rounded-lg mb-4 mt-6">
              <h3 className="font-semibold text-warning-900 mb-2">🇫🇷 Quebec PR Questions</h3>
            </div>
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">
                French Language Level
              </label>
              <select
                value={formData.pathwaySpecificData?.frenchLevel || ''}
                onChange={(e) => updateSpecificData('frenchLevel', e.target.value)}
                className="w-full px-4 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="">Select level</option>
                {FRENCH_LEVELS.map((level) => (
                  <option key={level.value} value={level.value}>{level.label}</option>
                ))}
              </select>
            </div>
            <label className="flex items-center space-x-3 p-4 border border-secondary-200 rounded-lg cursor-pointer hover:bg-secondary-50 transition-colors">
              <input
                type="checkbox"
                checked={formData.pathwaySpecificData?.hasQuebecJobOffer}
                onChange={(e) => updateSpecificData('hasQuebecJobOffer', e.target.checked)}
                className="w-5 h-5 text-primary-600 rounded"
              />
              <span className="text-secondary-700 font-medium">I have a job offer in Quebec</span>
            </label>
          </>
        )}

        {(goal === 'citizenship' || goal === 'all') && (
          <>
            <div className="p-4 bg-accent-50 rounded-lg mb-4 mt-6">
              <h3 className="font-semibold text-accent-900 mb-2">🍁 Citizenship Questions</h3>
            </div>
            <label className="flex items-center space-x-3 p-4 border border-secondary-200 rounded-lg cursor-pointer hover:bg-secondary-50 transition-colors">
              <input
                type="checkbox"
                checked={formData.pathwaySpecificData?.isPR}
                onChange={(e) => updateSpecificData('isPR', e.target.checked)}
                className="w-5 h-5 text-primary-600 rounded"
              />
              <span className="text-secondary-700 font-medium">I am currently a Permanent Resident</span>
            </label>
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">
                Years Lived in Canada (last 5 years)
              </label>
              <Input
                type="number"
                min="0"
                max="5"
                step="0.1"
                value={formData.pathwaySpecificData?.yearsInCanada || ''}
                onChange={(e) => updateSpecificData('yearsInCanada', parseFloat(e.target.value) || 0)}
                placeholder="e.g., 3.5"
              />
            </div>
            <label className="flex items-center space-x-3 p-4 border border-secondary-200 rounded-lg cursor-pointer hover:bg-secondary-50 transition-colors">
              <input
                type="checkbox"
                checked={formData.pathwaySpecificData?.filedTaxes}
                onChange={(e) => updateSpecificData('filedTaxes', e.target.checked)}
                className="w-5 h-5 text-primary-600 rounded"
              />
              <span className="text-secondary-700 font-medium">I have filed taxes for at least 3 years</span>
            </label>
          </>
        )}
      </div>
    </div>
  );
}
