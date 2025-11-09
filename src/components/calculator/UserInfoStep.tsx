import { useState, FormEvent } from 'react';
import { UserCircle, Mail, Phone, ArrowRight } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Card } from '../ui/Card';
import { trackCalculatorStep } from '../../utils/calculatorSession';

interface UserInfoStepProps {
  onComplete: (info: { fullName: string; email: string; phone: string }) => void;
}

export function UserInfoStep({ onComplete }: UserInfoStepProps) {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    }

    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^\+?[\d\s()-]{10,}$/.test(phone)) {
      newErrors.phone = 'Please enter a valid phone number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      // Track user info step completion
      await trackCalculatorStep(
        'user-info',
        ['user-info'],
        { fullName, email, phone },
        { fullName, email, phone }
      );
      onComplete({ fullName, email, phone });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="max-w-2xl w-full">
        <div className="text-center mb-8 animate-slide-up">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary-100 text-primary-600 mb-4">
            <UserCircle className="w-8 h-8" />
          </div>
          <h1 className="text-4xl font-bold text-secondary-900 mb-4">
            Let's Calculate Your CRS Score
          </h1>
          <p className="text-xl text-secondary-600 max-w-xl mx-auto">
            First, we need a few details to get started. Your information is secure and will only be used to provide you with your results.
          </p>
        </div>

        <Card className="animate-fade-in">
          <form onSubmit={handleSubmit} className="space-y-6">
            <Input
              id="fullName"
              label="Full Name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              error={errors.fullName}
              required
              placeholder="John Doe"
              autoComplete="name"
            />

            <Input
              id="email"
              type="email"
              label="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={errors.email}
              required
              placeholder="john@example.com"
              autoComplete="email"
              helperText="We'll send your results to this email"
            />

            <Input
              id="phone"
              type="tel"
              label="Phone Number"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              error={errors.phone}
              required
              placeholder="+1 (555) 123-4567"
              autoComplete="tel"
              helperText="Include country code if outside Canada"
            />

            <div className="pt-4">
              <Button type="submit" size="lg" className="w-full">
                Continue to Calculator
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </div>

            <p className="text-sm text-secondary-500 text-center mt-4">
              By continuing, you agree to our Terms of Service and Privacy Policy. Your information is encrypted and secure.
            </p>
          </form>
        </Card>

        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
          <div className="p-4">
            <div className="text-2xl font-bold text-primary-600 mb-1">5 min</div>
            <div className="text-sm text-secondary-600">Quick assessment</div>
          </div>
          <div className="p-4">
            <div className="text-2xl font-bold text-primary-600 mb-1">100%</div>
            <div className="text-sm text-secondary-600">IRCC accurate</div>
          </div>
          <div className="p-4">
            <div className="text-2xl font-bold text-primary-600 mb-1">Secure</div>
            <div className="text-sm text-secondary-600">Data encrypted</div>
          </div>
        </div>
      </div>
    </div>
  );
}
