import { useState, FormEvent } from 'react';
import { UserCircle, Mail, Phone, ArrowRight } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Card } from '../ui/Card';
import { trackCalculatorStep } from '../../utils/calculatorSession';
import { useTranslation } from '../../i18n/useTranslation';

interface UserInfoStepProps {
  onComplete: (info: { fullName: string; email: string; phone: string }) => void;
}

export function UserInfoStep({ onComplete }: UserInfoStepProps) {
  const { t } = useTranslation();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!fullName.trim()) {
      newErrors.fullName = t('calculator.userInfo.errors.fullNameRequired');
    }

    if (!email.trim()) {
      newErrors.email = t('calculator.userInfo.errors.emailRequired');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = t('common.errors.invalidEmail');
    }

    if (!phone.trim()) {
      newErrors.phone = t('calculator.userInfo.errors.phoneRequired');
    } else if (!/^\+?[\d\s()-]{10,}$/.test(phone)) {
      newErrors.phone = t('common.errors.invalidPhone');
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
            {t('calculator.userInfo.title')}
          </h1>
          <p className="text-xl text-secondary-600 max-w-xl mx-auto">
            {t('calculator.userInfo.subtitle')}
          </p>
        </div>

        <Card className="animate-fade-in">
          <form onSubmit={handleSubmit} className="space-y-6">
            <Input
              id="fullName"
              label={t('calculator.userInfo.fullName')}
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
              label={t('calculator.userInfo.email')}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={errors.email}
              required
              placeholder="john@example.com"
              autoComplete="email"
              helperText={t('calculator.userInfo.emailHelper')}
            />

            <Input
              id="phone"
              type="tel"
              label={t('calculator.userInfo.phone')}
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              error={errors.phone}
              required
              placeholder="+1 (555) 123-4567"
              autoComplete="tel"
              helperText={t('calculator.userInfo.phoneHelper')}
            />

            <div className="pt-4">
              <Button type="submit" size="lg" className="w-full">
                {t('calculator.userInfo.continue')}
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </div>

            <p className="text-sm text-secondary-500 text-center mt-4">
              {t('calculator.userInfo.agreement')}
            </p>
          </form>
        </Card>

        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
          <div className="p-4">
            <div className="text-2xl font-bold text-primary-600 mb-1">5 min</div>
            <div className="text-sm text-secondary-600">{t('calculator.userInfo.quickAssessment')}</div>
          </div>
          <div className="p-4">
            <div className="text-2xl font-bold text-primary-600 mb-1">100%</div>
            <div className="text-sm text-secondary-600">{t('calculator.userInfo.irccAccurate')}</div>
          </div>
          <div className="p-4">
            <div className="text-2xl font-bold text-primary-600 mb-1">{t('common.labels.info')}</div>
            <div className="text-sm text-secondary-600">{t('calculator.userInfo.dataEncrypted')}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
