import { Link } from 'react-router-dom';
import { Target, Users, Award, Heart, TrendingUp, Shield, Globe, CheckCircle } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';

export function Company() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-50 via-white to-secondary-50 pt-20 pb-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-5xl md:text-6xl font-bold text-secondary-900 mb-6">
              Your Trusted Partner in
              <span className="block text-primary-600 mt-2">Canadian Immigration</span>
            </h1>
            <p className="text-xl text-secondary-600 mb-8">
              We empower candidates worldwide to achieve their Canadian immigration dreams through accurate tools, 
              expert guidance, and comprehensive support services.
            </p>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-20 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-16">
            <Card>
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary-100 text-primary-600 mb-6">
                <Target className="w-8 h-8" />
              </div>
              <h2 className="text-3xl font-bold text-secondary-900 mb-4">Our Mission</h2>
              <p className="text-secondary-700 text-lg leading-relaxed">
                To provide accurate, accessible, and comprehensive immigration tools and services that empower 
                candidates to make informed decisions about their Canadian immigration journey. We believe every 
                qualified candidate deserves the opportunity to build a better future in Canada.
              </p>
            </Card>

            <Card>
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-success-100 text-success-600 mb-6">
                <Globe className="w-8 h-8" />
              </div>
              <h2 className="text-3xl font-bold text-secondary-900 mb-4">Our Vision</h2>
              <p className="text-secondary-700 text-lg leading-relaxed">
                To become the most trusted and comprehensive platform for Canadian immigration, helping millions 
                of candidates navigate their journey from initial assessment to successful settlement in Canada. 
                We envision a world where immigration is transparent, accessible, and achievable for all.
              </p>
            </Card>
          </div>

          {/* Values */}
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-secondary-900 mb-4">Our Core Values</h2>
            <p className="text-xl text-secondary-600 max-w-2xl mx-auto">
              The principles that guide everything we do
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: Shield,
                title: 'Accuracy & Trust',
                description: 'We maintain the highest standards of accuracy, ensuring our CRS calculator and tools align with official IRCC guidelines. Trust is earned through precision.',
                color: 'primary'
              },
              {
                icon: Users,
                title: 'Candidate-First',
                description: 'Every feature and service is designed with candidates in mind. Your success is our success, and we\'re committed to your journey every step of the way.',
                color: 'success'
              },
              {
                icon: Heart,
                title: 'Empathy & Support',
                description: 'We understand the challenges of immigration. Our team provides compassionate, personalized support to help you navigate this life-changing process.',
                color: 'accent'
              },
              {
                icon: TrendingUp,
                title: 'Innovation',
                description: 'We leverage cutting-edge AI technology and data insights to provide personalized roadmaps and recommendations that adapt to your unique situation.',
                color: 'primary'
              },
              {
                icon: Award,
                title: 'Excellence',
                description: 'We strive for excellence in every interaction, from our accurate calculations to our professional consultations and comprehensive support services.',
                color: 'success'
              },
              {
                icon: CheckCircle,
                title: 'Transparency',
                description: 'Clear pricing, honest assessments, and transparent processes. No hidden fees, no false promises—just straightforward, reliable guidance.',
                color: 'accent'
              }
            ].map((value, index) => {
              const colorClasses = {
                primary: 'bg-primary-100 text-primary-600',
                success: 'bg-success-100 text-success-600',
                accent: 'bg-accent-100 text-accent-600'
              };
              const colorClass = colorClasses[value.color as keyof typeof colorClasses] || colorClasses.primary;
              
              return (
                <Card key={index} hover>
                  <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full ${colorClass} mb-4`}>
                    <value.icon className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-semibold text-secondary-900 mb-3">{value.title}</h3>
                  <p className="text-secondary-600">{value.description}</p>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* What We Do */}
      <section className="py-20 bg-secondary-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-secondary-900 mb-4">What We Do</h2>
            <p className="text-xl text-secondary-600 max-w-2xl mx-auto">
              Comprehensive services to support your entire Canadian immigration journey
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                title: 'CRS Score Calculator',
                description: 'Accurate, IRCC-compliant CRS calculator that helps you understand your current score and identify improvement opportunities.',
                features: ['IRCC 2025 compliant', 'Real-time calculations', 'AI-powered insights']
              },
              {
                title: 'Immigration Pathways',
                description: 'Comprehensive information about all Canadian immigration pathways, from Express Entry to Provincial Nominee Programs.',
                features: ['All pathways covered', 'Detailed requirements', 'Timeline estimates']
              },
              {
                title: 'Pathway Advisor',
                description: 'AI-powered assessment tool that recommends the best immigration pathway based on your unique profile and goals.',
                features: ['Personalized recommendations', 'Eligibility analysis', 'Actionable roadmap']
              },
              {
                title: 'Expert Consultations',
                description: 'One-on-one consultations with experienced immigration professionals to answer your questions and guide your journey.',
                features: ['Licensed consultants', 'Personalized advice', 'Document review']
              },
              {
                title: 'Information Sessions',
                description: 'Pre-arrival guidance covering job search strategies, CV writing, province selection, and avoiding common scams.',
                features: ['Job search strategies', 'CV optimization', 'Province guidance']
              },
              {
                title: 'Settlement Support',
                description: 'Post-arrival assistance including airport pickup, housing search, essential services setup, and ongoing support.',
                features: ['Airport pickup', 'Housing assistance', 'Service setup']
              }
            ].map((service, index) => (
              <Card key={index} hover>
                <h3 className="text-xl font-semibold text-secondary-900 mb-3">{service.title}</h3>
                <p className="text-secondary-600 mb-4">{service.description}</p>
                <ul className="space-y-2">
                  {service.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start text-sm text-secondary-700">
                      <CheckCircle className="w-4 h-4 mr-2 text-success-500 flex-shrink-0 mt-0.5" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-20 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-secondary-900 mb-4">Why Choose Us</h2>
            <p className="text-xl text-secondary-600 max-w-2xl mx-auto">
              What sets us apart in the Canadian immigration services landscape
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {[
              {
                title: 'IRCC-Accurate Tools',
                description: 'Our CRS calculator and assessment tools are built to match official IRCC guidelines exactly, ensuring you get accurate, reliable results.'
              },
              {
                title: 'AI-Powered Personalization',
                description: 'Advanced AI technology analyzes your profile to provide personalized roadmaps and recommendations tailored to your unique situation.'
              },
              {
                title: 'End-to-End Support',
                description: 'From initial CRS calculation to post-arrival settlement, we provide comprehensive support throughout your entire immigration journey.'
              },
              {
                title: 'Transparent & Honest',
                description: 'No hidden fees, no false promises. We provide honest assessments and clear, transparent pricing for all our services.'
              },
              {
                title: 'Expert Team',
                description: 'Our team includes licensed immigration consultants and experienced professionals who understand the Canadian immigration system inside and out.'
              },
              {
                title: 'Privacy & Security',
                description: 'Your data is encrypted and secure. We never share your personal information with third parties without your explicit consent.'
              }
            ].map((point, index) => (
              <div key={index} className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-primary-600" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-secondary-900 mb-2">{point.title}</h3>
                  <p className="text-secondary-600">{point.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary-600 text-white">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold mb-4">Ready to Start Your Journey?</h2>
          <p className="text-xl text-primary-100 mb-8">
            Join thousands of candidates who trust us for their Canadian immigration journey
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/calculator">
              <Button size="lg" variant="secondary" className="w-full sm:w-auto">
                Calculate Your CRS Score
              </Button>
            </Link>
            <Link to="/contact">
              <Button size="lg" variant="outline" className="w-full sm:w-auto border-white text-white hover:bg-white hover:text-primary-600">
                Get in Touch
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

