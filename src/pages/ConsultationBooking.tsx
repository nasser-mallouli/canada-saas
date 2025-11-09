import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Calendar, Clock, CheckCircle, ArrowLeft } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Badge } from '../components/ui/Badge';
import { supabase } from '../lib/supabase';

const CONSULTATION_TYPES = [
  { value: 'general', label: 'General Immigration Inquiry', emoji: '📋' },
  { value: 'study', label: 'Study Visa Consultation', emoji: '🎓' },
  { value: 'work', label: 'Work Permit Consultation', emoji: '💼' },
  { value: 'express-entry', label: 'Express Entry / PR', emoji: '🏠' },
  { value: 'pnp', label: 'Provincial Nominee Program', emoji: '🗺️' },
  { value: 'quebec', label: 'Quebec Immigration', emoji: '🇫🇷' },
  { value: 'citizenship', label: 'Citizenship Application', emoji: '🍁' },
  { value: 'family', label: 'Family Sponsorship', emoji: '👨‍👩‍👧‍👦' }
];

const TIME_SLOTS = [
  '09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM',
  '12:00 PM', '12:30 PM', '01:00 PM', '01:30 PM', '02:00 PM', '02:30 PM',
  '03:00 PM', '03:30 PM', '04:00 PM', '04:30 PM', '05:00 PM'
];

