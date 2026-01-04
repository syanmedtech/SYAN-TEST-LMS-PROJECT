
import React, { useState } from 'react';
import { ArrowRight, Lock, User, Mail, UserPlus, LogIn, CheckCircle2 } from 'lucide-react';
import { Logo } from './Logo';

interface LoginProps {
  onLogin: (username: string) => void;
  isLoading: boolean;
}

export const Login: React.FC<LoginProps> = ({ onLogin, isLoading }) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
    confirmPassword: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isSignUp) {
        if (formData.password !== formData.confirmPassword) {
            alert("Passwords do not match!");
            return;
        }
        // For mock signup, we pass the full name so the dashboard greets them correctly
        onLogin(formData.fullName);
    } else {
        if (formData.email && formData.password) {
            onLogin(formData.email);
        }
    }
  };

  const toggleMode = () => {
      setIsSignUp(!isSignUp);
      setFormData({ email: '', password: '', fullName: '', confirmPassword: '' });
  };

  return (
    <div className="min-h-screen flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 bg-slate-50 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
          <div className="absolute -top-[10%] -right-[10%] w-[50%] h-[50%] bg-primary-100/40 rounded-full blur-3xl opacity-60"></div>
          <div className="absolute top-[20%] -left-[10%] w-[40%] h-[40%] bg-blue-100/40 rounded-full blur-3xl opacity-60"></div>
          <div className="absolute bottom-0 right-0 w-full h-1/2 bg-gradient-to-t from-white to-transparent"></div>
      </div>

      <div className="max-w-md w-full mx-auto space-y-8 relative z-10 animate-fade-in">
        {/* Brand Header */}
        <div className="text-center flex flex-col items-center">
          <div className="mb-6 transform transition-transform hover:scale-105 duration-300">
             <Logo className="w-28 h-28" withText={true} />
          </div>
          <h2 className="text-3xl font-bold text-slate-800 tracking-tight">
            {isSignUp ? 'Create Account' : 'Welcome Back'}
          </h2>
          <p className="mt-2 text-sm text-slate-500 font-medium">
            {isSignUp 
                ? 'Join thousands of medical students mastering their exams.' 
                : 'Enter your credentials to access your dashboard.'}
          </p>
        </div>

        {/* Login/Signup Card */}
        <div className="bg-white/80 backdrop-blur-xl border border-white/50 shadow-2xl shadow-primary-500/10 rounded-3xl p-8 transition-all duration-300">
          <form className="space-y-5" onSubmit={handleSubmit}>
            
            {isSignUp && (
                 <div className="animate-slide-up" style={{animationDelay: '0ms'}}>
                    <label htmlFor="fullName" className="block text-sm font-semibold text-slate-700 mb-1.5 ml-1">
                    Full Name
                    </label>
                    <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <User className="h-5 w-5 text-slate-400 group-focus-within:text-primary-500 transition-colors" />
                    </div>
                    <input
                        id="fullName"
                        name="fullName"
                        type="text"
                        required={isSignUp}
                        value={formData.fullName}
                        onChange={handleChange}
                        className="block w-full pl-10 pr-3 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all sm:text-sm"
                        placeholder="Dr. John Doe"
                    />
                    </div>
                </div>
            )}

            <div className="animate-slide-up" style={{animationDelay: '50ms'}}>
              <label htmlFor="email" className="block text-sm font-semibold text-slate-700 mb-1.5 ml-1">
                {isSignUp ? 'Email Address' : 'Username or Email'}
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-slate-400 group-focus-within:text-primary-500 transition-colors" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="text"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="block w-full pl-10 pr-3 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all sm:text-sm"
                  placeholder={isSignUp ? "name@example.com" : "Enter your ID"}
                />
              </div>
            </div>

            <div className="animate-slide-up" style={{animationDelay: '100ms'}}>
              <label htmlFor="password" className="block text-sm font-semibold text-slate-700 mb-1.5 ml-1">
                Password
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-slate-400 group-focus-within:text-primary-500 transition-colors" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="block w-full pl-10 pr-3 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all sm:text-sm"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {isSignUp && (
                <div className="animate-slide-up" style={{animationDelay: '150ms'}}>
                    <label htmlFor="confirmPassword" className="block text-sm font-semibold text-slate-700 mb-1.5 ml-1">
                    Confirm Password
                    </label>
                    <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <CheckCircle2 className="h-5 w-5 text-slate-400 group-focus-within:text-primary-500 transition-colors" />
                    </div>
                    <input
                        id="confirmPassword"
                        name="confirmPassword"
                        type="password"
                        required={isSignUp}
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        className="block w-full pl-10 pr-3 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all sm:text-sm"
                        placeholder="••••••••"
                    />
                    </div>
                </div>
            )}

            {!isSignUp && (
                 <div className="flex justify-end">
                    <a href="#" className="text-sm font-medium text-primary-600 hover:text-primary-500 transition-colors">
                        Forgot password?
                    </a>
                 </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center items-center py-3.5 px-4 border border-transparent rounded-xl shadow-lg shadow-primary-500/30 text-sm font-bold text-white bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-500 hover:to-primary-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-70 disabled:cursor-not-allowed transition-all transform active:scale-[0.98] mt-2"
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  {isSignUp ? (
                      <>Create Account <UserPlus size={18} /></>
                  ) : (
                      <>Sign In <LogIn size={18} /></>
                  )}
                </span>
              )}
            </button>
          </form>

          <div className="mt-8 relative">
             <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200"></div>
             </div>
             <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-slate-400">Authentication</span>
             </div>
          </div>

          <div className="mt-6 text-center">
             <p className="text-sm text-slate-600">
                {isSignUp ? "Already have an account?" : "Don't have an account?"}
                <button 
                    onClick={toggleMode}
                    className="ml-2 font-bold text-primary-600 hover:text-primary-700 transition-colors focus:outline-none"
                >
                    {isSignUp ? "Sign In" : "Sign Up Now"}
                </button>
             </p>
          </div>
        </div>
        
        <div className="text-center text-xs text-slate-400 mt-4">
             By continuing, you agree to the <a href="#" className="underline hover:text-slate-500">Terms of Service</a> & <a href="#" className="underline hover:text-slate-500">Privacy Policy</a>
        </div>
      </div>
    </div>
  );
};
