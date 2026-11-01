import React from 'react';
import { Sun, Shield, Lock, ArrowRight } from 'lucide-react';
import { UserRole, USER_ROLES } from '../../types/roles';

interface SunPowerLockScreenProps {
  onLogin: (role: UserRole) => void;
}

export const SunPowerLockScreen: React.FC<SunPowerLockScreenProps> = ({ onLogin }) => {
  const rolesList = Object.values(USER_ROLES);

  return (
    <div className="min-h-screen bg-[#0F172A] text-slate-100 flex flex-col justify-center items-center p-4 relative overflow-hidden">
      {/* Background radial gradient glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#C66B45]/15 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-lg w-full bg-slate-900/90 border border-slate-800 rounded-2xl shadow-2xl p-6 sm:p-8 relative z-10 backdrop-blur-md">
        {/* Brand Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#C66B45] text-white shadow-xl shadow-[#C66B45]/20 mb-3 ring-4 ring-white/10">
            <Sun className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">SunPower</h1>
          <p className="text-xs text-slate-400 mt-1">
            Enterprise Solar EPC & Rooftop Installation Management System
          </p>
        </div>

        {/* Lock Banner */}
        <div className="flex items-center gap-3 p-3.5 rounded-xl bg-slate-800/80 border border-slate-700/80 mb-6">
          <div className="w-9 h-9 rounded-lg bg-slate-700 flex items-center justify-center text-amber-600 shrink-0">
            <Lock className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-semibold text-white">Session Locked</h3>
            <p className="text-[11px] text-slate-400">
              Select your team role persona below to re-authenticate and resume your workflow.
            </p>
          </div>
        </div>

        {/* Quick Role Re-authentication */}
        <div className="space-y-2">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-1">
            Sign In As:
          </p>
          <div className="grid grid-cols-1 gap-2 max-h-72 overflow-y-auto pr-1">
            {rolesList.map((role) => (
              <button
                key={role.id}
                onClick={() => onLogin(role.id)}
                className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-800/50 hover:bg-slate-800 border border-slate-700/60 hover:border-[#C66B45]/50 transition-all group text-left"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`w-8 h-8 rounded-lg ${role.avatarColor} text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-sm`}>
                    {role.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-white group-hover:text-amber-600 transition-colors truncate">
                        {role.name}
                      </span>
                      <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-slate-950 text-slate-400">
                        {role.badge}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 truncate">
                      {role.title}
                    </p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-[#C66B45] group-hover:translate-x-0.5 transition-all shrink-0 ml-2" />
              </button>
            ))}
          </div>
        </div>

        {/* Footer info */}
        <div className="mt-6 pt-4 border-t border-slate-800 text-center text-[10px] text-slate-500 flex items-center justify-center gap-2">
          <Shield className="w-3.5 h-3.5 text-emerald-500" />
          <span>Role-Based Access Control (RBAC) Enforced - SunPower v2.4</span>
        </div>
      </div>
    </div>
  );
};