export function ConsultationBooking() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const [formData, setFormData] = useState({
    user_name: '',
    user_email: '',
    user_phone: '',
    consultation_type: '',
    consultation_reason: '',
    preferred_date: '',
    preferred_time: ''
  });

  const updateField = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from('consultation_requests')
        .insert([formData]);

      if (error) throw error;

      setSubmitted(true);
    } catch (error) {
      console.error('Error submitting consultation request:', error);
      alert('Failed to submit request. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getMinDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  const getMaxDate = () => {
    const maxDate = new Date();
    maxDate.setDate(maxDate.getDate() + 60);
    return maxDate.toISOString().split('T')[0];
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-secondary-50 flex items-center justify-center px-4 py-12">
        <Card className="max-w-2xl text-center">
          <div className="w-16 h-16 bg-success-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-success-600" />
          </div>
          <h2 className="text-3xl font-bold text-secondary-900 mb-4">
            Consultation Request Received!
          </h2>
          <p className="text-lg text-secondary-600 mb-6">
            Thank you for booking a consultation with us. We have received your request for:
          </p>
          <div className="bg-secondary-50 rounded-lg p-6 mb-6 text-left">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-secondary-500 mb-1">Consultation Type</p>
                <p className="font-medium text-secondary-900">
                  {CONSULTATION_TYPES.find(t => t.value === formData.consultation_type)?.label}
                </p>
              </div>
              <div>
                <p className="text-sm text-secondary-500 mb-1">Preferred Date & Time</p>
                <p className="font-medium text-secondary-900">
                  {new Date(formData.preferred_date).toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })} at {formData.preferred_time}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-info-50 border border-info-200 rounded-lg p-4 mb-6 text-left">
            <h3 className="font-semibold text-info-900 mb-2">What happens next?</h3>
            <ul className="space-y-2 text-info-800 text-sm">
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-info-600 flex-shrink-0 mt-0.5" />
                <span>Our team will review your request within 24 hours</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-info-600 flex-shrink-0 mt-0.5" />
                <span>You'll receive a confirmation email at {formData.user_email}</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-info-600 flex-shrink-0 mt-0.5" />
                <span>We'll send you a meeting link before your consultation</span>
              </li>
            </ul>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/">
              <Button size="lg">
                Back to Home
              </Button>
            </Link>
            <Link to="/pathway-advisor">
              <Button size="lg" variant="outline">
                Take Free Assessment
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-secondary-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <Link to="/" className="inline-flex items-center text-primary-600 hover:text-primary-700 mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Link>
          <h1 className="text-4xl font-bold text-secondary-900 mb-4">
            Book a Consultation
          </h1>
          <p className="text-lg text-secondary-600">
            Schedule a one-on-one consultation with our certified immigration consultants.
            We'll help you understand your options and create a personalized plan.
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <Card className="mb-6">
            <h2 className="text-2xl font-bold text-secondary-900 mb-6">Contact Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">
                  Full Name <span className="text-error-500">*</span>
                </label>
                <Input
                  value={formData.user_name}
                  onChange={(e) => updateField('user_name', e.target.value)}
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
                  value={formData.user_email}
                  onChange={(e) => updateField('user_email', e.target.value)}
                  placeholder="john@example.com"
                  required
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-secondary-700 mb-2">
                  Phone Number (Optional)
                </label>
                <Input
                  type="tel"
                  value={formData.user_phone}
                  onChange={(e) => updateField('user_phone', e.target.value)}
                  placeholder="+1 (555) 123-4567"
                />
                <p className="text-xs text-secondary-500 mt-1">
                  We may call you to confirm your consultation details
                </p>
              </div>
            </div>
          </Card>

          <Card className="mb-6">
            <h2 className="text-2xl font-bold text-secondary-900 mb-6">Consultation Details</h2>

            <div className="mb-6">
              <label className="block text-sm font-medium text-secondary-700 mb-3">
                What type of consultation do you need? <span className="text-error-500">*</span>
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {CONSULTATION_TYPES.map((type) => (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() => updateField('consultation_type', type.value)}
                    className={`text-left p-4 rounded-lg border-2 transition-all ${
                      formData.consultation_type === type.value
                        ? 'border-primary-600 bg-primary-50'
                        : 'border-secondary-200 hover:border-primary-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{type.emoji}</span>
                      <div className="flex-1">
                        <div className="font-medium text-secondary-900">{type.label}</div>
                      </div>
                      {formData.consultation_type === type.value && (
                        <CheckCircle className="w-5 h-5 text-primary-600 flex-shrink-0" />
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">
                Tell us more about your situation <span className="text-error-500">*</span>
              </label>
              <textarea
                value={formData.consultation_reason}
                onChange={(e) => updateField('consultation_reason', e.target.value)}
                placeholder="Please provide details about your immigration goals, current situation, and any specific questions you'd like to discuss..."
                rows={6}
                className="w-full px-4 py-3 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                required
              />
              <p className="text-xs text-secondary-500 mt-1">
                The more details you provide, the better we can prepare for your consultation
              </p>
            </div>
          </Card>

          <Card className="mb-6">
            <h2 className="text-2xl font-bold text-secondary-900 mb-6">
              <Calendar className="w-6 h-6 inline mr-2" />
              Preferred Date & Time
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">
                  Preferred Date <span className="text-error-500">*</span>
                </label>
                <Input
                  type="date"
                  value={formData.preferred_date}
                  onChange={(e) => updateField('preferred_date', e.target.value)}
                  min={getMinDate()}
                  max={getMaxDate()}
                  required
                />
                <p className="text-xs text-secondary-500 mt-1">
                  Select a date within the next 60 days
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">
                  Preferred Time <span className="text-error-500">*</span>
                </label>
                <select
                  value={formData.preferred_time}
                  onChange={(e) => updateField('preferred_time', e.target.value)}
                  className="w-full px-4 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  required
                >
                  <option value="">Select a time</option>
                  {TIME_SLOTS.map((time) => (
                    <option key={time} value={time}>
                      {time}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-secondary-500 mt-1">
                  Times are in EST/EDT timezone
                </p>
              </div>
            </div>

            <div className="mt-6 p-4 bg-warning-50 border border-warning-200 rounded-lg">
              <p className="text-sm text-warning-800">
                <strong>Note:</strong> This is a request for your preferred time. We'll confirm availability and send you a meeting link via email.
              </p>
            </div>
          </Card>

          <Card className="bg-gradient-to-br from-primary-50 to-secondary-50 border-primary-200">
            <h3 className="text-xl font-bold text-secondary-900 mb-4">
              What's Included in Your Consultation
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-primary-600 flex-shrink-0 mt-0.5" />
                <div>
                  <strong className="text-secondary-900">45-minute one-on-one session</strong>
                  <p className="text-sm text-secondary-600">With a certified immigration consultant</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-primary-600 flex-shrink-0 mt-0.5" />
                <div>
                  <strong className="text-secondary-900">Personalized assessment</strong>
                  <p className="text-sm text-secondary-600">Review of your eligibility and options</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-primary-600 flex-shrink-0 mt-0.5" />
                <div>
                  <strong className="text-secondary-900">Action plan</strong>
                  <p className="text-sm text-secondary-600">Next steps and timeline for your case</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-primary-600 flex-shrink-0 mt-0.5" />
                <div>
                  <strong className="text-secondary-900">Q&A session</strong>
                  <p className="text-sm text-secondary-600">Get all your questions answered</p>
                </div>
              </div>
            </div>
          </Card>

          <div className="flex flex-col sm:flex-row gap-4 justify-between mt-8">
            <Link to="/">
              <Button type="button" variant="outline" size="lg">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Cancel
              </Button>
            </Link>
            <Button
              type="submit"
              size="lg"
              disabled={
                isSubmitting ||
                !formData.user_name ||
                !formData.user_email ||
                !formData.consultation_type ||
                !formData.consultation_reason ||
                !formData.preferred_date ||
                !formData.preferred_time
              }
            >
              {isSubmitting ? 'Submitting...' : 'Request Consultation'}
              <Clock className="w-5 h-5 ml-2" />
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
