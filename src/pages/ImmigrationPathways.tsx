import { Link } from 'react-router-dom';
import { GraduationCap, Briefcase, Home, MapPin, Award, Users, ArrowRight, CheckCircle } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';

interface Pathway {
  id: string;
  title: string;
  icon: React.ElementType;
  description: string;
  usesCRS: boolean;
  languageTest: string;
  timeline: string;
  cost: string;
  requirements: string[];
  keyDocuments: string[];
  proofOfFunds: string;
  badge?: string;
}

const pathways: Pathway[] = [
  {
    id: 'express-entry',
    title: 'Express Entry (PR)',
    icon: Home,
    description: 'Permanent residence as a skilled worker through the Comprehensive Ranking System (CRS).',
    usesCRS: true,
    languageTest: 'IELTS General / CELPIP / TEF / TCF',
    timeline: '6-12 months',
    cost: '$1,365 CAD + medical/biometrics',
    requirements: [
      'Minimum CLB 7 (FSW) or CLB 5 (FST)',
      'Educational Credential Assessment (ECA)',
      '1+ year work experience in NOC 0, 1, 2, or 3',
      'Age, education, and skills for CRS points',
      'Pass medical exam and security checks'
    ],
    keyDocuments: [
      'Language test results (valid 2 years)',
      'ECA report (WES, IQAS, ICAS, etc.)',
      'Work reference letters',
      'Passport and travel documents',
      'Police certificates'
    ],
    proofOfFunds: '$14,700 for 1 person, $18,300 for 2',
    badge: 'Most Popular'
  },
  {
    id: 'study-permit',
    title: 'Study Visa',
    icon: GraduationCap,
    description: 'Study at a Canadian Designated Learning Institution (DLI) and potentially transition to PR.',
    usesCRS: false,
    languageTest: 'IELTS Academic / TOEFL / PTE / Duolingo',
    timeline: '4-8 weeks',
    cost: '$150 CAD + biometrics',
    requirements: [
      'Letter of Acceptance from a DLI',
      'IELTS Academic 6.0-6.5 (varies by school)',
      'Statement of Purpose (SOP)',
      'Proof of ties to home country',
      'Medical exam (for many countries)'
    ],
    keyDocuments: [
      'Letter of Acceptance (LOA)',
      'Proof of financial support',
      'Valid passport',
      'Biometrics',
      'Statement of Purpose'
    ],
    proofOfFunds: '$20,635/year + tuition (+$5,000 for spouse, +$3,000 per child)'
  },
  {
    id: 'work-permit',
    title: 'Work Permit',
    icon: Briefcase,
    description: 'Work temporarily in Canada with a job offer, potentially leading to PR through Canadian experience.',
    usesCRS: false,
    languageTest: 'Optional (depends on employer)',
    timeline: '2-4 months',
    cost: '$155 CAD + biometrics',
    requirements: [
      'Job offer from Canadian employer',
      'LMIA (unless exempt)',
      'Qualifications matching NOC code',
      'Valid passport for work duration',
      'Medical exam for certain jobs'
    ],
    keyDocuments: [
      'Job offer letter',
      'LMIA or exemption proof',
      'Employment contract',
      'Educational credentials',
      'Work experience letters'
    ],
    proofOfFunds: 'Varies (if not employer-supported)'
  },
  {
    id: 'pnp',
    title: 'Provincial Nominee Program',
    icon: MapPin,
    description: 'Get nominated by a Canadian province to fill local labor market needs. Often adds 600 CRS points.',
    usesCRS: true,
    languageTest: 'IELTS General / CELPIP / TEF',
    timeline: '6-18 months',
    cost: '$1,500-$2,300 CAD (varies by province)',
    requirements: [
      'CLB 4-7 language level (varies by stream)',
      'Job offer from employer in province (most streams)',
      'Work experience in in-demand occupation',
      'Intention to live in nominating province',
      'Meet provincial points threshold'
    ],
    keyDocuments: [
      'Provincial nomination certificate',
      'Job offer (most streams)',
      'Language test results',
      'Educational credentials',
      'Settlement plan'
    ],
    proofOfFunds: 'Similar to Express Entry',
    badge: 'Provincial Focus'
  },
  {
    id: 'quebec',
    title: 'Quebec PR',
    icon: MapPin,
    description: 'Permanent residence through Quebec\'s own selection system (Arrima). French language mandatory.',
    usesCRS: false,
    languageTest: 'TEF / TCF (French B2+ required)',
    timeline: '12-24 months',
    cost: '$1,100 CAD + federal PR fees',
    requirements: [
      'French B2 level (intermediate-high)',
      'Education in eligible field',
      'Points for age, family, adaptability',
      'Financial self-sufficiency contract',
      'Intention to settle in Quebec'
    ],
    keyDocuments: [
      'CSQ (Certificat de sélection du Québec)',
      'French test results',
      'Educational credentials',
      'Work experience proof',
      'Financial capacity proof'
    ],
    proofOfFunds: 'Varies by family size',
    badge: 'French Required'
  },
  {
    id: 'citizenship',
    title: 'Canadian Citizenship',
    icon: Award,
    description: 'Become a Canadian citizen after holding permanent residence for 3+ years.',
    usesCRS: false,
    languageTest: 'IELTS GT / CELPIP (CLB 4)',
    timeline: '12-24 months',
    cost: '$630 CAD (adults), $100 (minors)',
    requirements: [
      'Must already be a Permanent Resident',
      '3 years (1,095 days) in Canada in last 5 years',
      'Filed taxes for 3 years',
      'CLB 4 language proof (ages 18-54)',
      'Pass citizenship test'
    ],
    keyDocuments: [
      'PR card and documents',
      'Proof of physical presence',
      'Tax filing records',
      'Language test results',
      'Police certificates (if required)'
    ],
    proofOfFunds: 'Not required'
  }
];

