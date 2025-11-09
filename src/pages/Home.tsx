import { Link } from 'react-router-dom';
import { Calculator, MapPin, Users, CheckCircle, TrendingUp, Shield, Clock, Star } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';

export function Home() {
  return (
    <div className="min-h-screen">
      <section className="relative bg-gradient-to-br from-primary-50 via-white to-secondary-50 pt-20 pb-32 overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center animate-slide-up">
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-secondary-900 mb-6">
              Calculate Your Canada
              <span className="block text-primary-600 mt-2">CRS Score in 5 Minutes</span>
            </h1>
            <p className="text-xl md:text-2xl text-secondary-600 mb-8 max-w-3xl mx-auto">
              Get your free AI-powered personalized roadmap and professional guidance for your Canadian immigration journey
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link to="/calculator">
                <Button size="lg" className="w-full sm:w-auto">
                  <Calculator className="w-5 h-5 mr-2" />
                  Calculate CRS Score Now
                </Button>
              </Link>
              <Link to="/pathways">
                <Button size="lg" variant="outline" className="w-full sm:w-auto">
                  <MapPin className="w-5 h-5 mr-2" />
                  Explore Immigration Pathways
                </Button>
              </Link>
            </div>
            <div className="mt-8 flex flex-wrap justify-center gap-6 text-sm text-secondary-600">
              <div className="flex items-center">
                <CheckCircle className="w-5 h-5 mr-2 text-success-500" />
                <span>IRCC Accurate</span>
              </div>
              <div className="flex items-center">
                <Shield className="w-5 h-5 mr-2 text-primary-500" />
                <span>100% Private & Secure</span>
              </div>
              <div className="flex items-center">
                <Clock className="w-5 h-5 mr-2 text-accent-500" />
                <span>5-Minute Assessment</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-secondary-900 mb-4">How It Works</h2>
            <p className="text-xl text-secondary-600 max-w-2xl mx-auto">
              Four simple steps to start your Canadian immigration journey
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              {
                number: '01',
                title: 'Calculate Your Score',
                description: 'Complete our accurate CRS calculator in just 5 minutes',
                icon: Calculator,
              },
              {
                number: '02',
                title: 'Get AI-Powered Roadmap',
                description: 'Receive a personalized improvement plan tailored to your profile',
                icon: TrendingUp,
              },
              {
                number: '03',
                title: 'Access Your Dashboard',
                description: 'Track your progress and manage all your immigration documents',
                icon: Users,
              },
              {
                number: '04',
                title: 'Book Expert Guidance',
                description: 'Get professional consultation whenever you need help',
                icon: Star,
              },
            ].map((step, index) => (
              <div key={index} className="relative">
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary-100 text-primary-600 mb-4">
                    <step.icon className="w-8 h-8" />
                  </div>
                  <div className="text-4xl font-bold text-primary-200 mb-2">{step.number}</div>
                  <h3 className="text-xl font-semibold text-secondary-900 mb-2">{step.title}</h3>
                  <p className="text-secondary-600">{step.description}</p>
                </div>
                {index < 3 && (
                  <div className="hidden md:block absolute top-8 left-full w-full h-0.5 bg-primary-200 transform -translate-y-1/2" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-secondary-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-secondary-900 mb-4">Our Professional Services</h2>
            <p className="text-xl text-secondary-600 max-w-2xl mx-auto">
              Comprehensive support from planning to settlement in Canada
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card hover className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary-100 text-primary-600 mb-4">
                <Users className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-semibold text-secondary-900 mb-2">Information & Guidance Session</h3>
              <p className="text-secondary-600 mb-6">
                Expert pre-arrival consultation covering job search, CV writing, avoiding scams, and essential preparation steps
              </p>
              <ul className="text-left space-y-2 mb-6">
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 mr-2 text-success-500 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-secondary-700">Practical job search strategies</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 mr-2 text-success-500 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-secondary-700">Canadian-style CV assistance</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 mr-2 text-success-500 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-secondary-700">Province & city selection guidance</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 mr-2 text-success-500 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-secondary-700">On-demand Q&A</span>
                </li>
              </ul>
              <Link to="/information-session">
                <Button className="w-full">Book Guidance Session</Button>
              </Link>
            </Card>

            <Card hover className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-success-100 text-success-600 mb-4">
                <MapPin className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-semibold text-secondary-900 mb-2">Settlement Support Services</h3>
              <p className="text-secondary-600 mb-6">
                Step-by-step assistance after arrival including housing, airport pickup, and essential services setup
              </p>
              <ul className="text-left space-y-2 mb-6">
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 mr-2 text-success-500 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-secondary-700">Airport pickup & transportation</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 mr-2 text-success-500 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-secondary-700">Housing search assistance</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 mr-2 text-success-500 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-secondary-700">Bank, SIM, transit card setup</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 mr-2 text-success-500 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-secondary-700">SIN & health card registration</span>
                </li>
              </ul>
              <Link to="/settlement-support">
                <Button className="w-full">Explore Services</Button>
              </Link>
            </Card>

            <Card hover className="text-center relative">
              <Badge variant="coming-soon" className="absolute top-4 right-4">
                Coming Soon
              </Badge>
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-accent-100 text-accent-600 mb-4">
                <MapPin className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-semibold text-secondary-900 mb-2">Marketplace Services</h3>
              <p className="text-secondary-600 mb-6">
                Housing marketplace, verified service providers, and exclusive newcomer benefits
              </p>
              <ul className="text-left space-y-2 mb-6">
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 mr-2 text-accent-500 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-secondary-700">Verified housing listings</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 mr-2 text-accent-500 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-secondary-700">Professional service providers</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 mr-2 text-accent-500 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-secondary-700">Community access & networking</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 mr-2 text-accent-500 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-secondary-700">Exclusive newcomer deals</span>
                </li>
              </ul>
              <Link to="/services">
                <Button variant="secondary" className="w-full">Join Waitlist</Button>
              </Link>
            </Card>
          </div>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-secondary-900 mb-4">Why Choose Us</h2>
            <p className="text-xl text-secondary-600 max-w-2xl mx-auto">
              Professional, accurate, and trusted by thousands of newcomers
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: 'IRCC Accurate',
                description: 'Our CRS calculator follows the exact official IRCC 2025 scoring rules for complete accuracy',
                icon: CheckCircle,
              },
              {
                title: 'AI-Powered Insights',
                description: 'Get personalized roadmaps generated by advanced AI tailored to your unique situation',
                icon: TrendingUp,
              },
              {
                title: 'Data Privacy',
                description: 'Your information is encrypted and secure. We never share your data with third parties',
                icon: Shield,
              },
            ].map((feature, index) => (
              <div key={index} className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary-100 text-primary-600 mb-4">
                  <feature.icon className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-semibold text-secondary-900 mb-2">{feature.title}</h3>
                <p className="text-secondary-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-primary-600 text-white">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold mb-4">Ready to Start Your Journey?</h2>
          <p className="text-xl text-primary-100 mb-8">
            Calculate your CRS score now and get your personalized roadmap in minutes
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/calculator">
              <Button size="lg" variant="secondary" className="w-full sm:w-auto">
                Calculate CRS Score
              </Button>
            </Link>
            <Link to="/consultation">
              <Button size="lg" variant="outline" className="w-full sm:w-auto border-white text-white hover:bg-white hover:text-primary-600">
                Book Consultation
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
