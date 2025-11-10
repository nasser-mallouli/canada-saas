import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { Button } from '../ui/Button';
import { LanguageSwitcher } from '../ui/LanguageSwitcher';
import { useTranslation } from '../../i18n/useTranslation';

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { t } = useTranslation();

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-secondary-200 shadow-sm">
      <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8" aria-label="Main navigation">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">C</span>
              </div>
              <span className="text-xl font-bold text-secondary-900">{t('navigation.brandName')}</span>
            </Link>
          </div>

          <div className="hidden md:flex md:items-center md:space-x-8">
            <Link to="/pathways" className="text-secondary-700 hover:text-primary-600 transition-colors">
              {t('navigation.pathways')}
            </Link>
            <Link to="/calculator" className="text-secondary-700 hover:text-primary-600 transition-colors">
              {t('navigation.calculator')}
            </Link>
            <Link to="/services" className="text-secondary-700 hover:text-primary-600 transition-colors">
              {t('navigation.services')}
            </Link>
            <Link to="/pathway-advisor">
              <Button size="sm">{t('navigation.freeAssessment')}</Button>
            </Link>
            <LanguageSwitcher />
          </div>

          <button
            className="md:hidden p-2 rounded-lg text-secondary-700 hover:bg-secondary-100"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle mobile menu"
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden py-4 space-y-4 animate-slide-down">
            <Link
              to="/pathways"
              className="block px-4 py-2 text-secondary-700 hover:bg-secondary-100 rounded-lg"
              onClick={() => setMobileMenuOpen(false)}
            >
              {t('navigation.pathways')}
            </Link>
            <Link
              to="/calculator"
              className="block px-4 py-2 text-secondary-700 hover:bg-secondary-100 rounded-lg"
              onClick={() => setMobileMenuOpen(false)}
            >
              {t('navigation.calculator')}
            </Link>
            <Link
              to="/services"
              className="block px-4 py-2 text-secondary-700 hover:bg-secondary-100 rounded-lg"
              onClick={() => setMobileMenuOpen(false)}
            >
              {t('navigation.services')}
            </Link>

            <Link to="/pathway-advisor" onClick={() => setMobileMenuOpen(false)}>
              <Button className="w-full">{t('navigation.freeAssessment')}</Button>
            </Link>
            <div className="px-4">
              <LanguageSwitcher />
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
