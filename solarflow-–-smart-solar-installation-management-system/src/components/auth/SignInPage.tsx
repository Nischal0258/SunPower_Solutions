import React, { useState } from 'react';
import { Sun, Mail, Lock, Eye, EyeOff, ArrowRight, ShieldCheck, AlertCircle, User, CheckCircle2 } from 'lucide-react';
import { UserRole, USER_ROLES } from '../../types/roles';
import { DEMO_CUSTOMERS } from '../../types';
import { DataService } from '../../services/dataService';

interface SignInPageProps {
  onLogin: (role: UserRole, userEmail?: string) => void;
}

export const SignInPage: React.FC<SignInPageProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('director@gmail.com');
  const [password, setPassword] = useState('123');
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

  const customerPresets = [
    {
      id: 'CUST-001',
      name: 'Aarav Mehta',
      email: 'aarav.mehta@gmail.com',
      system: '10 kW Hybrid Solar System',
      location: 'Pune, Maharashtra',
      initials: 'AM'
    },
    {
      id: 'CUST-002',
      name: 'Pooja Sharma',
      email: 'pooja.sharma@gmail.com',
      system: '5 kW On-Grid Solar System',
      location: 'Bengaluru, Karnataka',
      initials: 'PS'
    },
    {
      id: 'CUST-003',
      name: 'Vikram Rao',
      email: 'vikram.rao@gmail.com',
      system: '15 kW Commercial Array',
      location: 'Hyderabad, Telangana',
      initials: 'VR'
    }
  ];

  const handleCustomerLogin = (preset: typeof customerPresets[0]) => {
    setEmail(preset.email);
    setPassword('123');
    setErrorMessage('');
    try {
      localStorage.setItem('sunpower_active_customer_persona', preset.id);
    } catch {}
    onLogin('customer', preset.email);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    // Standardized password verification: password must be "123" (or "1234")
    if (password !== '123' && password !== '1234') {
      setErrorMessage('Invalid password. Standardized system password is "123" for all roles.');
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
    const matchedCustomerPreset = customerPresets.find(c => c.email.toLowerCase() === cleanEmail);
    if (matchedCustomerPreset) {
      try {
        localStorage.setItem('sunpower_active_customer_persona', matchedCustomerPreset.id);
      } catch {}
      onLogin('customer', cleanEmail);
      return;
    }

    // 3. Check if registered customer in DataService (Manager/Director created customer)
    const existingCustomers = DataService.getCustomers();
    const matchedRegistered = existingCustomers.find(c => c.email && c.email.toLowerCase() === cleanEmail);
    if (matchedRegistered) {
      try {
        localStorage.setItem('sunpower_active_customer_persona', matchedRegistered.id);
      } catch {}
      onLogin('customer', cleanEmail);
      return;
    }

    setErrorMessage(`Unrecognized email. Please use a standardized role or customer email (e.g., director@gmail.com, aarav.mehta@gmail.com).`);
  };

  const handleForgotPassword = (e: React.MouseEvent) => {
    e.preventDefault();
    setForgotMsg(true);
    setTimeout(() => setForgotMsg(false), 5000);
  };

  const handleSelectRoleCredential = (roleEmail: string) => {
    setEmail(roleEmail);
    setPassword('123');
    setErrorMessage('');
  };

  return (
    <div className="min-h-screen bg-[#F5F3EF] text-[#292724] flex flex-col justify-center items-center p-4 sm:p-6 relative font-sans">
      {/* Subtle atmospheric ambient warm sun glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#DBBA95]/20 rounded-full blur-3xl pointer-events-none" />

      {/* Main Login Card - Friend's Exact Original Styling */}
      <div className="max-w-lg w-full bg-[#FFFFFF] border border-[#E7E2D9] rounded-2xl shadow-xl p-6 sm:p-8 relative z-10 space-y-6">
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
            Select a verified customer preset or sign in with role credentials.
          </p>
        </div>

        {/* Customer Login Presets - 3 Quick Pre-filled Login Cards */}
        <div className="space-y-2">
          <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider">
            Quick Customer Portal Presets (Password: 123)
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {customerPresets.map((preset) => {
              const isSelected = email.toLowerCase() === preset.email.toLowerCase();
              return (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => handleCustomerLogin(preset)}
                  className={`p-2.5 rounded-xl border text-left transition-all ${
                    isSelected
                      ? 'bg-amber-50/80 border-[#C66B45] ring-1 ring-[#C66B45]'
                      : 'bg-slate-50 hover:bg-slate-100 border-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-6 h-6 rounded-md bg-[#292724] text-white font-bold text-[10px] flex items-center justify-center">
                      {preset.initials}
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-xs text-slate-900 truncate leading-tight">{preset.name}</p>
                      <p className="text-[10px] text-slate-500 truncate leading-tight">{preset.location.split(',')[0]}</p>
                    </div>
                  </div>
                  <p className="text-[10px] text-slate-600 line-clamp-1">{preset.system.split(' ')[0]} {preset.system.split(' ')[1]}</p>
                  <span className="mt-1 text-[10px] font-semibold text-[#C66B45] block">
                    Instant Login &rarr;
                  </span>
                </button>
              );
            })}
          </div>
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
            <span>Password reset instructions have been dispatched to {email}.</span>
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
                placeholder="director@gmail.com"
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-[#E7E2D9] bg-[#FFFFFF] text-[#292724] text-xs font-medium focus:outline-none focus:border-[#C66B45] focus:ring-2 focus:ring-[#C66B45]/20 transition-all placeholder:text-[#292724]/30"
              />
            </div>
          </div>

          {/* Password Field */}
          <div>
            <label className="block text-xs font-semibold text-[#292724] mb-1.5">
              Password (Standard: 123)
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-[#292724]/40 absolute left-3.5 top-3 pointer-events-none" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="123"
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
              className="text-xs font-semibold text-[#C66B45] hover:underline transition-colors"
            >
              Forgot password?
            </button>
          </div>

          {/* Sign In Submit Button */}
          <button
            type="submit"
            className="w-full mt-2 py-3 px-4 rounded-xl bg-[#C66B45] hover:bg-[#C66B45]/90 text-[#FFFFFF] font-bold text-xs shadow-md shadow-[#C66B45]/25 flex items-center justify-center gap-2 transition-all group"
          >
            <span>Sign In</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </form>

        {/* Employee Role Presets (Consolidated Director, Sales, Warehouse, Tech, Support) */}
        <div className="pt-4 border-t border-[#E7E2D9]">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">
            Employee Role Presets (Password: 123):
          </p>
          <div className="flex items-center gap-1.5 flex-wrap">
            {['director@gmail.com', 'sales@gmail.com', 'warehouse@gmail.com', 'technician@gmail.com', 'support@gmail.com'].map((roleEmail) => (
              <button
                key={roleEmail}
                type="button"
                onClick={() => handleSelectRoleCredential(roleEmail)}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-mono border transition-all ${
                  email === roleEmail
                    ? 'bg-[#292724] text-white border-[#292724]'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                {roleEmail.split('@')[0]}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
