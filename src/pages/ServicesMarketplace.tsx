import { Link } from 'react-router-dom';
import {
  Home,
  Briefcase,
  GraduationCap,
  FileText,
  Car,
  Phone,
  CreditCard,
  Heart,
  Users,
  Shield,
  Star,
  CheckCircle,
  ArrowRight,
  Search,
  MapPin,
  Wrench,
  ShoppingBag,
  Plane,
  DollarSign
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';

interface Service {
  id: string;
  title: string;
  icon: React.ElementType;
  description: string;
  category: string;
  features: string[];
  badge?: string;
}

const services: Service[] = [
  {
    id: 'housing',
    title: 'Verified Housing Listings',
    icon: Home,
    category: 'Housing & Accommodation',
    description: 'Browse verified rental listings with transparent pricing. Connect with trusted landlords and property managers.',
    features: [
      'Verified landlords and properties',
      'Virtual tours and detailed photos',
      'Transparent pricing and lease terms',
      'Newcomer-friendly landlords',
      'Move-in ready apartments',
      'Neighborhood guides and transit access'
    ],
    badge: 'Most Popular'
  },
  {
    id: 'housing-search',
    title: 'Housing Search Assistance',
    icon: Search,
    category: 'Housing & Accommodation',
    description: 'Professional assistance finding the perfect home. Our verified agents help you navigate the rental market.',
    features: [
      'Personalized property search',
      'Schedule viewings and inspections',
      'Lease review and negotiation',
      'Tenant rights education',
      'First-month support',
      'Read agent reviews and ratings'
    ]
  },
  {
    id: 'airport-pickup',
    title: 'Airport Pickup & Transportation',
    icon: Plane,
    category: 'Arrival Support',
    description: 'Safe, reliable airport pickup by verified drivers. Start your Canadian journey stress-free.',
    features: [
      'Verified drivers with background checks',
      'Real-time flight tracking',
      'Meet and greet service',
      'Help with luggage',
      'Direct to accommodation',
      'Fixed transparent pricing'
    ]
  },
  {
    id: 'settlement-coordinator',
    title: 'Settlement Coordinators',
    icon: Users,
    category: 'Arrival Support',
    description: 'Personal settlement coordinators guide you through your first weeks in Canada.',
    features: [
      'Dedicated coordinator assignment',
      'Essential services setup (SIN, health card)',
      'Bank account opening assistance',
      'Mobile phone and transit setup',
      'Orientation tours',
      'Ongoing support for 30 days'
    ],
    badge: 'Premium'
  },
  {
    id: 'job-search',
    title: 'Job Search Assistance',
    icon: Briefcase,
    category: 'Employment Services',
    description: 'Connect with verified career coaches and recruitment specialists who understand the Canadian job market.',
    features: [
      'Canadian resume writing',
      'LinkedIn profile optimization',
      'Interview preparation',
      'Job market insights',
      'Networking guidance',
      'Industry-specific advice'
    ]
  },
  {
    id: 'credential-assessment',
    title: 'Credential Evaluation Services',
    icon: GraduationCap,
    category: 'Employment Services',
    description: 'Fast-track your credential assessment with verified evaluation service providers.',
    features: [
      'WES, IQAS, ICAS providers',
      'Document preparation assistance',
      'Translation services',
      'Expedited processing options',
      'Status tracking',
      'Consultation included'
    ]
  },
  {
    id: 'cv-writing',
    title: 'Professional CV Writing',
    icon: FileText,
    category: 'Employment Services',
    description: 'Verified Canadian resume writers who specialize in newcomer success stories.',
    features: [
      'ATS-optimized resumes',
      'Cover letter writing',
      'Industry-specific formatting',
      'Multiple revisions',
      'LinkedIn profile included',
      'Job application strategy'
    ]
  },
  {
    id: 'driving-lessons',
    title: 'Driving Lessons & License Support',
    icon: Car,
    category: 'Licensing & Training',
    description: 'Verified driving instructors who help newcomers get their Canadian driver\'s license.',
    features: [
      'G2/G road test preparation',
      'Defensive driving training',
      'Flexible scheduling',
      'Pickup and drop-off',
      'Written test study materials',
      'License exchange guidance'
    ]
  },
  {
    id: 'mobile-plans',
    title: 'Mobile Phone Plans',
    icon: Phone,
    category: 'Essential Services',
    description: 'Compare and sign up for the best mobile plans. Exclusive newcomer deals.',
    features: [
      'No credit check options',
      'Prepaid and postpaid plans',
      'Exclusive newcomer discounts',
      'SIM delivery or pickup',
      'Number porting assistance',
      'Data-only and family plans'
    ]
  },
  {
    id: 'banking',
    title: 'Banking & Credit Services',
    icon: CreditCard,
    category: 'Financial Services',
    description: 'Connect with verified financial advisors who specialize in newcomer banking needs.',
    features: [
      'Account opening assistance',
      'Credit card recommendations',
      'Credit building strategies',
      'Mortgage pre-qualification',
      'Investment guidance',
      'Tax planning basics'
    ]
  },
  {
    id: 'health-insurance',
    title: 'Private Health Insurance',
    icon: Heart,
    category: 'Health & Wellness',
    description: 'Find the right health coverage for your waiting period. Verified insurance providers.',
    features: [
      'Waiting period coverage',
      'Family plans available',
      'Emergency medical coverage',
      'Prescription drug coverage',
      'Dental and vision options',
      'Instant quotes and comparison'
    ]
  },
  {
    id: 'legal-services',
    title: 'Legal & Immigration Consulting',
    icon: Shield,
    category: 'Professional Services',
    description: 'Verified immigration consultants and lawyers (RCIC, lawyers) for complex cases.',
    features: [
      'Licensed RCIC consultants',
      'Immigration lawyers',
      'PR application support',
      'Family sponsorship',
      'Work permit extensions',
      'Appeals and reviews'
    ]
  },
  {
    id: 'furniture',
    title: 'Furniture & Home Essentials',
    icon: ShoppingBag,
    category: 'Home Setup',
    description: 'Trusted vendors offering furniture, appliances, and home essentials with newcomer discounts.',
    features: [
      'Newcomer discount packages',
      'Delivery and assembly',
      'Rent-to-own options',
      'Quality used furniture',
      'Essential starter kits',
      'Flexible payment plans'
    ]
  },
  {
    id: 'home-services',
    title: 'Home Maintenance & Repair',
    icon: Wrench,
    category: 'Home Setup',
    description: 'Find verified handymen, electricians, plumbers, and contractors for your home needs.',
    features: [
      'Background-checked professionals',
      'Transparent pricing',
      'Emergency services available',
      'Warranty on work',
      'Before/after photos',
      'Customer reviews and ratings'
    ]
  },
  {
    id: 'language-classes',
    title: 'Language & Skills Training',
    icon: GraduationCap,
    category: 'Education & Training',
    description: 'Connect with verified language schools and skills training providers.',
    features: [
      'IELTS/CELPIP preparation',
      'French courses (TEF/TCF)',
      'ESL conversation classes',
      'Professional development',
      'Online and in-person options',
      'Government-funded programs'
    ]
  },
  {
    id: 'community',
    title: 'Community & Networking',
    icon: Users,
    category: 'Social & Community',
    description: 'Join verified community groups, cultural associations, and networking events.',
    features: [
      'Cultural community groups',
      'Professional networking events',
      'Newcomer meetups',
      'Sports and recreation clubs',
      'Language exchange partners',
      'Family-friendly activities'
    ]
  }
];

const categories = [
  'All Services',
  'Housing & Accommodation',
  'Arrival Support',
  'Employment Services',
  'Licensing & Training',
  'Essential Services',
  'Financial Services',
  'Health & Wellness',
  'Professional Services',
  'Home Setup',
  'Education & Training',
  'Social & Community'
];

export function ServicesMarketplace() {
  return (
    <div className="min-h-screen">
      <section className="bg-gradient-to-br from-primary-600 to-primary-800 text-white py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <Badge variant="warning" className="mb-4 text-sm px-4 py-2">
              Coming Soon - Preview
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Services Marketplace
            </h1>
            <p className="text-xl text-primary-100 mb-8 max-w-3xl mx-auto">
              Your one-stop platform for verified service providers. Connect with trusted professionals,
              read reviews, compare prices, and book services all in one place.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-center">
              <Shield className="w-12 h-12 mx-auto mb-4 text-primary-200" />
              <h3 className="font-semibold text-lg mb-2">100% Verified Providers</h3>
              <p className="text-primary-100 text-sm">
                All service providers are background-checked and verified for your safety
              </p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-center">
              <Star className="w-12 h-12 mx-auto mb-4 text-primary-200" />
              <h3 className="font-semibold text-lg mb-2">Real Reviews & Ratings</h3>
              <p className="text-primary-100 text-sm">
                Read honest reviews from fellow newcomers who used the services
              </p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-center">
              <DollarSign className="w-12 h-12 mx-auto mb-4 text-primary-200" />
              <h3 className="font-semibold text-lg mb-2">Transparent Pricing</h3>
              <p className="text-primary-100 text-sm">
                Compare prices, packages, and find the best deal for your needs
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-12 px-4 bg-blue-50 border-b border-blue-200">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-start gap-4">
            <CheckCircle className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-semibold text-blue-900 mb-2">
                How Our Verified Provider System Works
              </h3>
              <p className="text-blue-800 mb-4">
                Every service provider on our platform goes through a rigorous verification process:
              </p>
              <ul className="space-y-2 text-blue-800 text-sm">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                  <span><strong>Background checks:</strong> Identity verification and credential validation</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                  <span><strong>License verification:</strong> Professional certifications and business licenses</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                  <span><strong>Quality assurance:</strong> Regular monitoring and customer feedback review</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                  <span><strong>Transparent reviews:</strong> Only verified customers can leave reviews</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-secondary-900 mb-4">
              Available Services
            </h2>
            <p className="text-lg text-secondary-600 max-w-3xl mx-auto">
              Browse our comprehensive marketplace of services designed specifically for newcomers to Canada.
              Each service provider is verified, reviewed, and ready to help you settle successfully.
            </p>
          </div>

          <div className="flex flex-wrap gap-2 justify-center mb-12">
            {categories.map((cat) => (
              <Badge key={cat} variant="secondary" className="cursor-pointer hover:bg-primary-100 hover:text-primary-700 transition-colors">
                {cat}
              </Badge>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service) => {
              const Icon = service.icon;
              return (
                <Card key={service.id} className="relative hover:shadow-lg transition-shadow">
                  {service.badge && (
                    <div className="absolute top-4 right-4">
                      <Badge variant="info">{service.badge}</Badge>
                    </div>
                  )}

                  <div className="flex items-start gap-4 mb-4">
                    <div className="w-12 h-12 rounded-lg bg-primary-100 text-primary-600 flex items-center justify-center flex-shrink-0">
                      <Icon className="w-6 h-6" />
                    </div>
                    <div className="flex-1">
                      <Badge variant="secondary" className="text-xs mb-2">
                        {service.category}
                      </Badge>
                      <h3 className="text-lg font-bold text-secondary-900 mb-2">
                        {service.title}
                      </h3>
                    </div>
                  </div>

                  <p className="text-secondary-600 text-sm mb-4">
                    {service.description}
                  </p>

                  <div className="mb-4">
                    <h4 className="font-semibold text-secondary-900 mb-2 text-sm">What's Included:</h4>
                    <ul className="space-y-1">
                      {service.features.slice(0, 4).map((feature, idx) => (
                        <li key={idx} className="text-secondary-600 text-xs flex items-start gap-2">
                          <CheckCircle className="w-3 h-3 text-success-500 flex-shrink-0 mt-0.5" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                    {service.features.length > 4 && (
                      <p className="text-primary-600 text-xs mt-2">
                        +{service.features.length - 4} more features
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-2 text-xs text-secondary-500 mb-3">
                    <Star className="w-4 h-4 text-warning-500 fill-current" />
                    <span>Verified providers available</span>
                  </div>

                  <Button variant="outline" size="sm" className="w-full" disabled>
                    Coming Soon
                  </Button>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      <section className="py-16 px-4 bg-secondary-50">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card>
              <h3 className="text-xl font-bold text-secondary-900 mb-4">
                For Service Seekers
              </h3>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-success-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-secondary-900">Browse & Compare:</strong>
                    <p className="text-secondary-600 text-sm">View detailed profiles, pricing, and availability</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-success-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-secondary-900">Read Reviews:</strong>
                    <p className="text-secondary-600 text-sm">See ratings and feedback from verified customers</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-success-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-secondary-900">Book Directly:</strong>
                    <p className="text-secondary-600 text-sm">Message providers, ask questions, and book services</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-success-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-secondary-900">Secure Payments:</strong>
                    <p className="text-secondary-600 text-sm">Pay securely through the platform with buyer protection</p>
                  </div>
                </li>
              </ul>
            </Card>

            <Card>
              <h3 className="text-xl font-bold text-secondary-900 mb-4">
                For Service Providers
              </h3>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-success-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-secondary-900">Join Our Network:</strong>
                    <p className="text-secondary-600 text-sm">Become a verified provider and reach thousands of newcomers</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-success-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-secondary-900">Build Your Reputation:</strong>
                    <p className="text-secondary-600 text-sm">Collect reviews and showcase your expertise</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-success-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-secondary-900">Manage Bookings:</strong>
                    <p className="text-secondary-600 text-sm">Dashboard to handle inquiries, bookings, and payments</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-success-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-secondary-900">Grow Your Business:</strong>
                    <p className="text-secondary-600 text-sm">Access marketing tools and analytics to expand your reach</p>
                  </div>
                </li>
              </ul>
            </Card>
          </div>
        </div>
      </section>

      <section className="bg-gradient-to-br from-secondary-900 to-secondary-800 text-white py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">
            Join the Waitlist
          </h2>
          <p className="text-lg text-secondary-300 mb-8">
            Be the first to know when our Services Marketplace launches. Get exclusive early access,
            special discounts, and priority booking with verified providers.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/consultation">
              <Button size="lg" variant="secondary">
                Book Pre-Launch Consultation
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            <Link to="/">
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-secondary-900">
                Back to Home
              </Button>
            </Link>
          </div>
          <p className="text-secondary-400 text-sm mt-6">
            Expected launch: Coming soon. We're working hard to bring you the best newcomer marketplace.
          </p>
        </div>
      </section>
    </div>
  );
}
