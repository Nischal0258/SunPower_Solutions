import React, { useState } from 'react';
import { Sun, Mail, Lock, Eye, EyeOff, ArrowRight, ShieldCheck, AlertCircle } from 'lucide-react';
import { UserRole, USER_ROLES } from '../../types/roles';

interface SignInPageProps {
  onLogin: (role: UserRole) => void;
}

export const SignInPage: React.FC<SignInPageProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('manager@gmail.com');
  const [password, setPassword] = useState('1234');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [forgotMsg, setForgotMsg] = useState(false);

  // Standardized credentials map: [role]@gmail.com with password '1234'
  const roleCredentials: Record<string, UserRole> = {
    'manager@gmail.com': 'manager',
    'director@gmail.com': 'director',
    'sales@gmail.com': 'sales',
    'surveyor@gmail.com': 'surveyor',
    'warehouse@gmail.com': 'warehouse',
    'technician@gmail.com': 'technician',
    'support@gmail.com': 'support',
    'customer@gmail.com': 'customer'
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    // Strict password verification: password must be "1234" for every role
    if (password !== '1234') {
      setErrorMessage('Invalid password. Standardized system password is "1234" for all roles.');
      return;
    }

    const cleanEmail = email.trim().toLowerCase();
    const matchedRole = roleCredentials[cleanEmail];

    if (!matchedRole) {
      setErrorMessage(`Unrecognized email. Please use a standardized role email (e.g., manager@gmail.com, sales@gmail.com, etc.).`);
      return;
    }

    onLogin(matchedRole);
  };

  const handleForgotPassword = (e: React.MouseEvent) => {
    e.preventDefault();
    setForgotMsg(true);
    setTimeout(() => setForgotMsg(false), 5000);
  };

  const handleSelectCredential = (roleEmail: string) => {
    setEmail(roleEmail);
    setPassword('1234');
    setErrorMessage('');
  };

  return (
    <div className="min-h-screen bg-[#F5F3EF] text-[#292724] flex flex-col justify-center items-center p-4 sm:p-6 relative font-sans">
      {/* Subtle atmospheric ambient warm sun glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#DBBA95]/20 rounded-full blur-3xl pointer-events-none" />

      {/* Main Login Card - Friend's Exact Original Styling */}
      <div className="max-w-md w-full bg-[#FFFFFF] border border-[#E7E2D9] rounded-2xl shadow-xl p-8 relative z-10">
        {/* Brand Header */}
        <div className="text-center mb-6">
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
        <div className="mb-4">
          <h2 className="text-lg font-bold text-[#292724] tracking-tight">Sign In to Your Account</h2>
          <p className="text-xs text-[#292724]/65 mt-0.5">
            Enter standardized role credentials to access the system.
          </p>
        </div>

        {/* Error Notification */}
        {errorMessage && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-center gap-2 animate-in fade-in">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Forgot Password Notification Banner */}
        {forgotMsg && (
          <div className="mb-4 p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 flex items-center gap-2 animate-in fade-in">
            <ShieldCheck className="w-4 h-4 text-[#C66B45] shrink-0" />
            <span>Password reset instructions have been dispatched to {email}.</span>
          </div>
        )}

        {/* Sign In Form: Mail, Password, Remember Session, Forgot Password, Sign In */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email Field */}
          <div>
            <label className="block text-xs font-semibold text-[#292724] mb-1.5">
              Email Address ([role]@gmail.com)
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-[#292724]/40 absolute left-3.5 top-3 pointer-events-none" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="manager@gmail.com"
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-[#E7E2D9] bg-[#FFFFFF] text-[#292724] text-xs font-medium focus:outline-none focus:border-[#C66B45] focus:ring-2 focus:ring-[#C66B45]/20 transition-all placeholder:text-[#292724]/30"
              />
            </div>
          </div>

          {/* Password Field */}
          <div>
            <label className="block text-xs font-semibold text-[#292724] mb-1.5">
              Password (Standard: 1234)
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-[#292724]/40 absolute left-3.5 top-3 pointer-events-none" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="1234"
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

        {/* Standardized Credentials Reference Bar */}
        <div className="mt-6 pt-4 border-t border-[#E7E2D9]">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">
            Standardized Testing Credentials (Password: 1234):
          </p>
          <div className="flex items-center gap-1.5 flex-wrap">
            {Object.keys(roleCredentials).map((roleEmail) => (
              <button
                key={roleEmail}
                type="button"
                onClick={() => handleSelectCredential(roleEmail)}
                className={`px-2 py-1 rounded text-[10px] font-mono border transition-all ${
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
