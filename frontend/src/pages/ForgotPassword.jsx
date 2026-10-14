import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Building2, Mail, Info, ArrowLeft, Send } from 'lucide-react';
import InputField from '../components/forms/InputField';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-slate-50">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link to="/" className="inline-flex items-center gap-2.5 group mb-4">
          <div className="w-12 h-12 rounded-2xl bg-orange-500 flex items-center justify-center text-white shadow-lg group-hover:scale-105 transition-transform">
            <Building2 className="w-7 h-7" />
          </div>
        </Link>
        <h2 className="text-2xl font-black text-[#123c69] tracking-tight">Password Recovery</h2>
        <p className="text-xs text-slate-500 mt-1">Reset access to your GURI DHIS account</p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-white py-8 px-6 sm:px-10 rounded-2xl border border-slate-200 shadow-xl space-y-6">
          {submitted ? (
            <div className="space-y-4 text-center">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto border border-amber-200">
                <Info className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-800">Automated Recovery Not Configured</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                SMTP email gateway is currently not configured on this local environment for account{' '}
                <span className="font-semibold text-slate-700">{email}</span>.
              </p>
              <div className="bg-slate-50 rounded-xl p-4 text-left border border-slate-200 text-xs text-slate-600 space-y-1.5">
                <p className="font-semibold text-slate-700">How to reset your credentials:</p>
                <p>1. Contact your system administrator directly.</p>
                <p>2. If you are developing locally, run the database seed script to reset credentials to default.</p>
              </div>
              <Link
                to="/login"
                className="w-full py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-[#123c69] hover:bg-[#1a4f8a] flex items-center justify-center gap-2 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Return to Sign In
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <p className="text-xs text-slate-500">
                Enter your registered email address below.
              </p>

              <InputField
                label="Email Address"
                id="email"
                name="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@domain.com"
                icon={Mail}
                required
              />

              <button
                type="submit"
                className="w-full py-3 px-4 rounded-xl text-sm font-bold text-white bg-[#123c69] hover:bg-[#1a4f8a] transition-all flex items-center justify-center gap-2 shadow-md"
              >
                <span>Request Reset</span>
                <Send className="w-4 h-4" />
              </button>

              <div className="text-center pt-2">
                <Link to="/login" className="text-xs font-medium text-slate-500 hover:text-slate-800 flex items-center justify-center gap-1">
                  <ArrowLeft className="w-3.5 h-3.5" /> Back to Sign In
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
