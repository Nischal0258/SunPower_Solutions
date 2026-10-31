import React, { useState } from 'react';
import { Sun, Mail, Lock, Eye, EyeOff, ArrowRight, ShieldCheck, AlertCircle } from 'lucide-react';
import { UserRole } from '../../types/roles';
import { DataService } from '../../services/dataService';

interface SignInPageProps {
  onLogin: (role: UserRole, userEmail?: string) => void;
}

export const SignInPage: React.FC<SignInPageProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [forgotMsg, setForgotMsg] = useState(false);

  // Standardized employee role credentials (password: '123' or '1234')
  // Note: 'manager' role is consolidated into 'director'
  const roleCredentials: Record<string, UserRole> = {
    'director@gmail.com': 'director',
    'sales@gmail.com': 'sales',
    'warehouse@gmail.com': 'warehouse',
    'technician@gmail.com': 'technician',
    'support@gmail.com': 'support',
    'manager@gmail.com': 'director' // Fallback compatibility
  };

  const customerDirectory = [
    { id: 'CUST-001', email: 'aarav.mehta@gmail.com', name: 'Aarav Mehta' },
    { id: 'CUST-002', email: 'pooja.sharma@gmail.com', name: 'Pooja Sharma' },
    { id: 'CUST-003', email: 'vikram.rao@gmail.com', name: 'Vikram Rao' }
  ];

  const handleSubmit = (e: React.FormEvent) => {
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

    // 2. Check if customer
    const matchedCustomer = customerDirectory.find(c => c.email.toLowerCase() === cleanEmail);
    if (matchedCustomer) {
      try {
        localStorage.setItem('sunpower_active_customer_persona', matchedCustomer.id);
      } catch {}
      onLogin('customer', cleanEmail);
      return;
    }

    // 3. Check if registered customer in DataService (Director created customer)
    const existingCustomers = DataService.getCustomers();
    const matchedRegistered = existingCustomers.find(c => c.email && c.email.toLowerCase() === cleanEmail);
    if (matchedRegistered) {
      try {
        localStorage.setItem('sunpower_active_customer_persona', matchedRegistered.id);
      } catch {}
      onLogin('customer', cleanEmail);
      return;
    }

    setErrorMessage(`Unrecognized email. Please enter a valid account email from the reference list below.`);
  };

  const handleForgotPassword = (e: React.MouseEvent) => {
    e.preventDefault();
    setForgotMsg(true);
    setTimeout(() => setForgotMsg(false), 5000);
  };

  return (
    <div className="min-h-screen bg-[#F5F3EF] text-[#292724] flex flex-col justify-center items-center p-4 sm:p-6 relative font-sans">
      {/* Subtle atmospheric ambient warm sun glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#DBBA95]/20 rounded-full blur-3xl pointer-events-none" />

      {/* Main Login Card - Friend's Exact Original Styling */}
      <div className="max-w-md w-full bg-[#FFFFFF] border border-[#E7E2D9] rounded-2xl shadow-xl p-6 sm:p-8 relative z-10 space-y-6">
        {/* Brand Header */}
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#C66B45] text-[#FFFFFF] shadow-lg shadow-[#C66B45]/20 mb-3.5 ring-4 ring-[#DBBA95]/20">
            <Sun className="w-8 h-8 text-[#FFFFFF]" />
          </div>
          <div className="flex items-center justify-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-[#292724]">SunPower</h1>
            <span className="text-xs uppercase tracking-wider font-semibold px-2 py-0.5 rounded bg-[#DBBA95]/25 text-[#C66B45] border border-[#DBBA95]/40">
              Pro
            </span>
          </div>
          <p className="text-xs text-[#292724]/70 mt-1.5">
            Solar Installation OS & Operations Platform
          </p>
        </div>

        {/* Heading */}
        <div>
          <h2 className="text-lg font-bold text-[#292724] tracking-tight">Sign In to Your Account</h2>
          <p className="text-xs text-[#292724]/65 mt-0.5">
            Enter your email and password to access your role workspace.
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

        {/* Sign In Form: Mail, Password, Remember Session, Forgot Password, Sign In */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email Field */}
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
                placeholder="e.g. director@gmail.com"
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-[#E7E2D9] bg-[#FFFFFF] text-[#292724] text-xs font-medium focus:outline-none focus:border-[#C66B45] focus:ring-2 focus:ring-[#C66B45]/20 transition-all placeholder:text-[#292724]/30"
              />
            </div>
          </div>

          {/* Password Field */}
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

          {/* Remember Session & Forgot Password Row */}
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

          {/* Sign In Submit Button */}
          <button
            type="submit"
            className="w-full mt-2 py-3 px-4 rounded-xl bg-[#C66B45] hover:bg-[#C66B45]/90 text-[#FFFFFF] font-bold text-xs shadow-md shadow-[#C66B45]/25 flex items-center justify-center gap-2 transition-all group cursor-pointer"
          >
            <span>Sign In</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </form>

        {/* Static Reference Note for Available Accounts */}
        <div className="pt-4 border-t border-[#E7E2D9] text-[#292724]">
          <div className="flex items-center justify-between mb-2">
            <p className="text-[10px] font-bold uppercase tracking-wider text-[#292724]/70">
              System Test Accounts (Password: 123)
            </p>
            <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200 font-medium">
              Manual Entry
            </span>
          </div>
          <div className="bg-[#F5F3EF] p-2.5 rounded-xl border border-[#E7E2D9] text-[11px] space-y-1.5 font-mono">
            <div className="grid grid-cols-2 gap-x-2 gap-y-1">
              <div><span className="text-[#292724]/50">Director:</span> director@gmail.com</div>
              <div><span className="text-[#292724]/50">Technician:</span> technician@gmail.com</div>
              <div><span className="text-[#292724]/50">Warehouse:</span> warehouse@gmail.com</div>
              <div><span className="text-[#292724]/50">Support:</span> support@gmail.com</div>
              <div><span className="text-[#292724]/50">Sales:</span> sales@gmail.com</div>
              <div><span className="text-[#292724]/50">Customer:</span> aarav.mehta@gmail.com</div>
            </div>
            <div className="pt-1 border-t border-[#E7E2D9]/60 text-[10px] text-[#292724]/60 font-sans">
              Other customers: <code className="font-mono text-[#292724]">pooja.sharma@gmail.com</code>, <code className="font-mono text-[#292724]">vikram.rao@gmail.com</code>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};