export function ImmigrationPathways() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-600 to-primary-800 text-white py-20 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Canadian Immigration Pathways
          </h1>
          <p className="text-xl text-primary-100 mb-8 max-w-3xl mx-auto">
            Understanding your options is the first step to successfully immigrating to Canada.
            Each pathway has different requirements, timelines, and benefits.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link to="/calculator">
              <Button size="lg" variant="secondary">
                Calculate CRS Score
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            <Link to="/consultation">
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-primary-600">
                Book Consultation
                <Users className="w-5 h-5 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Important Notice */}
      <section className="bg-blue-50 border-b border-blue-200 py-8 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-start gap-4">
            <CheckCircle className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-semibold text-blue-900 mb-2">
                Important: CRS vs. Other Immigration Systems
              </h3>
              <p className="text-blue-800">
                The <strong>Comprehensive Ranking System (CRS)</strong> is used only for <strong>Express Entry</strong> (permanent residence).
                It does NOT apply to study permits, temporary work permits, family sponsorship, or citizenship applications.
                Each pathway has its own requirements and evaluation criteria.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pathways Grid */}
      <section className="py-16 px-4 bg-secondary-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-secondary-900 mb-4">
              Choose Your Immigration Path
            </h2>
            <p className="text-lg text-secondary-600 max-w-3xl mx-auto">
              Each pathway serves different goals. Review the requirements, timelines, and costs to find the best fit for your situation.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {pathways.map((pathway) => {
              const Icon = pathway.icon;
              return (
                <Card key={pathway.id} className="relative overflow-hidden hover:shadow-lg transition-shadow">
                  {pathway.badge && (
                    <div className="absolute top-4 right-4">
                      <Badge variant="info">{pathway.badge}</Badge>
                    </div>
                  )}

                  <div className="flex items-start gap-4 mb-4">
                    <div className="w-12 h-12 rounded-lg bg-primary-100 text-primary-600 flex items-center justify-center flex-shrink-0">
                      <Icon className="w-6 h-6" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-secondary-900 mb-2">
                        {pathway.title}
                      </h3>
                      <p className="text-secondary-600 text-sm">
                        {pathway.description}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
                    <div className="bg-secondary-50 p-3 rounded-lg">
                      <div className="text-secondary-500 text-xs mb-1">Uses CRS?</div>
                      <div className="font-semibold text-secondary-900">
                        {pathway.usesCRS ? 'Yes' : 'No'}
                      </div>
                    </div>
                    <div className="bg-secondary-50 p-3 rounded-lg">
                      <div className="text-secondary-500 text-xs mb-1">Timeline</div>
                      <div className="font-semibold text-secondary-900">{pathway.timeline}</div>
                    </div>
                    <div className="bg-secondary-50 p-3 rounded-lg">
                      <div className="text-secondary-500 text-xs mb-1">Application Cost</div>
                      <div className="font-semibold text-secondary-900 text-xs">{pathway.cost}</div>
                    </div>
                    <div className="bg-secondary-50 p-3 rounded-lg">
                      <div className="text-secondary-500 text-xs mb-1">Proof of Funds</div>
                      <div className="font-semibold text-secondary-900 text-xs">{pathway.proofOfFunds}</div>
                    </div>
                  </div>

                  <div className="mb-4">
                    <h4 className="font-semibold text-secondary-900 mb-2 text-sm">Language Test:</h4>
                    <p className="text-secondary-600 text-sm">{pathway.languageTest}</p>
                  </div>

                  <div className="mb-4">
                    <h4 className="font-semibold text-secondary-900 mb-2 text-sm">Key Requirements:</h4>
                    <ul className="space-y-1">
                      {pathway.requirements.slice(0, 3).map((req, idx) => (
                        <li key={idx} className="text-secondary-600 text-xs flex items-start gap-2">
                          <CheckCircle className="w-3 h-3 text-success-500 flex-shrink-0 mt-0.5" />
                          <span>{req}</span>
                        </li>
                      ))}
                    </ul>
                    {pathway.requirements.length > 3 && (
                      <details className="mt-2">
                        <summary className="text-primary-600 text-xs cursor-pointer hover:text-primary-700">
                          View {pathway.requirements.length - 3} more requirements
                        </summary>
                        <ul className="space-y-1 mt-2">
                          {pathway.requirements.slice(3).map((req, idx) => (
                            <li key={idx} className="text-secondary-600 text-xs flex items-start gap-2">
                              <CheckCircle className="w-3 h-3 text-success-500 flex-shrink-0 mt-0.5" />
                              <span>{req}</span>
                            </li>
                          ))}
                        </ul>
                      </details>
                    )}
                  </div>

                  <div>
                    <h4 className="font-semibold text-secondary-900 mb-2 text-sm">Key Documents:</h4>
                    <div className="flex flex-wrap gap-1">
                      {pathway.keyDocuments.map((doc, idx) => (
                        <Badge key={idx} variant="secondary" className="text-xs">
                          {doc}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Comparison Table */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-secondary-900 mb-8 text-center">
            Quick Comparison
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-secondary-100">
                  <th className="text-left p-3 font-semibold text-secondary-900 border border-secondary-200">Pathway</th>
                  <th className="text-left p-3 font-semibold text-secondary-900 border border-secondary-200">CRS Used?</th>
                  <th className="text-left p-3 font-semibold text-secondary-900 border border-secondary-200">Job Offer</th>
                  <th className="text-left p-3 font-semibold text-secondary-900 border border-secondary-200">Main Goal</th>
                  <th className="text-left p-3 font-semibold text-secondary-900 border border-secondary-200">Best For</th>
                </tr>
              </thead>
              <tbody>
                <tr className="bg-white hover:bg-secondary-50">
                  <td className="p-3 border border-secondary-200 font-medium">Study Visa</td>
                  <td className="p-3 border border-secondary-200">No</td>
                  <td className="p-3 border border-secondary-200">Not required</td>
                  <td className="p-3 border border-secondary-200">Study temporarily</td>
                  <td className="p-3 border border-secondary-200">Students wanting Canadian education</td>
                </tr>
                <tr className="bg-secondary-50 hover:bg-secondary-100">
                  <td className="p-3 border border-secondary-200 font-medium">Work Permit</td>
                  <td className="p-3 border border-secondary-200">No</td>
                  <td className="p-3 border border-secondary-200">Required</td>
                  <td className="p-3 border border-secondary-200">Work temporarily</td>
                  <td className="p-3 border border-secondary-200">Those with job offers</td>
                </tr>
                <tr className="bg-white hover:bg-secondary-50">
                  <td className="p-3 border border-secondary-200 font-medium">Express Entry</td>
                  <td className="p-3 border border-secondary-200">Yes</td>
                  <td className="p-3 border border-secondary-200">Optional</td>
                  <td className="p-3 border border-secondary-200">Permanent Residence</td>
                  <td className="p-3 border border-secondary-200">Skilled workers with strong profiles</td>
                </tr>
                <tr className="bg-secondary-50 hover:bg-secondary-100">
                  <td className="p-3 border border-secondary-200 font-medium">PNP</td>
                  <td className="p-3 border border-secondary-200">Often (if EE-linked)</td>
                  <td className="p-3 border border-secondary-200">Usually required</td>
                  <td className="p-3 border border-secondary-200">PR via province</td>
                  <td className="p-3 border border-secondary-200">Those targeting specific provinces</td>
                </tr>
                <tr className="bg-white hover:bg-secondary-50">
                  <td className="p-3 border border-secondary-200 font-medium">Quebec PR</td>
                  <td className="p-3 border border-secondary-200">No</td>
                  <td className="p-3 border border-secondary-200">Optional</td>
                  <td className="p-3 border border-secondary-200">PR in Quebec</td>
                  <td className="p-3 border border-secondary-200">French speakers wanting Quebec</td>
                </tr>
                <tr className="bg-secondary-50 hover:bg-secondary-100">
                  <td className="p-3 border border-secondary-200 font-medium">Citizenship</td>
                  <td className="p-3 border border-secondary-200">No</td>
                  <td className="p-3 border border-secondary-200">Not applicable</td>
                  <td className="p-3 border border-secondary-200">Become citizen</td>
                  <td className="p-3 border border-secondary-200">Current PRs after 3+ years</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-br from-secondary-900 to-secondary-800 text-white py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">
            Not Sure Which Path is Right for You?
          </h2>
          <p className="text-lg text-secondary-300 mb-8">
            Our immigration experts can help you evaluate your options and create a personalized strategy
            based on your qualifications, goals, and timeline.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/pathway-advisor">
              <Button size="lg" variant="secondary">
                Get Personalized Assessment
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            <Link to="/consultation">
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-secondary-900">
                Book Free Consultation
              </Button>
            </Link>
            <Link to="/calculator">
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-secondary-900">
                Calculate Your CRS Score
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
