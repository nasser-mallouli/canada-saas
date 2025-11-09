import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, Send, MessageSquare, Clock, ArrowLeft } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';

export function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real application, this would send the form data to a backend API
    console.log('Form submitted:', formData);
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setFormData({ name: '', email: '', subject: '', message: '' });
    }, 3000);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-50 via-white to-secondary-50 pt-20 pb-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-5xl md:text-6xl font-bold text-secondary-900 mb-6">
              Contact Us
            </h1>
            <p className="text-xl text-secondary-600 mb-8">
              We're here to help! Get in touch with our team for questions, support, or consultations.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-20 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            
            {/* Contact Information */}
            <div className="lg:col-span-1 space-y-6">
              <Card>
                <div className="flex items-start space-x-4 mb-6">
                  <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center">
                    <Mail className="w-6 h-6 text-primary-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-secondary-900 mb-2">Email Us</h3>
                    <p className="text-secondary-600 mb-2">Send us an email anytime</p>
                    <a 
                      href="mailto:info@canadaimmigration.com" 
                      className="text-primary-600 hover:text-primary-700 font-medium"
                    >
                      info@canadaimmigration.com
                    </a>
                  </div>
                </div>
              </Card>

              <Card>
                <div className="flex items-start space-x-4 mb-6">
                  <div className="flex-shrink-0 w-12 h-12 rounded-full bg-success-100 flex items-center justify-center">
                    <Phone className="w-6 h-6 text-success-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-secondary-900 mb-2">Call Us</h3>
                    <p className="text-secondary-600 mb-2">Mon-Fri 9am-5pm EST</p>
                    <a 
                      href="tel:+15551234567" 
                      className="text-primary-600 hover:text-primary-700 font-medium"
                    >
                      +1 (555) 123-4567
                    </a>
                  </div>
                </div>
              </Card>

              <Card>
                <div className="flex items-start space-x-4 mb-6">
                  <div className="flex-shrink-0 w-12 h-12 rounded-full bg-accent-100 flex items-center justify-center">
                    <MapPin className="w-6 h-6 text-accent-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-secondary-900 mb-2">Visit Us</h3>
                    <p className="text-secondary-600">
                      Toronto, Ontario<br />
                      Canada
                    </p>
                  </div>
                </div>
              </Card>

              <Card>
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center">
                    <Clock className="w-6 h-6 text-primary-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-secondary-900 mb-2">Business Hours</h3>
                    <div className="text-secondary-600 space-y-1 text-sm">
                      <p>Monday - Friday: 9:00 AM - 5:00 PM EST</p>
                      <p>Saturday: 10:00 AM - 2:00 PM EST</p>
                      <p>Sunday: Closed</p>
                    </div>
                  </div>
                </div>
              </Card>
            </div>

            {/* Contact Form */}
            <div className="lg:col-span-2">
              <Card>
                <div className="flex items-center mb-6">
                  <MessageSquare className="w-6 h-6 text-primary-600 mr-3" />
                  <h2 className="text-3xl font-bold text-secondary-900">Send Us a Message</h2>
                </div>

                {submitted ? (
                  <div className="bg-success-50 border border-success-200 rounded-lg p-6 text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-success-100 text-success-600 mb-4">
                      <Send className="w-8 h-8" />
                    </div>
                    <h3 className="text-xl font-semibold text-success-900 mb-2">Message Sent!</h3>
                    <p className="text-success-700">
                      Thank you for contacting us. We'll get back to you within 24-48 hours.
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-secondary-700 mb-2">
                        Full Name *
                      </label>
                      <Input
                        id="name"
                        name="name"
                        type="text"
                        required
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="John Doe"
                      />
                    </div>

                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-secondary-700 mb-2">
                        Email Address *
                      </label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        required
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="john@example.com"
                      />
                    </div>

                    <div>
                      <label htmlFor="subject" className="block text-sm font-medium text-secondary-700 mb-2">
                        Subject *
                      </label>
                      <select
                        id="subject"
                        name="subject"
                        required
                        value={formData.subject}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-secondary-900"
                      >
                        <option value="">Select a subject</option>
                        <option value="general">General Inquiry</option>
                        <option value="crs-calculator">CRS Calculator Question</option>
                        <option value="consultation">Book Consultation</option>
                        <option value="pathway">Immigration Pathway Question</option>
                        <option value="settlement">Settlement Support</option>
                        <option value="technical">Technical Support</option>
                        <option value="other">Other</option>
                      </select>
                    </div>

                    <div>
                      <label htmlFor="message" className="block text-sm font-medium text-secondary-700 mb-2">
                        Message *
                      </label>
                      <textarea
                        id="message"
                        name="message"
                        required
                        rows={6}
                        value={formData.message}
                        onChange={handleChange}
                        placeholder="Please provide details about your inquiry..."
                        className="w-full px-4 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-secondary-900 resize-none"
                      />
                    </div>

                    <Button type="submit" size="lg" className="w-full">
                      <Send className="w-5 h-5 mr-2" />
                      Send Message
                    </Button>
                  </form>
                )}
              </Card>

              {/* Additional Information */}
              <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <h3 className="text-lg font-semibold text-secondary-900 mb-2">For Consultations</h3>
                  <p className="text-secondary-600 text-sm mb-4">
                    Book a one-on-one consultation with our immigration experts.
                  </p>
                  <Link to="/consultation">
                    <Button variant="outline" size="sm" className="w-full">
                      Book Consultation
                    </Button>
                  </Link>
                </Card>

                <Card>
                  <h3 className="text-lg font-semibold text-secondary-900 mb-2">Quick Links</h3>
                  <div className="space-y-2 text-sm">
                    <Link to="/calculator" className="block text-primary-600 hover:text-primary-700">
                      CRS Calculator
                    </Link>
                    <Link to="/pathways" className="block text-primary-600 hover:text-primary-700">
                      Immigration Pathways
                    </Link>
                    <Link to="/pathway-advisor" className="block text-primary-600 hover:text-primary-700">
                      Pathway Advisor
                    </Link>
                    <Link to="/about" className="block text-primary-600 hover:text-primary-700">
                      About Us
                    </Link>
                  </div>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-secondary-50">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-secondary-900 mb-4">Frequently Asked Questions</h2>
            <p className="text-xl text-secondary-600">
              Quick answers to common questions
            </p>
          </div>

          <div className="space-y-6">
            {[
              {
                question: 'How accurate is your CRS calculator?',
                answer: 'Our CRS calculator is built to match official IRCC 2025 guidelines. However, the final score is determined by IRCC when you submit your Express Entry profile. Our calculator provides an accurate estimate for planning purposes.'
              },
              {
                question: 'Do you provide legal immigration advice?',
                answer: 'We provide general information and guidance. For official legal advice, we recommend consulting with a licensed immigration consultant or lawyer. Our consultation services connect you with qualified professionals.'
              },
              {
                question: 'How quickly will you respond to my inquiry?',
                answer: 'We aim to respond to all inquiries within 24-48 hours during business days. For urgent matters, please call us directly at +1 (555) 123-4567.'
              },
              {
                question: 'Is my personal information secure?',
                answer: 'Yes, we take data security seriously. All information is encrypted and stored securely. We never share your personal information with third parties without your explicit consent. See our Privacy Policy for more details.'
              },
              {
                question: 'Can I use your services if I\'m already in Canada?',
                answer: 'Absolutely! Our services are available to candidates at all stages of their immigration journey, whether you\'re planning to immigrate or already in Canada and looking to improve your profile or explore additional pathways.'
              }
            ].map((faq, index) => (
              <Card key={index}>
                <h3 className="text-xl font-semibold text-secondary-900 mb-3">{faq.question}</h3>
                <p className="text-secondary-600">{faq.answer}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary-600 text-white">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold mb-4">Ready to Start Your Journey?</h2>
          <p className="text-xl text-primary-100 mb-8">
            Calculate your CRS score or book a consultation to get started
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

