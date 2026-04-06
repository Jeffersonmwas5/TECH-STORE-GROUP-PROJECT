import { Link } from 'react-router-dom';
import { MapPin, Phone, Mail } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-brand-bg border-t border-brand-light pt-12 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-brand-primary rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">T</span>
              </div>
              <span className="font-bold text-xl tracking-tight text-brand-dark">TechStore</span>
            </div>
            <p className="text-brand-medium text-sm">
              Your one-stop shop for the latest and greatest tech products. Quality guaranteed.
            </p>
          </div>
          
          <div>
            <h3 className="font-semibold text-brand-dark mb-4">Shop</h3>
            <ul className="space-y-2">
              <li><Link to="/catalog?category=Phones" className="text-brand-medium hover:text-brand-primary transition-colors text-sm">Phones</Link></li>
              <li><Link to="/catalog?category=Laptops" className="text-brand-medium hover:text-brand-primary transition-colors text-sm">Laptops</Link></li>
              <li><Link to="/catalog?category=Accessories" className="text-brand-medium hover:text-brand-primary transition-colors text-sm">Accessories</Link></li>
              <li><Link to="/catalog?category=Gaming" className="text-brand-medium hover:text-brand-primary transition-colors text-sm">Gaming</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold text-brand-dark mb-4">Contact Us</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-brand-primary flex-shrink-0 mt-0.5" />
                <span className="text-brand-medium text-sm">Embu University<br/>Embu Town, Head Branch</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-brand-primary flex-shrink-0" />
                <span className="text-brand-medium text-sm">0797956942</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-brand-primary flex-shrink-0" />
                <a href="mailto:jefferson10444@gmail.com" className="text-brand-medium hover:text-brand-primary transition-colors text-sm">jefferson10444@gmail.com</a>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold text-brand-dark mb-4">Legal</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-brand-medium hover:text-brand-primary transition-colors text-sm">Privacy Policy</a></li>
              <li><a href="#" className="text-brand-medium hover:text-brand-primary transition-colors text-sm">Terms of Service</a></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-brand-light pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-brand-medium text-sm">
            &copy; {new Date().getFullYear()} TechStore. All rights reserved.
          </p>
          <div className="flex space-x-4 mt-4 md:mt-0">
            {/* Social icons could go here */}
          </div>
        </div>
      </div>
    </footer>
  );
}
