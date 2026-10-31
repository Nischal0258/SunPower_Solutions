import React, { useState, useEffect } from 'react';
import {
  MessageSquare,
  Search,
  Send,
  User,
  Phone,
  Mail,
  MapPin,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Layers,
  Sparkles,
  ExternalLink
} from 'lucide-react';
import { DataService } from '../../services/dataService';
import { HelpdeskTicket } from '../../types';
import { useToast } from '../common/Toast';

export const HelpdeskInboxView: React.FC = () => {
  const { showToast } = useToast();
  const [tickets, setTickets] = useState<HelpdeskTicket[]>(() => DataService.getHelpdeskTickets());
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(() => {
    const list = DataService.getHelpdeskTickets();
    return list[0]?.id || null;
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Open' | 'In Progress' | 'Resolved'>('All');
  const [replyText, setReplyText] = useState('');

  const refreshTickets = () => {
    const list = DataService.getHelpdeskTickets();
    setTickets(list);
    if (!selectedTicketId && list.length > 0) {
      setSelectedTicketId(list[0].id);
    }
  };

  useEffect(() => {
    refreshTickets();
    const handleUpdate = () => refreshTickets();
    window.addEventListener('sunpower_data_updated', handleUpdate);
    window.addEventListener('storage', handleUpdate);
    return () => {
      window.removeEventListener('sunpower_data_updated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, []);

  const selectedTicket = tickets.find(t => t.id === selectedTicketId) || tickets[0];

  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || !selectedTicket) return;

    const text = replyText.trim();
    setReplyText('');

    DataService.sendHelpdeskMessage(selectedTicket.id, {
      sender: 'agent',
      senderName: 'Rohan Mehra (Support Lead)',
      text
    });

    showToast(`Reply sent to ${selectedTicket.customerName}.`, 'success');
    refreshTickets();
  };

  const handleQuickTemplate = (template: string) => {
    setReplyText(template);
  };

  const handleStatusChange = (newStatus: 'Open' | 'In Progress' | 'Resolved') => {
    if (!selectedTicket) return;
    DataService.updateHelpdeskTicketStatus(selectedTicket.id, newStatus);
    showToast(`Ticket #${selectedTicket.id} updated to ${newStatus}.`, 'info');
    refreshTickets();
  };

  const filteredTickets = tickets.filter(t => {
    const q = searchQuery.toLowerCase();
    const matchesSearch = 
      t.id.toLowerCase().includes(q) ||
      t.customerName.toLowerCase().includes(q) ||
      t.subject.toLowerCase().includes(q) ||
      t.category.toLowerCase().includes(q);
    const matchesStatus = statusFilter === 'All' || t.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 text-xs font-sans">
      {/* Left Column: Live Customer Conversations List */}
      <div className="lg:col-span-5 bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="font-bold text-sm text-slate-900">Incoming Customer Conversations</h3>
            <p className="text-[11px] text-slate-500">Real-time inquiries submitted via Customer Portal chat</p>
          </div>
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#C66B45]/15 text-[#C66B45]">
            {filteredTickets.length} Conversations
          </span>
        </div>

        {/* Search & Filter Bar */}
        <div className="space-y-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by customer name, ticket # or issue..."
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-[#C66B45]"
            />
          </div>

          <div className="flex items-center gap-1.5">
            {(['All', 'Open', 'In Progress', 'Resolved'] as const).map(st => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-colors ${
                  statusFilter === st
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        {/* Conversation List */}
        <div className="space-y-2 max-h-[540px] overflow-y-auto pr-1">
          {filteredTickets.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              No conversations found matching filter.
            </div>
          ) : (
            filteredTickets.map((t) => {
              const isSelected = selectedTicket?.id === t.id;
              const lastMsg = t.messages[t.messages.length - 1];

              return (
                <div
                  key={t.id}
                  onClick={() => setSelectedTicketId(t.id)}
                  className={`p-3 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-[#C66B45]/5 border-[#C66B45] shadow-xs'
                      : 'bg-white border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-[#DBBA95] text-[#292724] font-bold text-xs flex items-center justify-center">
                        {t.customerName.split(' ').map(n => n[0]).join('').slice(0, 2)}
                      </div>
                      <div>
                        <h4 className="font-bold text-xs text-slate-900">{t.customerName}</h4>
                        <span className="text-[10px] text-slate-400 font-mono">{t.id}</span>
                      </div>
                    </div>

                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      t.status === 'Resolved'
                        ? 'bg-emerald-100 text-emerald-800'
                        : t.status === 'In Progress'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}>
                      {t.status}
                    </span>
                  </div>

                  <p className="font-semibold text-xs text-[#292724] mt-2 truncate">
                    {t.subject}
                  </p>

                  <p className="text-[11px] text-slate-500 mt-1 line-clamp-1">
                    {lastMsg ? `${lastMsg.senderName}: ${lastMsg.text}` : 'No messages'}
                  </p>

                  <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400 font-mono">
                    <span>Category: {t.category}</span>
                    <span>{t.messages.length} messages</span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Right Column: Customer Context & Conversation Workspace */}
      <div className="lg:col-span-7 bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between space-y-4">
        {selectedTicket ? (
          <>
            {/* Customer Context Card */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#292724] text-white flex items-center justify-center font-bold text-sm shadow-xs">
                    {selectedTicket.customerName.split(' ').map(n => n[0]).join('').slice(0, 2)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-sm text-slate-900">{selectedTicket.customerName}</h4>
                      <span className="font-mono text-xs text-slate-400">({selectedTicket.customerId})</span>
                    </div>
                    <p className="text-[11px] text-slate-600 mt-0.5">
                      {selectedTicket.customerAddress}
                    </p>
                  </div>
                </div>

                {/* Status Changer */}
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-slate-500 font-medium">Ticket Status:</span>
                  <select
                    value={selectedTicket.status}
                    onChange={(e) => handleStatusChange(e.target.value as any)}
                    className="px-2.5 py-1 text-xs rounded-lg border border-slate-200 bg-white font-semibold text-slate-800 focus:outline-none"
                  >
                    <option value="Open">Open</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Resolved">Resolved</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
                <div>
                  <span className="text-slate-400 block">Phone:</span>
                  <span className="font-bold text-slate-800 font-mono">{selectedTicket.customerPhone}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Email:</span>
                  <span className="font-bold text-slate-800 truncate block">{selectedTicket.customerEmail}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Active Order:</span>
                  <span className="font-bold text-[#C66B45] font-mono">{selectedTicket.orderId || 'ORD-2026-088'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Priority:</span>
                  <span className="font-bold text-slate-800">{selectedTicket.priority}</span>
                </div>
              </div>
            </div>

            {/* Conversation Transcript */}
            <div className="flex-1 min-h-[260px] max-h-[380px] overflow-y-auto p-3.5 rounded-xl bg-slate-50/60 border border-slate-200 space-y-3">
              {selectedTicket.messages.map((m) => {
                const isAgent = m.sender === 'agent';
                const isBot = m.sender === 'bot';

                return (
                  <div
                    key={m.id}
                    className={`flex flex-col ${isAgent ? 'items-end' : 'items-start'} space-y-1`}
                  >
                    <div className="flex items-center gap-2 text-[10px] text-slate-400">
                      <span className="font-semibold text-slate-600">{m.senderName}</span>
                      <span>•</span>
                      <span>{m.timestamp}</span>
                    </div>

                    <div
                      className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-xs shadow-2xs leading-relaxed ${
                        isAgent
                          ? 'bg-[#C66B45] text-white rounded-tr-xs'
                          : isBot
                          ? 'bg-amber-50 border border-amber-200 text-amber-900 rounded-tl-xs'
                          : 'bg-white border border-slate-200 text-slate-900 rounded-tl-xs'
                      }`}
                    >
                      {m.text}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Quick Replies & Agent Response Box */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <div className="flex items-center gap-1.5 overflow-x-auto text-[10px] pb-1">
                <span className="text-slate-400 shrink-0 font-medium">Quick Replies:</span>
                <button
                  type="button"
                  onClick={() => handleQuickTemplate("Hello! Our lead technician Rajesh has scheduled your site inspection for Tuesday morning at 10:30 AM.")}
                  className="px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 whitespace-nowrap transition-colors"
                >
                  Inspection scheduled for Tuesday
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickTemplate("National Portal DBT subsidy processing takes 30-45 business days following final DISCOM net-meter commissioning.")}
                  className="px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 whitespace-nowrap transition-colors"
                >
                  Subsidy DBT takes 30-45 days
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickTemplate("Our field team has dispatched replacement parts under your active 5-Year warranty.")}
                  className="px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 whitespace-nowrap transition-colors"
                >
                  Warranty dispatch initiated
                </button>
              </div>

              <form onSubmit={handleSendReply} className="flex gap-2">
                <input
                  type="text"
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder={`Type reply to ${selectedTicket.customerName}...`}
                  className="flex-1 px-3.5 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-[#C66B45]"
                />
                <button
                  type="submit"
                  disabled={!replyText.trim()}
                  className="px-4 py-2 rounded-xl bg-[#C66B45] hover:bg-[#C66B45]/90 disabled:opacity-40 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all shrink-0"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send Reply</span>
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="text-center py-24 text-slate-400">
            Select a conversation thread to view customer details and reply.
          </div>
        )}
      </div>
    </div>
  );
};
