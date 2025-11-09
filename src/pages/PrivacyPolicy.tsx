import { Link } from 'react-router-dom';
import { Shield, Lock, Eye, FileText, Mail, ArrowLeft } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';

export function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-50 via-white to-secondary-50 pt-20 pb-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary-100 text-primary-600 mb-6">
              <Shield className="w-8 h-8" />
            </div>
            <h1 className="text-5xl md:text-6xl font-bold text-secondary-900 mb-6">
              Privacy Policy
            </h1>
            <p className="text-xl text-secondary-600">
              Your privacy is important to us. This policy explains how we collect, use, and protect your information.
            </p>
            <p className="text-sm text-secondary-500 mt-4">
              Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="py-20 bg-white">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="prose prose-lg max-w-none space-y-12">
            
            {/* Introduction */}
            <Card>
              <h2 className="text-3xl font-bold text-secondary-900 mb-4">1. Introduction</h2>
              <p className="text-secondary-700 leading-relaxed">
                Canada Immigration Services ("we," "our," or "us") is committed to protecting your privacy. 
                This Privacy Policy explains how we collect, use, disclose, and safeguard your information when 
                you use our website, mobile application, and services (collectively, the "Service").
              </p>
              <p className="text-secondary-700 leading-relaxed mt-4">
                By using our Service, you agree to the collection and use of information in accordance with this 
                policy. If you do not agree with our policies and practices, please do not use our Service.
              </p>
            </Card>

            {/* Information We Collect */}
            <Card>
              <div className="flex items-center mb-4">
                <Eye className="w-6 h-6 text-primary-600 mr-3" />
                <h2 className="text-3xl font-bold text-secondary-900">2. Information We Collect</h2>
              </div>
              
              <h3 className="text-2xl font-semibold text-secondary-900 mt-6 mb-3">2.1 Personal Information</h3>
              <p className="text-secondary-700 leading-relaxed mb-4">
                We collect information that you provide directly to us, including:
              </p>
              <ul className="list-disc list-inside space-y-2 text-secondary-700 ml-4">
                <li>Name, email address, and contact information</li>
                <li>Immigration profile data (age, education, work experience, language test scores)</li>
                <li>CRS calculation inputs and results</li>
                <li>Consultation booking information</li>
                <li>Payment information (processed securely through third-party payment processors)</li>
                <li>Any other information you choose to provide</li>
              </ul>

              <h3 className="text-2xl font-semibold text-secondary-900 mt-6 mb-3">2.2 Automatically Collected Information</h3>
              <p className="text-secondary-700 leading-relaxed mb-4">
                When you use our Service, we automatically collect certain information, including:
              </p>
              <ul className="list-disc list-inside space-y-2 text-secondary-700 ml-4">
                <li>Device information (IP address, browser type, operating system)</li>
                <li>Usage data (pages visited, time spent, features used)</li>
                <li>Cookies and similar tracking technologies</li>
                <li>Analytics data to improve our Service</li>
              </ul>
            </Card>

            {/* How We Use Information */}
            <Card>
              <div className="flex items-center mb-4">
                <FileText className="w-6 h-6 text-primary-600 mr-3" />
                <h2 className="text-3xl font-bold text-secondary-900">3. How We Use Your Information</h2>
              </div>
              <p className="text-secondary-700 leading-relaxed mb-4">
                We use the information we collect for the following purposes:
              </p>
              <ul className="list-disc list-inside space-y-2 text-secondary-700 ml-4">
                <li>To provide, maintain, and improve our Service</li>
                <li>To calculate and display your CRS score accurately</li>
                <li>To generate personalized immigration roadmaps and recommendations</li>
                <li>To process consultations and service bookings</li>
                <li>To communicate with you about your account, services, and updates</li>
                <li>To send you marketing communications (with your consent)</li>
                <li>To detect, prevent, and address technical issues and security threats</li>
                <li>To comply with legal obligations and enforce our terms</li>
                <li>To analyze usage patterns and improve user experience</li>
              </ul>
            </Card>

            {/* Information Sharing */}
            <Card>
              <div className="flex items-center mb-4">
                <Lock className="w-6 h-6 text-primary-600 mr-3" />
                <h2 className="text-3xl font-bold text-secondary-900">4. Information Sharing and Disclosure</h2>
              </div>
              <p className="text-secondary-700 leading-relaxed mb-4">
                We do not sell, trade, or rent your personal information to third parties. We may share your 
                information only in the following circumstances:
              </p>
              <ul className="list-disc list-inside space-y-2 text-secondary-700 ml-4">
                <li><strong>Service Providers:</strong> We may share information with trusted third-party 
                service providers who assist us in operating our Service (e.g., payment processors, hosting 
                providers, analytics services). These providers are contractually obligated to protect your 
                information and use it only for the purposes we specify.</li>
                <li><strong>Legal Requirements:</strong> We may disclose information if required by law, 
                court order, or government regulation, or to protect our rights, property, or safety, or that 
                of our users.</li>
                <li><strong>Business Transfers:</strong> In the event of a merger, acquisition, or sale of 
                assets, your information may be transferred as part of that transaction.</li>
                <li><strong>With Your Consent:</strong> We may share information with your explicit consent 
                or at your direction.</li>
              </ul>
            </Card>

            {/* Data Security */}
            <Card>
              <h2 className="text-3xl font-bold text-secondary-900 mb-4">5. Data Security</h2>
              <p className="text-secondary-700 leading-relaxed mb-4">
                We implement industry-standard security measures to protect your information, including:
              </p>
              <ul className="list-disc list-inside space-y-2 text-secondary-700 ml-4">
                <li>Encryption of data in transit (SSL/TLS) and at rest</li>
                <li>Secure authentication and access controls</li>
                <li>Regular security assessments and updates</li>
                <li>Limited access to personal information on a need-to-know basis</li>
                <li>Secure data storage and backup procedures</li>
              </ul>
              <p className="text-secondary-700 leading-relaxed mt-4">
                However, no method of transmission over the Internet or electronic storage is 100% secure. 
                While we strive to protect your information, we cannot guarantee absolute security.
              </p>
            </Card>

            {/* Your Rights */}
            <Card>
              <h2 className="text-3xl font-bold text-secondary-900 mb-4">6. Your Rights and Choices</h2>
              <p className="text-secondary-700 leading-relaxed mb-4">
                You have the following rights regarding your personal information:
              </p>
              <ul className="list-disc list-inside space-y-2 text-secondary-700 ml-4">
                <li><strong>Access:</strong> Request access to the personal information we hold about you</li>
                <li><strong>Correction:</strong> Request correction of inaccurate or incomplete information</li>
                <li><strong>Deletion:</strong> Request deletion of your personal information (subject to legal 
                and contractual obligations)</li>
                <li><strong>Data Portability:</strong> Request a copy of your data in a structured, 
                machine-readable format</li>
                <li><strong>Opt-Out:</strong> Unsubscribe from marketing communications at any time</li>
                <li><strong>Cookie Preferences:</strong> Manage cookie settings through your browser</li>
              </ul>
              <p className="text-secondary-700 leading-relaxed mt-4">
                To exercise these rights, please contact us at{' '}
                <a href="mailto:privacy@canadaimmigration.com" className="text-primary-600 hover:underline">
                  privacy@canadaimmigration.com
                </a>
              </p>
            </Card>

            {/* Cookies */}
            <Card>
              <h2 className="text-3xl font-bold text-secondary-900 mb-4">7. Cookies and Tracking Technologies</h2>
              <p className="text-secondary-700 leading-relaxed mb-4">
                We use cookies and similar tracking technologies to track activity on our Service and store 
                certain information. Types of cookies we use:
              </p>
              <ul className="list-disc list-inside space-y-2 text-secondary-700 ml-4">
                <li><strong>Essential Cookies:</strong> Required for the Service to function properly</li>
                <li><strong>Analytics Cookies:</strong> Help us understand how users interact with our Service</li>
                <li><strong>Preference Cookies:</strong> Remember your settings and preferences</li>
              </ul>
              <p className="text-secondary-700 leading-relaxed mt-4">
                You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent. 
                However, if you do not accept cookies, you may not be able to use some portions of our Service.
              </p>
            </Card>

            {/* Children's Privacy */}
            <Card>
              <h2 className="text-3xl font-bold text-secondary-900 mb-4">8. Children's Privacy</h2>
              <p className="text-secondary-700 leading-relaxed">
                Our Service is not intended for individuals under the age of 18. We do not knowingly collect 
                personal information from children. If you believe we have collected information from a child, 
                please contact us immediately, and we will take steps to delete such information.
              </p>
            </Card>

            {/* International Users */}
            <Card>
              <h2 className="text-3xl font-bold text-secondary-900 mb-4">9. International Data Transfers</h2>
              <p className="text-secondary-700 leading-relaxed">
                Your information may be transferred to and processed in countries other than your country of 
                residence. These countries may have data protection laws that differ from those in your country. 
                We take appropriate safeguards to ensure your information receives adequate protection.
              </p>
            </Card>

            {/* Changes to Policy */}
            <Card>
              <h2 className="text-3xl font-bold text-secondary-900 mb-4">10. Changes to This Privacy Policy</h2>
              <p className="text-secondary-700 leading-relaxed">
                We may update this Privacy Policy from time to time. We will notify you of any changes by posting 
                the new Privacy Policy on this page and updating the "Last updated" date. You are advised to review 
                this Privacy Policy periodically for any changes.
              </p>
            </Card>

            {/* Contact */}
            <Card>
              <div className="flex items-center mb-4">
                <Mail className="w-6 h-6 text-primary-600 mr-3" />
                <h2 className="text-3xl font-bold text-secondary-900">11. Contact Us</h2>
              </div>
              <p className="text-secondary-700 leading-relaxed mb-4">
                If you have any questions about this Privacy Policy or our data practices, please contact us:
              </p>
              <div className="bg-secondary-50 p-6 rounded-lg">
                <p className="text-secondary-700 mb-2">
                  <strong>Email:</strong>{' '}
                  <a href="mailto:privacy@canadaimmigration.com" className="text-primary-600 hover:underline">
                    privacy@canadaimmigration.com
                  </a>
                </p>
                <p className="text-secondary-700 mb-2">
                  <strong>Phone:</strong> +1 (555) 123-4567
                </p>
                <p className="text-secondary-700">
                  <strong>Address:</strong> Toronto, Ontario, Canada
                </p>
              </div>
            </Card>

          </div>

          {/* Back Button */}
          <div className="mt-12 text-center">
            <Link to="/">
              <Button variant="outline" size="lg">
                <ArrowLeft className="w-5 h-5 mr-2" />
                Back to Home
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

