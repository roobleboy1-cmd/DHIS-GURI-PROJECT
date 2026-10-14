import React from 'react';
import { Link } from 'react-router-dom';
import { Building2, Phone, Mail, MapPin, Heart } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-[#0d2d4f] text-slate-300 border-t border-white/10 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand info */}
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-orange-500 flex items-center justify-center text-white shadow-md">
                <Building2 className="w-5 h-5" />
              </div>
              <span className="font-extrabold text-lg tracking-wider text-white">GURI DHIS</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Modern House Construction & Project Management Platform. Connecting property owners, certified engineers, and skilled builders.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h5 className="text-xs font-bold uppercase tracking-wider text-white">Discover</h5>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/houses" className="hover:text-white transition-colors">
                  House Catalog
                </Link>
              </li>
              <li>
                <Link to="/designs" className="hover:text-white transition-colors">
                  Architectural Plans
                </Link>
              </li>
              <li>
                <Link to="/engineers" className="hover:text-white transition-colors">
                  Certified Engineers
                </Link>
              </li>
            </ul>
          </div>

          {/* User Links */}
          <div className="space-y-3">
            <h5 className="text-xs font-bold uppercase tracking-wider text-white">Platform Access</h5>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/login" className="hover:text-white transition-colors">
                  Client & Engineer Sign In
                </Link>
              </li>
              <li>
                <Link to="/register" className="hover:text-white transition-colors">
                  Register New Account
                </Link>
              </li>
              <li>
                <Link to="/dashboard" className="hover:text-white transition-colors">
                  Project Workspace
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Details */}
          <div className="space-y-3">
            <h5 className="text-xs font-bold uppercase tracking-wider text-white">Contact & Support</h5>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-orange-400 shrink-0" />
                <span>Mogadishu, Somalia</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-orange-400 shrink-0" />
                <span>+252 (61) 500-0000</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-orange-400 shrink-0" />
                <span>support@guridhis.com</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-4">
          <p>© {new Date().getFullYear()} GURI DHIS — House Construction Management System. All rights reserved.</p>
          <p className="flex items-center gap-1">
            Built with modern architecture for high reliability
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
