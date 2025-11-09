import { Link } from 'react-router-dom';
import { Target, Users, Award, TrendingUp, Heart, Globe, CheckCircle, Shield } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';

export function AboutUs() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-50 via-white to-secondary-50 pt-20 pb-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-5xl md:text-6xl font-bold text-secondary-900 mb-6">
              About Us
            </h1>
            <p className="text-xl text-secondary-600 mb-8">
              Empowering candidates worldwide to achieve their Canadian immigration dreams through 
              accurate tools, expert guidance, and comprehensive support.
            </p>
          </div>
        </div>
      </section>

      {/* Our Story */}
      <section className="py-20 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-4xl font-bold text-secondary-900 mb-6 text-center">Our Story</h2>
            <div className="prose prose-lg max-w-none text-secondary-700 space-y-6">
              <p>
                Canada Immigration Services was founded with a simple yet powerful mission: to make 
                Canadian immigration accessible, transparent, and achievable for candidates around the world. 
                We recognized that the immigration process can be overwhelming, with complex requirements, 
                ever-changing regulations, and a lack of clear, accurate information.
              </p>
              <p>
                Our journey began when our founders, themselves immigrants to Canada, experienced firsthand 
                the challenges and confusion that come with navigating the Canadian immigration system. They 
                saw too many qualified candidates struggling to understand their options, calculate their CRS 
                scores accurately, or identify the best pathway for their unique situation.
              </p>
              <p>
                Today, we've built a comprehensive platform that combines cutting-edge technology with 
                human expertise. Our IRCC-accurate CRS calculator, AI-powered pathway advisor, and expert 
                consultation services have helped thousands of candidates take confident steps toward their 
                Canadian dreams.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-20 bg-secondary-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <Card>
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary-100 text-primary-600 mb-6">
                <Target className="w-8 h-8" />
              </div>
              <h2 className="text-3xl font-bold text-secondary-900 mb-4">Our Mission</h2>
              <p className="text-secondary-700 text-lg leading-relaxed mb-4">
                To provide accurate, accessible, and comprehensive immigration tools and services that 
                empower candidates to make informed decisions about their Canadian immigration journey.
              </p>
              <p className="text-secondary-600">
                We believe every qualified candidate deserves the opportunity to build a better future 
                in Canada, and we're committed to making that journey as smooth and transparent as possible.
              </p>
            </Card>

            <Card>
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-success-100 text-success-600 mb-6">
                <Globe className="w-8 h-8" />
              </div>
              <h2 className="text-3xl font-bold text-secondary-900 mb-4">Our Vision</h2>
              <p className="text-secondary-700 text-lg leading-relaxed mb-4">
                To become the most trusted and comprehensive platform for Canadian immigration, helping 
                millions of candidates navigate their journey from initial assessment to successful 
                settlement in Canada.
              </p>
              <p className="text-secondary-600">
                We envision a world where immigration is transparent, accessible, and achievable for all, 
                regardless of where they start their journey.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Our Values */}
      <section className="py-20 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-secondary-900 mb-4">Our Core Values</h2>
            <p className="text-xl text-secondary-600 max-w-2xl mx-auto">
              The principles that guide everything we do
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: Shield,
                title: 'Accuracy',
                description: 'We maintain the highest standards of accuracy, ensuring our tools align with official IRCC guidelines.'
              },
              {
                icon: Users,
                title: 'Candidate-First',
                description: 'Every feature and service is designed with candidates in mind. Your success is our success.'
              },
              {
                icon: Heart,
                title: 'Empathy',
                description: 'We understand the challenges of immigration and provide compassionate, personalized support.'
              },
              {
                icon: TrendingUp,
                title: 'Innovation',
                description: 'We leverage cutting-edge AI technology to provide personalized roadmaps and recommendations.'
              },
              {
                icon: Award,
                title: 'Excellence',
                description: 'We strive for excellence in every interaction, from calculations to consultations.'
              },
              {
                icon: CheckCircle,
                title: 'Transparency',
                description: 'Clear pricing, honest assessments, and transparent processes. No hidden fees or false promises.'
              },
              {
                icon: Globe,
                title: 'Accessibility',
                description: 'We believe immigration guidance should be accessible to all, regardless of background or location.'
              },
              {
                icon: Target,
                title: 'Results-Driven',
                description: 'We measure our success by the success of our candidates in achieving their Canadian immigration goals.'
              }
            ].map((value, index) => (
              <Card key={index} hover>
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary-100 text-primary-600 mb-4">
                  <value.icon className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-semibold text-secondary-900 mb-3">{value.title}</h3>
                <p className="text-secondary-600 text-sm">{value.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* What We Offer */}
      <section className="py-20 bg-secondary-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-secondary-900 mb-4">What We Offer</h2>
            <p className="text-xl text-secondary-600 max-w-2xl mx-auto">
              Comprehensive services to support your entire Canadian immigration journey
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: 'Accurate CRS Calculator',
                description: 'IRCC-compliant calculator that helps you understand your current score and identify improvement opportunities.',
                link: '/calculator'
              },
              {
                title: 'Immigration Pathways',
                description: 'Comprehensive information about all Canadian immigration pathways, from Express Entry to PNP programs.',
                link: '/pathways'
              },
              {
                title: 'Pathway Advisor',
                description: 'AI-powered assessment tool that recommends the best immigration pathway based on your unique profile.',
                link: '/pathway-advisor'
              },
              {
                title: 'Expert Consultations',
                description: 'One-on-one consultations with experienced immigration professionals to guide your journey.',
                link: '/consultation'
              },
              {
                title: 'Information Sessions',
                description: 'Pre-arrival guidance covering job search, CV writing, province selection, and avoiding scams.',
                link: '/information-session'
              },
              {
                title: 'Settlement Support',
                description: 'Post-arrival assistance including airport pickup, housing search, and essential services setup.',
                link: '/settlement-support'
              }
            ].map((service, index) => (
              <Card key={index} hover>
                <h3 className="text-xl font-semibold text-secondary-900 mb-3">{service.title}</h3>
                <p className="text-secondary-600 mb-4">{service.description}</p>
                <Link to={service.link}>
                  <Button variant="outline" className="w-full">Learn More</Button>
                </Link>
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

          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {[
                'IRCC-accurate tools built to match official guidelines',
                'AI-powered personalization for tailored recommendations',
                'End-to-end support from assessment to settlement',
                'Transparent pricing with no hidden fees',
                'Expert team of licensed immigration consultants',
                'Privacy-first approach with encrypted data',
                'Comprehensive resources and educational content',
                'Proven track record of helping thousands of candidates'
              ].map((point, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <CheckCircle className="w-6 h-6 text-success-500 flex-shrink-0 mt-0.5" />
                  <p className="text-lg text-secondary-700">{point}</p>
                </div>
              ))}
            </div>
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
                Contact Us
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

