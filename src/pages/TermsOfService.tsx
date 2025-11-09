import { Link } from 'react-router-dom';
import { FileText, Scale, AlertCircle, CheckCircle, ArrowLeft } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';

export function TermsOfService() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-50 via-white to-secondary-50 pt-20 pb-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary-100 text-primary-600 mb-6">
              <Scale className="w-8 h-8" />
            </div>
            <h1 className="text-5xl md:text-6xl font-bold text-secondary-900 mb-6">
              Terms of Service
            </h1>
            <p className="text-xl text-secondary-600">
              Please read these terms carefully before using our Service.
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
            
            {/* Agreement */}
            <Card>
              <h2 className="text-3xl font-bold text-secondary-900 mb-4">1. Agreement to Terms</h2>
              <p className="text-secondary-700 leading-relaxed">
                By accessing or using Canada Immigration Services ("Service"), you agree to be bound by these 
                Terms of Service ("Terms"). If you disagree with any part of these Terms, you may not access 
                or use the Service.
              </p>
              <p className="text-secondary-700 leading-relaxed mt-4">
                These Terms apply to all visitors, users, and others who access or use the Service. Your use 
                of the Service constitutes your acceptance of these Terms.
              </p>
            </Card>

            {/* Description of Service */}
            <Card>
              <div className="flex items-center mb-4">
                <FileText className="w-6 h-6 text-primary-600 mr-3" />
                <h2 className="text-3xl font-bold text-secondary-900">2. Description of Service</h2>
              </div>
              <p className="text-secondary-700 leading-relaxed mb-4">
                Canada Immigration Services provides:
              </p>
              <ul className="list-disc list-inside space-y-2 text-secondary-700 ml-4">
                <li>CRS (Comprehensive Ranking System) score calculation tools</li>
                <li>Immigration pathway information and recommendations</li>
                <li>AI-powered pathway advisor assessments</li>
                <li>Consultation booking services</li>
                <li>Educational resources and guidance</li>
                <li>Settlement support services</li>
              </ul>
              <p className="text-secondary-700 leading-relaxed mt-4">
                We reserve the right to modify, suspend, or discontinue any part of the Service at any time 
                with or without notice.
              </p>
            </Card>

            {/* Use of Service */}
            <Card>
              <h2 className="text-3xl font-bold text-secondary-900 mb-4">3. Use of Service</h2>
              
              <h3 className="text-2xl font-semibold text-secondary-900 mt-6 mb-3">3.1 Eligibility</h3>
              <p className="text-secondary-700 leading-relaxed">
                You must be at least 18 years old to use our Service. By using the Service, you represent 
                and warrant that you meet this age requirement.
              </p>

              <h3 className="text-2xl font-semibold text-secondary-900 mt-6 mb-3">3.2 Acceptable Use</h3>
              <p className="text-secondary-700 leading-relaxed mb-4">
                You agree to use the Service only for lawful purposes and in accordance with these Terms. 
                You agree not to:
              </p>
              <ul className="list-disc list-inside space-y-2 text-secondary-700 ml-4">
                <li>Violate any applicable laws or regulations</li>
                <li>Infringe upon the rights of others</li>
                <li>Transmit any harmful, offensive, or illegal content</li>
                <li>Attempt to gain unauthorized access to the Service or related systems</li>
                <li>Interfere with or disrupt the Service or servers</li>
                <li>Use automated systems to access the Service without permission</li>
                <li>Reproduce, duplicate, or copy any part of the Service without authorization</li>
                <li>Use the Service for any commercial purpose without our express written consent</li>
              </ul>
            </Card>

            {/* Account Registration */}
            <Card>
              <h2 className="text-3xl font-bold text-secondary-900 mb-4">4. Account Registration</h2>
              <p className="text-secondary-700 leading-relaxed mb-4">
                Some features of the Service may require you to create an account. When you create an account, 
                you agree to:
              </p>
              <ul className="list-disc list-inside space-y-2 text-secondary-700 ml-4">
                <li>Provide accurate, current, and complete information</li>
                <li>Maintain and update your information to keep it accurate</li>
                <li>Maintain the security of your account credentials</li>
                <li>Accept responsibility for all activities under your account</li>
                <li>Notify us immediately of any unauthorized access</li>
              </ul>
              <p className="text-secondary-700 leading-relaxed mt-4">
                We reserve the right to suspend or terminate accounts that violate these Terms or engage in 
                fraudulent, abusive, or illegal activity.
              </p>
            </Card>

            {/* Disclaimer */}
            <Card>
              <div className="flex items-center mb-4">
                <AlertCircle className="w-6 h-6 text-warning-500 mr-3" />
                <h2 className="text-3xl font-bold text-secondary-900">5. Important Disclaimer</h2>
              </div>
              <div className="bg-warning-50 border-l-4 border-warning-500 p-6 mb-4">
                <p className="text-secondary-800 font-semibold mb-2">
                  CRS Calculator Disclaimer
                </p>
                <p className="text-secondary-700 leading-relaxed">
                  Our CRS calculator is provided for reference and informational purposes only. While we 
                  strive for accuracy and base our calculations on official IRCC guidelines, the final CRS 
                  score is determined solely by Immigration, Refugees and Citizenship Canada (IRCC) when you 
                  submit your Express Entry profile.
                </p>
                <p className="text-secondary-700 leading-relaxed mt-4">
                  <strong>We are not affiliated with IRCC.</strong> Our calculator is an independent tool 
                  designed to help you estimate your score. We cannot guarantee that your calculated score 
                  will match your official IRCC score.
                </p>
              </div>
              <p className="text-secondary-700 leading-relaxed">
                The Service provides general information and guidance. It does not constitute legal, 
                immigration, or professional advice. For official immigration advice, consult a licensed 
                immigration consultant or lawyer.
              </p>
            </Card>

            {/* Intellectual Property */}
            <Card>
              <h2 className="text-3xl font-bold text-secondary-900 mb-4">6. Intellectual Property Rights</h2>
              <p className="text-secondary-700 leading-relaxed mb-4">
                The Service and its original content, features, and functionality are owned by Canada 
                Immigration Services and are protected by international copyright, trademark, patent, trade 
                secret, and other intellectual property laws.
              </p>
              <p className="text-secondary-700 leading-relaxed">
                You may not modify, reproduce, distribute, create derivative works, publicly display, or 
                commercially exploit any content from the Service without our prior written permission.
              </p>
            </Card>

            {/* Payment Terms */}
            <Card>
              <h2 className="text-3xl font-bold text-secondary-900 mb-4">7. Payment Terms</h2>
              <p className="text-secondary-700 leading-relaxed mb-4">
                Certain services may require payment. By purchasing a service, you agree to:
              </p>
              <ul className="list-disc list-inside space-y-2 text-secondary-700 ml-4">
                <li>Pay all fees and charges associated with your purchase</li>
                <li>Provide accurate payment information</li>
                <li>Authorize us to charge your payment method</li>
                <li>Understand that all fees are non-refundable unless otherwise stated</li>
              </ul>
              <p className="text-secondary-700 leading-relaxed mt-4">
                Prices are subject to change without notice. We reserve the right to refuse or cancel any 
                order at our discretion.
              </p>
            </Card>

            {/* Refund Policy */}
            <Card>
              <h2 className="text-3xl font-bold text-secondary-900 mb-4">8. Refund Policy</h2>
              <p className="text-secondary-700 leading-relaxed">
                Refund eligibility depends on the specific service purchased. Generally:
              </p>
              <ul className="list-disc list-inside space-y-2 text-secondary-700 ml-4 mt-4">
                <li>Free services (CRS calculator, pathway information) are provided without charge</li>
                <li>Consultation services may be refundable if cancelled within the specified timeframe</li>
                <li>Digital products and completed services are generally non-refundable</li>
                <li>Refund requests must be submitted in writing within the applicable timeframe</li>
              </ul>
              <p className="text-secondary-700 leading-relaxed mt-4">
                Contact us at{' '}
                <a href="mailto:support@canadaimmigration.com" className="text-primary-600 hover:underline">
                  support@canadaimmigration.com
                </a>{' '}
                for specific refund inquiries.
              </p>
            </Card>

            {/* Limitation of Liability */}
            <Card>
              <h2 className="text-3xl font-bold text-secondary-900 mb-4">9. Limitation of Liability</h2>
              <p className="text-secondary-700 leading-relaxed mb-4">
                To the maximum extent permitted by law:
              </p>
              <ul className="list-disc list-inside space-y-2 text-secondary-700 ml-4">
                <li>The Service is provided "as is" and "as available" without warranties of any kind</li>
                <li>We do not guarantee the accuracy, completeness, or usefulness of any information</li>
                <li>We are not liable for any indirect, incidental, special, or consequential damages</li>
                <li>Our total liability shall not exceed the amount you paid us in the 12 months preceding 
                the claim</li>
                <li>We are not responsible for immigration outcomes or decisions made by IRCC or other 
                government agencies</li>
              </ul>
            </Card>

            {/* Indemnification */}
            <Card>
              <h2 className="text-3xl font-bold text-secondary-900 mb-4">10. Indemnification</h2>
              <p className="text-secondary-700 leading-relaxed">
                You agree to indemnify, defend, and hold harmless Canada Immigration Services and its 
                officers, directors, employees, and agents from any claims, damages, losses, liabilities, 
                and expenses (including legal fees) arising from your use of the Service, violation of 
                these Terms, or infringement of any rights of another.
              </p>
            </Card>

            {/* Termination */}
            <Card>
              <h2 className="text-3xl font-bold text-secondary-900 mb-4">11. Termination</h2>
              <p className="text-secondary-700 leading-relaxed mb-4">
                We may terminate or suspend your access to the Service immediately, without prior notice, 
                for any reason, including:
              </p>
              <ul className="list-disc list-inside space-y-2 text-secondary-700 ml-4">
                <li>Breach of these Terms</li>
                <li>Fraudulent or illegal activity</li>
                <li>Requests by law enforcement or government agencies</li>
                <li>Extended periods of inactivity</li>
                <li>Technical or security issues</li>
              </ul>
              <p className="text-secondary-700 leading-relaxed mt-4">
                Upon termination, your right to use the Service will cease immediately. All provisions of 
                these Terms that by their nature should survive termination shall survive.
              </p>
            </Card>

            {/* Changes to Terms */}
            <Card>
              <h2 className="text-3xl font-bold text-secondary-900 mb-4">12. Changes to Terms</h2>
              <p className="text-secondary-700 leading-relaxed">
                We reserve the right to modify or replace these Terms at any time. If a revision is material, 
                we will provide at least 30 days' notice prior to any new terms taking effect. What constitutes 
                a material change will be determined at our sole discretion.
              </p>
              <p className="text-secondary-700 leading-relaxed mt-4">
                By continuing to access or use the Service after any revisions become effective, you agree 
                to be bound by the revised terms.
              </p>
            </Card>

            {/* Governing Law */}
            <Card>
              <h2 className="text-3xl font-bold text-secondary-900 mb-4">13. Governing Law</h2>
              <p className="text-secondary-700 leading-relaxed">
                These Terms shall be governed by and construed in accordance with the laws of the Province 
                of Ontario, Canada, without regard to its conflict of law provisions. Any disputes arising 
                from these Terms or the Service shall be subject to the exclusive jurisdiction of the courts 
                of Ontario, Canada.
              </p>
            </Card>

            {/* Contact */}
            <Card>
              <div className="flex items-center mb-4">
                <CheckCircle className="w-6 h-6 text-primary-600 mr-3" />
                <h2 className="text-3xl font-bold text-secondary-900">14. Contact Information</h2>
              </div>
              <p className="text-secondary-700 leading-relaxed mb-4">
                If you have any questions about these Terms of Service, please contact us:
              </p>
              <div className="bg-secondary-50 p-6 rounded-lg">
                <p className="text-secondary-700 mb-2">
                  <strong>Email:</strong>{' '}
                  <a href="mailto:legal@canadaimmigration.com" className="text-primary-600 hover:underline">
                    legal@canadaimmigration.com
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

