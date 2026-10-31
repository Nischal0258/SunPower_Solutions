import React, { useState } from 'react';
import { 
  Sun, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  ShieldCheck, 
  AlertCircle, 
  User, 
  Phone, 
  MapPin, 
  Building2, 
  Home, 
  IndianRupee, 
  Sparkles, 
  CheckCircle2, 
  Zap 
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

  // Customer Self Sign-Up State
  const [signUpName, setSignUpName] = useState('');
  const [signUpEmail, setSignUpEmail] = useState('');
  const [signUpPhone, setSignUpPhone] = useState('');
  const [signUpPassword, setSignUpPassword] = useState('123');
  const [signUpAddress, setSignUpAddress] = useState('');
  const [signUpPropertyType, setSignUpPropertyType] = useState<'Residential' | 'Commercial'>('Residential');
  const [signUpMonthlyBill, setSignUpMonthlyBill] = useState<number>(4500);
  const [signUpError, setSignUpError] = useState('');

  // Standardized employee role credentials (password: '123' or '1234')
  const roleCredentials: Record<string, UserRole> = {
    'manager@gmail.com': 'manager',
    'director@gmail.com': 'manager', // Forward and backward compatibility alias
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

  // Calculated sizing recommendations for live sign-up preview
  const estimatedKw = Math.min(25, Math.max(1, Number((signUpMonthlyBill / 800).toFixed(1))));
  const estimatedMonthlySavings = Math.round(signUpMonthlyBill * 0.85);
  const estimatedSubsidy = signUpPropertyType === 'Residential'
    ? (estimatedKw <= 1 ? 30000 : estimatedKw <= 2 ? 60000 : 78000)
    : 0;

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

    setErrorMessage(`Unrecognized email. Please enter a valid account email from the reference list below or register via the Sign Up tab.`);
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
    if (!signUpAddress.trim()) {
      setSignUpError('Please enter your rooftop installation address.');
      return;
    }
    if (signUpMonthlyBill <= 0) {
      setSignUpError('Please enter a valid average monthly electricity bill.');
      return;
    }

    try {
      const result = DataService.registerCustomer({
        name: signUpName.trim(),
        email: signUpEmail.trim(),
        phone: signUpPhone.trim() || '+91 98200 12345',
        password: signUpPassword || '123',
        address: signUpAddress.trim(),
        propertyType: signUpPropertyType,
        monthlyBill: signUpMonthlyBill
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
      setSignUpError('Registration failed. Please verify your details.');
    }
  };

  const handleForgotPassword = (e: React.MouseEvent) => {
    e.preventDefault();
    setForgotMsg(true);
    setTimeout(() => setForgotMsg(false), 5000);
  };

  const getInitials = (name: string) => {
    if (!name.trim()) return 'SP';
    const parts = name.trim().split(' ');
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  return (
    <div className="min-h-screen bg-[#F5F3EF] text-[#292724] flex flex-col justify-center items-center p-4 sm:p-6 relative font-sans">
      {/* Subtle atmospheric ambient warm sun glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#DBBA95]/20 rounded-full blur-3xl pointer-events-none" />

      {/* Main Container - Expands gracefully when in Sign Up mode */}
      <div className={`w-full ${activeTab === 'signup' ? 'max-w-4xl' : 'max-w-md'} bg-[#FFFFFF] border border-[#E7E2D9] rounded-2xl shadow-xl p-6 sm:p-8 relative z-10 transition-all duration-300`}>
        {/* Brand Header */}
        <div className="text-center mb-5">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#C66B45] text-[#FFFFFF] shadow-lg shadow-[#C66B45]/20 mb-3 ring-4 ring-[#DBBA95]/20">
            <Sun className="w-8 h-8 text-[#FFFFFF]" />
          </div>
          <div className="flex items-center justify-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-[#292724]">SolarFlow</h1>
            <span className="text-xs uppercase tracking-wider font-semibold px-2 py-0.5 rounded bg-[#DBBA95]/25 text-[#C66B45] border border-[#DBBA95]/40">
              Pro
            </span>
          </div>
          <p className="text-xs text-[#292724]/70 mt-1">
            Smart Solar Installation Management & Customer Platform
          </p>
        </div>

        {/* Tab Toggle: Sign In vs Customer Self Sign-Up */}
        <div className="flex items-center p-1 bg-[#F5F3EF] rounded-xl border border-[#E7E2D9] mb-6">
          <button
            type="button"
            onClick={() => {
              setActiveTab('signin');
              setErrorMessage('');
            }}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
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
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'signup'
                ? 'bg-[#C66B45] text-white shadow-xs'
                : 'text-[#292724]/60 hover:text-[#292724]'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Customer Sign Up</span>
          </button>
        </div>

        {/* ===================================================================
            VIEW 1: SIGN IN FORM
            =================================================================== */}
        {activeTab === 'signin' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-bold text-[#292724] tracking-tight">Sign In to Your Workspace</h2>
              <p className="text-xs text-[#292724]/65 mt-0.5">
                Enter your email and password to access your authorized role dashboard.
              </p>
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
                    placeholder="e.g. manager@gmail.com"
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
                    placeholder="Standard password: 123"
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

            {/* Test Accounts Reference */}
            <div className="pt-4 border-t border-[#E7E2D9] text-[#292724]">
              <div className="flex items-center justify-between mb-2">
                <p className="text-[10px] font-bold uppercase tracking-wider text-[#292724]/70">
                  Standard Test Accounts (Password: 123)
                </p>
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200 font-medium">
                  Manual Entry
                </span>
              </div>
              <div className="bg-[#F5F3EF] p-2.5 rounded-xl border border-[#E7E2D9] text-[11px] space-y-1.5 font-mono">
                <div className="grid grid-cols-2 gap-x-2 gap-y-1">
                  <div><span className="text-[#292724]/50">Manager:</span> manager@gmail.com</div>
                  <div><span className="text-[#292724]/50">Technician:</span> technician@gmail.com</div>
                  <div><span className="text-[#292724]/50">Warehouse:</span> warehouse@gmail.com</div>
                  <div><span className="text-[#292724]/50">Support:</span> support@gmail.com</div>
                  <div><span className="text-[#292724]/50">Sales:</span> sales@gmail.com</div>
                  <div><span className="text-[#292724]/50">Customer:</span> aarav.mehta@gmail.com</div>
                </div>
                <div className="pt-1 border-t border-[#E7E2D9]/60 text-[10px] text-[#292724]/60 font-sans">
                  director@gmail.com aliases to Manager. Additional customer accounts: <code className="font-mono text-[#292724]">pooja.sharma@gmail.com</code>, <code className="font-mono text-[#292724]">vikram.rao@gmail.com</code>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ===================================================================
            VIEW 2: CUSTOMER SIGN UP WITH REAL-TIME LIVE DETAIL PREVIEW CARD
            =================================================================== */}
        {activeTab === 'signup' && (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 animate-in fade-in">
            {/* Left: Input Form */}
            <form onSubmit={handleSignUpSubmit} className="md:col-span-7 space-y-4">
              <div>
                <h2 className="text-base font-bold text-[#292724] tracking-tight">Create Customer Account</h2>
                <p className="text-xs text-[#292724]/65 mt-0.5">
                  Sign up to manage rooftop feasibility, track live milestones, and claim subsidies.
                </p>
              </div>

              {signUpError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-center gap-2 animate-in fade-in">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{signUpError}</span>
                </div>
              )}

              <div className="space-y-3">
                {/* Full Name */}
                <div>
                  <label className="block text-xs font-semibold text-[#292724] mb-1">
                    Full Name *
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-[#292724]/40 absolute left-3 top-2.5 pointer-events-none" />
                    <input
                      type="text"
                      required
                      value={signUpName}
                      onChange={(e) => setSignUpName(e.target.value)}
                      placeholder="e.g. Ramesh Kulkarni"
                      className="w-full pl-9 pr-3 py-2 rounded-xl border border-[#E7E2D9] bg-white text-xs font-medium focus:outline-none focus:border-[#C66B45]"
                    />
                  </div>
                </div>

                {/* Email & Phone in 2 Cols */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-[#292724] mb-1">
                      Email Address *
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-[#292724]/40 absolute left-3 top-2.5 pointer-events-none" />
                      <input
                        type="email"
                        required
                        value={signUpEmail}
                        onChange={(e) => setSignUpEmail(e.target.value)}
                        placeholder="ramesh@gmail.com"
                        className="w-full pl-9 pr-3 py-2 rounded-xl border border-[#E7E2D9] bg-white text-xs font-medium focus:outline-none focus:border-[#C66B45]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#292724] mb-1">
                      Phone Number *
                    </label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-[#292724]/40 absolute left-3 top-2.5 pointer-events-none" />
                      <input
                        type="tel"
                        required
                        value={signUpPhone}
                        onChange={(e) => setSignUpPhone(e.target.value)}
                        placeholder="+91 98234 56789"
                        className="w-full pl-9 pr-3 py-2 rounded-xl border border-[#E7E2D9] bg-white text-xs font-medium focus:outline-none focus:border-[#C66B45]"
                      />
                    </div>
                  </div>
                </div>

                {/* Password & Property Type */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-[#292724] mb-1">
                      Portal Password (Default: 123)
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-[#292724]/40 absolute left-3 top-2.5 pointer-events-none" />
                      <input
                        type="password"
                        value={signUpPassword}
                        onChange={(e) => setSignUpPassword(e.target.value)}
                        placeholder="123"
                        className="w-full pl-9 pr-3 py-2 rounded-xl border border-[#E7E2D9] bg-white text-xs font-medium focus:outline-none focus:border-[#C66B45]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#292724] mb-1">
                      Property Type *
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setSignUpPropertyType('Residential')}
                        className={`py-2 px-2 rounded-xl text-xs font-semibold border flex items-center justify-center gap-1.5 transition-all ${
                          signUpPropertyType === 'Residential'
                            ? 'bg-[#C66B45]/10 border-[#C66B45] text-[#C66B45]'
                            : 'bg-white border-[#E7E2D9] text-[#292724]/70 hover:bg-[#F5F3EF]'
                        }`}
                      >
                        <Home className="w-3.5 h-3.5" />
                        <span>Residential</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setSignUpPropertyType('Commercial')}
                        className={`py-2 px-2 rounded-xl text-xs font-semibold border flex items-center justify-center gap-1.5 transition-all ${
                          signUpPropertyType === 'Commercial'
                            ? 'bg-[#C66B45]/10 border-[#C66B45] text-[#C66B45]'
                            : 'bg-white border-[#E7E2D9] text-[#292724]/70 hover:bg-[#F5F3EF]'
                        }`}
                      >
                        <Building2 className="w-3.5 h-3.5" />
                        <span>Commercial</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Rooftop Installation Address */}
                <div>
                  <label className="block text-xs font-semibold text-[#292724] mb-1">
                    Rooftop Address & City *
                  </label>
                  <div className="relative">
                    <MapPin className="w-4 h-4 text-[#292724]/40 absolute left-3 top-2.5 pointer-events-none" />
                    <input
                      type="text"
                      required
                      value={signUpAddress}
                      onChange={(e) => setSignUpAddress(e.target.value)}
                      placeholder="e.g. Bungalow 12, Baner Hills, Pune, Maharashtra"
                      className="w-full pl-9 pr-3 py-2 rounded-xl border border-[#E7E2D9] bg-white text-xs font-medium focus:outline-none focus:border-[#C66B45]"
                    />
                  </div>
                </div>

                {/* Average Monthly Bill */}
                <div>
                  <label className="block text-xs font-semibold text-[#292724] mb-1">
                    Average Monthly Electricity Bill (₹) *
                  </label>
                  <div className="relative">
                    <IndianRupee className="w-4 h-4 text-[#292724]/40 absolute left-3 top-2.5 pointer-events-none" />
                    <input
                      type="number"
                      required
                      min={500}
                      max={1000000}
                      step={100}
                      value={signUpMonthlyBill || ''}
                      onChange={(e) => setSignUpMonthlyBill(Number(e.target.value) || 0)}
                      placeholder="e.g. 4500"
                      className="w-full pl-9 pr-3 py-2 rounded-xl border border-[#E7E2D9] bg-white font-mono text-xs font-medium focus:outline-none focus:border-[#C66B45]"
                    />
                  </div>
                  <p className="text-[10px] text-[#292724]/55 mt-1">
                    Used to compute your recommended kW system size and PM Surya Ghar central subsidy.
                  </p>
                </div>
              </div>

              <button
                type="submit"
                className="w-full mt-4 py-3 px-4 rounded-xl bg-[#C66B45] hover:bg-[#C66B45]/90 text-[#FFFFFF] font-bold text-xs shadow-md shadow-[#C66B45]/25 flex items-center justify-center gap-2 transition-all group cursor-pointer"
              >
                <span>Create Account & Enter Portal</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </form>

            {/* Right: Real-Time Live Detail Preview Card */}
            <div className="md:col-span-5 bg-[#F5F3EF] p-5 rounded-2xl border border-[#E7E2D9] flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-[#E7E2D9]">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#C66B45] flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    Live Detail Preview
                  </span>
                  <span className="text-[9px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold border border-emerald-200">
                    Auto-Synchronizing
                  </span>
                </div>

                {/* Customer Identity Preview */}
                <div className="mt-4 flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-[#292724] text-[#DBBA95] font-bold text-sm flex items-center justify-center shadow-xs shrink-0">
                    {getInitials(signUpName)}
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-bold text-sm text-[#292724] truncate">
                      {signUpName || 'Customer Name'}
                    </h4>
                    <span className="inline-block px-2 py-0.5 mt-0.5 rounded text-[10px] font-semibold bg-white border border-[#E7E2D9] text-[#292724]/75">
                      {signUpPropertyType} Property
                    </span>
                  </div>
                </div>

                {/* Contact & Site Meta */}
                <div className="mt-3.5 space-y-1.5 text-xs text-[#292724]/80 bg-white p-3 rounded-xl border border-[#E7E2D9]">
                  <p className="flex items-center gap-2 text-[11px] truncate">
                    <Mail className="w-3.5 h-3.5 text-[#C66B45] shrink-0" />
                    <span className="truncate">{signUpEmail || 'your.email@domain.com'}</span>
                  </p>
                  <p className="flex items-center gap-2 text-[11px] truncate">
                    <Phone className="w-3.5 h-3.5 text-[#C66B45] shrink-0" />
                    <span>{signUpPhone || '+91 98200 00000'}</span>
                  </p>
                  <p className="flex items-start gap-2 text-[11px] pt-1 border-t border-[#E7E2D9]/60">
                    <MapPin className="w-3.5 h-3.5 text-[#C66B45] shrink-0 mt-0.5" />
                    <span className="line-clamp-2">{signUpAddress || 'Rooftop address not provided yet'}</span>
                  </p>
                </div>

                {/* Instant Solar Assessment Breakdown */}
                <div className="mt-4 space-y-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#292724]/60 block">
                    Calculated Solar Recommendation
                  </span>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="bg-white p-2.5 rounded-xl border border-[#E7E2D9]">
                      <span className="text-[10px] text-[#292724]/60 block">Optimal Sizing</span>
                      <strong className="text-sm font-bold font-mono text-[#292724]">{estimatedKw} kW</strong>
                    </div>

                    <div className="bg-white p-2.5 rounded-xl border border-[#E7E2D9]">
                      <span className="text-[10px] text-[#292724]/60 block">Monthly Savings</span>
                      <strong className="text-sm font-bold font-mono text-emerald-700">₹{estimatedMonthlySavings.toLocaleString('en-IN')}</strong>
                    </div>
                  </div>

                  <div className="bg-white p-2.5 rounded-xl border border-[#E7E2D9] flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-[#292724]/60 block">PM Surya Ghar Subsidy</span>
                      <strong className="text-xs font-bold font-mono text-[#C66B45]">
                        {estimatedSubsidy > 0 ? `₹${estimatedSubsidy.toLocaleString('en-IN')}` : 'Commercial Tariff Net Metering'}
                      </strong>
                    </div>
                    <Zap className="w-4 h-4 text-[#C66B45]" />
                  </div>
                </div>
              </div>

              {/* Ready Indicator Footer */}
              <div className="pt-3 border-t border-[#E7E2D9] flex items-center gap-2 text-emerald-800 text-[11px] font-semibold">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Ready for Instant Solar Assessment</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
