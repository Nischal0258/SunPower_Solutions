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

  let bgClass = 'bg-[#F5F3EF] text-[#292724] border-[#E7E2D9]';
  let dotClass = 'bg-[#292724]';

  const s = status.toLowerCase();

  if (s.includes('urgent') || s.includes('out of stock') || s.includes('lost') || s.includes('expired') || s.includes('rejected')) {
    bgClass = 'bg-[#C66B45]/10 text-[#C66B45] border-[#C66B45]/30 font-semibold';
    dotClass = 'bg-[#C66B45]';
  } else if (s.includes('approved') || s.includes('completed') || s.includes('in stock') || s.includes('converted') || s.includes('active') || s.includes('closed')) {
    bgClass = 'bg-[#292724] text-[#FFFFFF] border-[#292724]';
    dotClass = 'bg-[#DBBA95]';
  } else if (s.includes('low stock') || s.includes('expiring soon') || s.includes('progress') || s.includes('high') || s.includes('scheduled')) {
    bgClass = 'bg-[#D9A441]/15 text-[#292724] border-[#D9A441]/40 font-medium';
    dotClass = 'bg-[#D9A441]';
  } else if (s.includes('sent') || s.includes('survey') || s.includes('assigned') || s.includes('medium')) {
    bgClass = 'bg-[#DBBA95]/20 text-[#292724] border-[#DBBA95]/50';
    dotClass = 'bg-[#DBBA95]';
  } else {
    // Draft, New, Contacted, Low, Material Ready, Open
    bgClass = 'bg-[#FFFFFF] text-[#292724] border-[#E7E2D9]';
    dotClass = 'bg-[#E7E2D9]';
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
