import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-secondary-900 text-secondary-200">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">C</span>
              </div>
              <span className="text-xl font-bold text-white">Canada Immigration</span>
            </div>
            <p className="text-secondary-400 text-sm">
              Your trusted partner for Canadian immigration success. Professional guidance from CRS calculation to settlement.
            </p>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4">Services</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/calculator" className="text-secondary-400 hover:text-primary-400 transition-colors text-sm">
                  CRS Calculator
                </Link>
              </li>
              <li>
                <Link to="/information-session" className="text-secondary-400 hover:text-primary-400 transition-colors text-sm">
                  Guidance Session
                </Link>
              </li>
              <li>
                <Link to="/settlement-support" className="text-secondary-400 hover:text-primary-400 transition-colors text-sm">
                  Settlement Support
                </Link>
              </li>
              <li>
                <Link to="/services" className="text-secondary-400 hover:text-primary-400 transition-colors text-sm">
                  All Services
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4">Company</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/company" className="text-secondary-400 hover:text-primary-400 transition-colors text-sm">
                  Company
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-secondary-400 hover:text-primary-400 transition-colors text-sm">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="text-secondary-400 hover:text-primary-400 transition-colors text-sm">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms" className="text-secondary-400 hover:text-primary-400 transition-colors text-sm">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-secondary-400 hover:text-primary-400 transition-colors text-sm">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4">Contact</h3>
            <ul className="space-y-3">
              <li className="flex items-start space-x-2 text-sm">
                <Mail className="w-4 h-4 mt-0.5 text-primary-400" />
                <a href="mailto:info@canadaimmigration.com" className="text-secondary-400 hover:text-primary-400 transition-colors">
                  info@canadaimmigration.com
                </a>
              </li>
              <li className="flex items-start space-x-2 text-sm">
                <Phone className="w-4 h-4 mt-0.5 text-primary-400" />
                <span className="text-secondary-400">+1 (555) 123-4567</span>
              </li>
              <li className="flex items-start space-x-2 text-sm">
                <MapPin className="w-4 h-4 mt-0.5 text-primary-400" />
                <span className="text-secondary-400">Toronto, Ontario, Canada</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-secondary-800">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-secondary-400 text-sm">
              &copy; {new Date().getFullYear()} Canada Immigration Services. All rights reserved.
            </p>
            <p className="text-secondary-500 text-xs mt-2 md:mt-0">
              <strong className="text-warning-400">Disclaimer:</strong> This CRS calculator is for reference only. Official scores are determined by IRCC.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
