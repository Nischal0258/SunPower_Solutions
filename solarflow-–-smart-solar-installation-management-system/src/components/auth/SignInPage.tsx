import React, { useState } from 'react';
import { 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  ShieldCheck, 
  AlertCircle, 
  User, 
  Phone 
} from 'lucide-react';
import { UserRole } from '../../types/roles';
import { DataService } from '../../services/dataService';

interface SignInPageProps {
  onLogin: (role: UserRole, userEmail?: string) => void;
}

export const SignInPage: React.FC<SignInPageProps> = ({ onLogin }) => {
  // Navigation / View mode: Sign In vs Customer Self Sign-Up
  const [activeTab, setActiveTab] = useState<'signin' | 'signup'>('signin');

  // Sign In State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [forgotMsg, setForgotMsg] = useState(false);

  // Customer Self Sign-Up State: ONLY basic credentials
  const [signUpName, setSignUpName] = useState('');
  const [signUpEmail, setSignUpEmail] = useState('');
  const [signUpPhone, setSignUpPhone] = useState('');
  const [signUpPassword, setSignUpPassword] = useState('123');
  const [showSignUpPassword, setShowSignUpPassword] = useState(false);
  const [signUpError, setSignUpError] = useState('');

  // Standardized employee role credentials (password: '123' or '1234')
  const roleCredentials: Record<string, UserRole> = {
    'manager@gmail.com': 'manager',
    'director@gmail.com': 'manager', // Compatibility alias
    'sales@gmail.com': 'sales',
    'warehouse@gmail.com': 'warehouse',
    'technician@gmail.com': 'technician',
    'support@gmail.com': 'support'
  };

  const customerDirectory = [
    { id: 'CUST-001', email: 'aarav.mehta@gmail.com', name: 'Aarav Mehta' },
    { id: 'CUST-002', email: 'pooja.sharma@gmail.com', name: 'Pooja Sharma' },
    { id: 'CUST-003', email: 'vikram.rao@gmail.com', name: 'Vikram Rao' }
  ];

  const handleSignInSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    // Standardized password verification: password must be "123" (or "1234")
    if (password !== '123' && password !== '1234') {
      setErrorMessage('Invalid password. Standardized system password is "123" for all accounts.');
      return;
    }

    const cleanEmail = email.trim().toLowerCase();

    // 1. Check if employee role
    if (roleCredentials[cleanEmail]) {
      const matchedRole = roleCredentials[cleanEmail];
      onLogin(matchedRole, cleanEmail);
      return;
    }

    // 2. Check if preset customer
    const matchedCustomer = customerDirectory.find(c => c.email.toLowerCase() === cleanEmail);
    if (matchedCustomer) {
      try {
        localStorage.setItem('sunpower_active_customer_persona', matchedCustomer.id);
      } catch {}
      onLogin('customer', cleanEmail);
      return;
    }

    // 3. Check if registered customer in DataService
    const existingCustomers = DataService.getCustomers();
    const matchedRegistered = existingCustomers.find(c => c.email && c.email.toLowerCase() === cleanEmail);
    if (matchedRegistered) {
      try {
        localStorage.setItem('sunpower_active_customer_persona', matchedRegistered.id);
      } catch {}
      onLogin('customer', cleanEmail);
      return;
    }

    setErrorMessage('Unrecognized email. Please enter a valid account email or register via the Sign Up tab.');
  };

  const handleSignUpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSignUpError('');

    if (!signUpName.trim()) {
      setSignUpError('Please enter your full name.');
      return;
    }
    if (!signUpEmail.trim()) {
      setSignUpError('Please enter your email address.');
      return;
    }
    if (!signUpPhone.trim()) {
      setSignUpError('Please enter your mobile phone number.');
      return;
    }
    if (!signUpPassword.trim()) {
      setSignUpError('Please enter a password.');
      return;
    }

    try {
      const result = DataService.registerCustomer({
        name: signUpName.trim(),
        email: signUpEmail.trim(),
        phone: signUpPhone.trim(),
        password: signUpPassword.trim() || '123'
      });

      if (!result.success || !result.customer) {
        setSignUpError(result.error || 'Registration failed. Please verify your details.');
        return;
      }

      // Persist active customer session ID
      localStorage.setItem('sunpower_active_customer_persona', result.customer.id);

      // Authenticate as customer
      onLogin('customer', result.customer.email);
    } catch (err) {
      setSignUpError('Registration failed. Please try again.');
    }
  };

  const handleForgotPassword = (e: React.MouseEvent) => {
    e.preventDefault();
    setForgotMsg(true);
    setTimeout(() => setForgotMsg(false), 5000);
  };

  return (
    <div className="min-h-screen bg-[#F5F3EF] text-[#292724] flex flex-col justify-center items-center p-4 sm:p-6 relative font-sans">
      {/* Ambient warm glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#DBBA95]/20 rounded-full blur-3xl pointer-events-none" />

      {/* Main Login/Sign-Up Card */}
      <div className="w-full max-w-md bg-[#FFFFFF] border border-[#E7E2D9] rounded-2xl shadow-xl p-6 sm:p-8 relative z-10 space-y-6">
        {/* Brand Header */}
        <div className="text-center">
          <h1 className="text-2xl font-bold tracking-tight text-[#292724]">SunPower</h1>
          <p className="text-xs text-[#292724]/70 mt-1">
            Solar Installation OS & Operations Platform
          </p>
        </div>

        {/* Tab Toggle: Sign In vs Sign Up */}
        <div className="flex items-center p-1 bg-[#F5F3EF] rounded-xl border border-[#E7E2D9]">
          <button
            type="button"
            onClick={() => {
              setActiveTab('signin');
              setErrorMessage('');
            }}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              activeTab === 'signin'
                ? 'bg-white text-[#292724] shadow-xs'
                : 'text-[#292724]/60 hover:text-[#292724]'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab('signup');
              setSignUpError('');
            }}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              activeTab === 'signup'
                ? 'bg-[#C66B45] text-white shadow-xs'
                : 'text-[#292724]/60 hover:text-[#292724]'
            }`}
          >
            Sign Up
          </button>
        </div>

        {/* ===================================================================
            VIEW 1: SIGN IN FORM
            =================================================================== */}
        {activeTab === 'signin' && (
          <div className="space-y-4">
            <div>
              <h2 className="text-xl font-bold text-[#292724] tracking-tight">Sign In</h2>
            </div>

            {/* Error Notification */}
            {errorMessage && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-center gap-2 animate-in fade-in">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Forgot Password Notification Banner */}
            {forgotMsg && (
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 flex items-center gap-2 animate-in fade-in">
                <ShieldCheck className="w-4 h-4 text-[#C66B45] shrink-0" />
                <span>Password reset instructions have been dispatched to {email || 'your email'}.</span>
              </div>
            )}

            <form onSubmit={handleSignInSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#292724] mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-[#292724]/40 absolute left-3.5 top-3 pointer-events-none" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-[#E7E2D9] bg-[#FFFFFF] text-[#292724] text-xs font-medium focus:outline-none focus:border-[#C66B45] focus:ring-2 focus:ring-[#C66B45]/20 transition-all placeholder:text-[#292724]/30"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#292724] mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-[#292724]/40 absolute left-3.5 top-3 pointer-events-none" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-[#E7E2D9] bg-[#FFFFFF] text-[#292724] text-xs font-medium focus:outline-none focus:border-[#C66B45] focus:ring-2 focus:ring-[#C66B45]/20 transition-all placeholder:text-[#292724]/30"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-2.5 text-[#292724]/40 hover:text-[#292724] p-0.5 rounded transition-colors"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs pt-1">
                <label className="flex items-center gap-2 cursor-pointer text-[#292724]/75 select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-3.5 h-3.5 rounded border-[#E7E2D9] text-[#C66B45] focus:ring-[#C66B45] cursor-pointer"
                  />
                  <span className="font-medium">Remember session</span>
                </label>

                <button
                  type="button"
                  onClick={handleForgotPassword}
                  className="text-xs font-semibold text-[#C66B45] hover:underline transition-colors cursor-pointer"
                >
                  Forgot password?
                </button>
              </div>

              <button
                type="submit"
                className="w-full mt-2 py-3 px-4 rounded-xl bg-[#C66B45] hover:bg-[#C66B45]/90 text-[#FFFFFF] font-bold text-xs shadow-md shadow-[#C66B45]/25 flex items-center justify-center gap-2 transition-all group cursor-pointer"
              >
                <span>Sign In</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </form>
          </div>
        )}

        {/* ===================================================================
            VIEW 2: CUSTOMER SIGN UP
            =================================================================== */}
        {activeTab === 'signup' && (
          <div className="space-y-4 animate-in fade-in">
            <div>
              <h2 className="text-xl font-bold text-[#292724] tracking-tight">Sign Up</h2>
            </div>

            {signUpError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-center gap-2 animate-in fade-in">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{signUpError}</span>
              </div>
            )}

            <form onSubmit={handleSignUpSubmit} className="space-y-3.5">
              {/* Full Name */}
              <div>
                <label className="block text-xs font-semibold text-[#292724] mb-1">
                  Full Name *
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-[#292724]/40 absolute left-3.5 top-3 pointer-events-none" />
                  <input
                    type="text"
                    required
                    value={signUpName}
                    onChange={(e) => setSignUpName(e.target.value)}
                    placeholder="Enter your full name"
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-[#E7E2D9] bg-white text-xs font-medium text-[#292724] focus:outline-none focus:border-[#C66B45] focus:ring-2 focus:ring-[#C66B45]/20 placeholder:text-[#292724]/30"
                  />
                </div>
              </div>

              {/* Email Address */}
              <div>
                <label className="block text-xs font-semibold text-[#292724] mb-1">
                  Email Address *
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-[#292724]/40 absolute left-3.5 top-3 pointer-events-none" />
                  <input
                    type="email"
                    required
                    value={signUpEmail}
                    onChange={(e) => setSignUpEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-[#E7E2D9] bg-white text-xs font-medium text-[#292724] focus:outline-none focus:border-[#C66B45] focus:ring-2 focus:ring-[#C66B45]/20 placeholder:text-[#292724]/30"
                  />
                </div>
              </div>

              {/* Mobile Phone Number */}
              <div>
                <label className="block text-xs font-semibold text-[#292724] mb-1">
                  Mobile Number *
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-[#292724]/40 absolute left-3.5 top-3 pointer-events-none" />
                  <input
                    type="tel"
                    required
                    value={signUpPhone}
                    onChange={(e) => setSignUpPhone(e.target.value)}
                    placeholder="+91 98200 12345"
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-[#E7E2D9] bg-white text-xs font-medium text-[#292724] focus:outline-none focus:border-[#C66B45] focus:ring-2 focus:ring-[#C66B45]/20 placeholder:text-[#292724]/30"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-semibold text-[#292724] mb-1">
                  Password *
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-[#292724]/40 absolute left-3.5 top-3 pointer-events-none" />
                  <input
                    type={showSignUpPassword ? 'text' : 'password'}
                    required
                    value={signUpPassword}
                    onChange={(e) => setSignUpPassword(e.target.value)}
                    placeholder="Create a password"
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-[#E7E2D9] bg-white text-xs font-medium text-[#292724] focus:outline-none focus:border-[#C66B45] focus:ring-2 focus:ring-[#C66B45]/20 placeholder:text-[#292724]/30"
                  />
                  <button
                    type="button"
                    onClick={() => setShowSignUpPassword(!showSignUpPassword)}
                    className="absolute right-3.5 top-2.5 text-[#292724]/40 hover:text-[#292724] p-0.5 rounded transition-colors"
                  >
                    {showSignUpPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="w-full mt-2 py-3 px-4 rounded-xl bg-[#C66B45] hover:bg-[#C66B45]/90 text-[#FFFFFF] font-bold text-xs shadow-md shadow-[#C66B45]/25 flex items-center justify-center gap-2 transition-all group cursor-pointer"
              >
                <span>Sign Up</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
