import React, { useState, useEffect } from 'react';
import { Search, X, Users, FileText, Package, Sun, ShieldCheck } from 'lucide-react';
import { DataService } from '../../services/dataService';
import { NavTab } from '../layout/Sidebar';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (tab: NavTab, targetId?: string) => void;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({
  isOpen,
  onClose,
  onNavigate
}) => {
  const [query, setQuery] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        // toggle if already implemented
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  if (!isOpen) return null;

  const customers = DataService.getCustomers();
  const quotations = DataService.getQuotations();
  const inventory = DataService.getInventory();
  const projects = DataService.getProjects();
  const warranties = DataService.getWarranties();

  const q = query.trim().toLowerCase();

  const matchedCustomers = q ? customers.filter(c => 
    c.name.toLowerCase().includes(q) || 
    c.phone.includes(q) || 
    c.city.toLowerCase().includes(q)
  ).slice(0, 3) : [];

  const matchedQuotes = q ? quotations.filter(qt => 
    qt.quotationNumber.toLowerCase().includes(q) || 
    qt.customerName.toLowerCase().includes(q)
  ).slice(0, 3) : [];

  const matchedInventory = q ? inventory.filter(i => 
    i.name.toLowerCase().includes(q) || 
    i.sku.toLowerCase().includes(q) || 
    i.model.toLowerCase().includes(q)
  ).slice(0, 3) : [];

  const matchedProjects = q ? projects.filter(p => 
    p.projectId.toLowerCase().includes(q) || 
    p.customerName.toLowerCase().includes(q)
  ).slice(0, 3) : [];

  const matchedWarranties = q ? warranties.filter(w => 
    w.serialNumber.toLowerCase().includes(q) || 
    w.customerName.toLowerCase().includes(q)
  ).slice(0, 3) : [];

  const totalResults = matchedCustomers.length + matchedQuotes.length + matchedInventory.length + matchedProjects.length + matchedWarranties.length;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div 
        className="fixed inset-0 bg-[#292724]/60 transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      <div className="flex min-h-full items-start justify-center p-4 pt-16 sm:p-6 sm:pt-20">
        <div className="relative w-full max-w-xl rounded-xl bg-[#FFFFFF] shadow-2xl border border-[#E7E2D9] overflow-hidden">
          {/* Search Input Bar */}
          <div className="flex items-center gap-3 px-4 py-3.5 border-b border-[#E7E2D9] bg-[#F5F3EF]">
            <Search className="w-5 h-5 text-[#292724]/60 shrink-0" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search customers, project IDs, quotations, serials or inventory..."
              className="flex-1 bg-transparent text-sm text-[#292724] placeholder-[#292724]/40 focus:outline-none"
              autoFocus
            />
            {query && (
              <button 
                onClick={() => setQuery('')}
                className="p-1 text-[#292724]/50 hover:text-[#292724]"
              >
                <X className="w-4 h-4" />
              </button>
            )}
            <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-mono font-medium text-[#292724]/60 bg-[#E7E2D9] rounded">
              ESC
            </kbd>
          </div>

          {/* Results list */}
          <div className="max-h-96 overflow-y-auto p-2">
            {!q ? (
              <div className="py-8 text-center text-xs text-[#292724]/60">
                Type a name, phone number, project ID (e.g. PRJ-2026), quotation #, or product serial...
              </div>
            ) : totalResults === 0 ? (
              <div className="py-8 text-center text-xs text-[#292724]/70">
                No matching records found for "{query}".
              </div>
            ) : (
              <div className="space-y-3">
                {matchedCustomers.length > 0 && (
                  <div>
                    <p className="px-2.5 py-1 text-[11px] font-semibold text-[#292724]/50 uppercase tracking-wider">Customers</p>
                    {matchedCustomers.map(c => (
                      <button
                        key={c.id}
                        onClick={() => {
                          onNavigate('customers', c.id);
                          onClose();
                        }}
                        className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-[#F5F3EF] text-left transition-colors text-xs text-[#292724]"
                      >
                        <div className="flex items-center gap-2.5">
                          <Users className="w-4 h-4 text-[#C66B45]" />
                          <div>
                            <span className="font-semibold">{c.name}</span>
                            <span className="text-[#292724]/60 ml-2">{c.phone} · {c.city}</span>
                          </div>
                        </div>
                        <span className="text-[11px] font-mono text-[#DBBA95] font-medium">{c.leadStatus}</span>
                      </button>
                    ))}
                  </div>
                )}

                {matchedProjects.length > 0 && (
                  <div>
                    <p className="px-2.5 py-1 text-[11px] font-semibold text-[#292724]/50 uppercase tracking-wider">Projects</p>
                    {matchedProjects.map(p => (
                      <button
                        key={p.id}
                        onClick={() => {
                          onNavigate('installations', p.id);
                          onClose();
                        }}
                        className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-[#F5F3EF] text-left transition-colors text-xs text-[#292724]"
                      >
                        <div className="flex items-center gap-2.5">
                          <Sun className="w-4 h-4 text-[#D9A441]" />
                          <div>
                            <span className="font-semibold">{p.projectId}</span>
                            <span className="text-[#292724]/60 ml-2">{p.customerName} · {p.capacityKw} kW</span>
                          </div>
                        </div>
                        <span className="text-[11px] font-mono bg-[#E7E2D9] px-2 py-0.5 rounded text-[#292724]">{p.stage}</span>
                      </button>
                    ))}
                  </div>
                )}

                {matchedQuotes.length > 0 && (
                  <div>
                    <p className="px-2.5 py-1 text-[11px] font-semibold text-[#292724]/50 uppercase tracking-wider">Quotations</p>
                    {matchedQuotes.map(qt => (
                      <button
                        key={qt.id}
                        onClick={() => {
                          onNavigate('quotations', qt.id);
                          onClose();
                        }}
                        className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-[#F5F3EF] text-left transition-colors text-xs text-[#292724]"
                      >
                        <div className="flex items-center gap-2.5">
                          <FileText className="w-4 h-4 text-[#292724]" />
                          <div>
                            <span className="font-semibold">{qt.quotationNumber}</span>
                            <span className="text-[#292724]/60 ml-2">{qt.customerName} · ₹{qt.grandTotal.toLocaleString('en-IN')}</span>
                          </div>
                        </div>
                        <span className="text-[11px] font-medium text-[#C66B45]">{qt.status}</span>
                      </button>
                    ))}
                  </div>
                )}

                {matchedInventory.length > 0 && (
                  <div>
                    <p className="px-2.5 py-1 text-[11px] font-semibold text-[#292724]/50 uppercase tracking-wider">Inventory</p>
                    {matchedInventory.map(item => (
                      <button
                        key={item.id}
                        onClick={() => {
                          onNavigate('inventory', item.id);
                          onClose();
                        }}
                        className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-[#F5F3EF] text-left transition-colors text-xs text-[#292724]"
                      >
                        <div className="flex items-center gap-2.5">
                          <Package className="w-4 h-4 text-[#DBBA95]" />
                          <div>
                            <span className="font-semibold">{item.name}</span>
                            <span className="text-[#292724]/60 ml-2">SKU: {item.sku}</span>
                          </div>
                        </div>
                        <span className="text-[11px] font-mono text-[#292724]">{item.quantity} {item.unit}</span>
                      </button>
                    ))}
                  </div>
                )}

                {matchedWarranties.length > 0 && (
                  <div>
                    <p className="px-2.5 py-1 text-[11px] font-semibold text-[#292724]/50 uppercase tracking-wider">Warranty Serials</p>
                    {matchedWarranties.map(w => (
                      <button
                        key={w.id}
                        onClick={() => {
                          onNavigate('warranties', w.serialNumber);
                          onClose();
                        }}
                        className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-[#F5F3EF] text-left transition-colors text-xs text-[#292724]"
                      >
                        <div className="flex items-center gap-2.5">
                          <ShieldCheck className="w-4 h-4 text-[#292724]" />
                          <div>
                            <span className="font-semibold font-mono">{w.serialNumber}</span>
                            <span className="text-[#292724]/60 ml-2">{w.customerName} · {w.productName}</span>
                          </div>
                        </div>
                        <span className="text-[11px] text-[#292724] font-medium">{w.status}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
