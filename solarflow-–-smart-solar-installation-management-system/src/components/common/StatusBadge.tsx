import React from 'react';

interface StatusBadgeProps {
  status: string;
  type?: 'lead' | 'quote' | 'stock' | 'stage' | 'warranty' | 'priority' | 'ticket';
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className = '' }) => {
  // Strict palette styling:
  // Approved / Active / In Stock / Resolved -> Graphite text, Warm beige / Stone background
  // Urgent / Low Stock / Lost / Expired -> Burnt orange text or background
  // Pending / Survey / In Progress -> Amber gold accent
  // Draft / Contacted / New / Open -> Stone neutral

  let bgClass = 'bg-slate-50 text-slate-900 border-slate-200';
  let dotClass = 'bg-slate-900';

  const s = status.toLowerCase();

  if (s.includes('urgent') || s.includes('out of stock') || s.includes('lost') || s.includes('expired') || s.includes('rejected')) {
    bgClass = 'bg-[#C66B45]/10 text-[#C66B45] border-[#C66B45]/30 font-semibold';
    dotClass = 'bg-[#C66B45]';
  } else if (s.includes('approved') || s.includes('completed') || s.includes('in stock') || s.includes('converted') || s.includes('active') || s.includes('closed')) {
    bgClass = 'bg-slate-900 text-white border-slate-900';
    dotClass = 'bg-slate-200';
  } else if (s.includes('low stock') || s.includes('expiring soon') || s.includes('progress') || s.includes('high') || s.includes('scheduled')) {
    bgClass = 'bg-[#D9A441]/15 text-slate-900 border-[#D9A441]/40 font-medium';
    dotClass = 'bg-[#D9A441]';
  } else if (s.includes('sent') || s.includes('survey') || s.includes('assigned') || s.includes('medium')) {
    bgClass = 'bg-slate-100 text-slate-900 border-slate-300/50';
    dotClass = 'bg-slate-200';
  } else {
    // Draft, New, Contacted, Low, Material Ready, Open
    bgClass = 'bg-white text-slate-900 border-slate-200';
    dotClass = 'bg-slate-200';
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 text-xs tracking-tight rounded-md border ${bgClass} ${className} whitespace-nowrap`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${dotClass} shrink-0`} aria-hidden="true" />
      <span>{status}</span>
    </span>
  );
};
