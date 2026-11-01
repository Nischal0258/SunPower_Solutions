import React, { useState, useEffect, useRef } from 'react';
import {
  MessageSquare,
  X,
  Send,
  HelpCircle,
  Truck,
  IndianRupee,
  Wrench,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Sparkles,
  User,
  ShieldCheck,
  Headphones,
  ArrowRight,
  Zap,
  Info
} from 'lucide-react';
import { DataService } from '../../services/dataService';
import { HelpdeskTicket, HelpdeskMessage, CustomerPersona } from '../../types';

interface AIChatbotWidgetProps {
  currentCustomer: CustomerPersona;
  activeOrderId?: string;
}

export const AIChatbotWidget: React.FC<AIChatbotWidgetProps> = ({
  currentCustomer,
  activeOrderId
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [tickets, setTickets] = useState<HelpdeskTicket[]>(() => 
    DataService.getHelpdeskTickets(currentCustomer.id)
  );
  const [activeTicketId, setActiveTicketId] = useState<string | null>(null);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const refreshTickets = () => {
    const list = DataService.getHelpdeskTickets(currentCustomer.id);
    setTickets(list);
    if (!activeTicketId && list.length > 0) {
      setActiveTicketId(list[0].id);
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
  }, [currentCustomer.id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [tickets, activeTicketId, isTyping, isOpen]);

  const activeTicket = tickets.find(t => t.id === activeTicketId) || tickets[0];
  const isEscalated = activeTicket?.status === 'Escalated to Support Staff' || activeTicket?.isAiEscalated;

  // AI Knowledge Base Answer Generator
  const generateAIResponse = (query: string): string => {
    const q = query.toLowerCase();
    const orders = DataService.getCustomerOrders(currentCustomer.id);
    const activeOrder = orders[0];

    // 1. Order status / tracking
    if (q.includes('order') || q.includes('status') || q.includes('track') || q.includes('progress') || q.includes('milestone')) {
      if (activeOrder) {
        return `Hello ${currentCustomer.name}! Your solar installation (Order ${activeOrder.id}) is currently in the "${activeOrder.status}" milestone (${activeOrder.progressPercent}% completed). Assigned Field Technician: ${activeOrder.assignedTechnicianName || 'Rajesh & Team'} (${activeOrder.assignedTechnicianPhone || '+91 98600 55891'}). Next milestone: Hardware allocation & site execution.`;
      }
      return `Hello ${currentCustomer.name}! You do not currently have a pending installation. You can configure your rooftop system in the portal to begin!`;
    }

    // 2. PM Surya Ghar subsidy
    if (q.includes('subsidy') || q.includes('pm surya') || q.includes('dbt') || q.includes('rebate') || q.includes('central')) {
      return `Under the PM Surya Ghar Muft Bijli Yojana, residential solar installations qualify for direct central subsidies: ₹30,000 for 1 kW, ₹60,000 for 2 kW, and up to ₹78,000 for 3 kW and higher. The subsidy is disbursed directly into your Aadhaar-linked bank account via DBT within 30 to 45 business days following DISCOM net-meter inspection and commissioning. Our liaison desk handles all portal documentation for you!`;
    }

    // 3. Technical specifications / hardware / panels / inverter / battery
    if (q.includes('panel') || q.includes('watt') || q.includes('mono perc') || q.includes('inverter') || q.includes('battery') || q.includes('hardware') || q.includes('spec')) {
      return `SunPower installations utilize Tier-1 Bifacial / Mono PERC 545W+ photovoltaic modules (21.8% efficiency, 25-year performance warranty), paired with smart hybrid sine-wave inverters (97.6% efficiency, IP65 weatherproof) and optional 5.12 kWh LiFePO4 wall-mount energy storage batteries designed for 6,000+ deep charge cycles.`;
    }

    // 4. Technician / site visit / survey
    if (q.includes('technician') || q.includes('visit') || q.includes('survey') || q.includes('schedule') || q.includes('engineer')) {
      return `Our field crew lead for your zone is Lead Technician Rajesh & Team (+91 98600 55891). For on-site technical roof measurements (azimuth, tilt angle, RCC anchor verification), surveys are typically scheduled within 24 to 48 hours of order confirmation.`;
    }

    // 5. Default intelligent assistant reply
    return `Thank you for your inquiry, ${currentCustomer.name}. SunPower AI provides real-time updates regarding your installation schedule, PM Surya Ghar subsidy documentation, and technical equipment specs. If you require direct assistance from our operations desk, simply click the "Connect to Staff" button above or type "connect to staff"!`;
  };

  // Human Staff Escalation Handler
  const handleEscalateToStaff = (customSubject?: string) => {
    const orders = DataService.getCustomerOrders(currentCustomer.id);
    const activeOrder = orders[0];

    const escalationMessages: Array<{
      id: string;
      sender: 'customer' | 'bot' | 'agent';
      senderName: string;
      text: string;
      timestamp: string;
    }> = activeTicket && activeTicket.messages.length > 0
      ? activeTicket.messages.map(m => ({ ...m }))
      : [
          {
            id: `msg-${Date.now()}-1`,
            sender: 'customer',
            senderName: currentCustomer.name,
            text: 'I requested to connect with human support staff regarding my solar project.',
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        ];

    // Add handover message
    escalationMessages.push({
      id: `msg-${Date.now()}-handover`,
      sender: 'bot',
      senderName: 'SunPower AI Assistant',
      text: `🔔 Handover Active: I've escalated your conversation along with full project context (Order: ${activeOrder?.id || 'Active'}, Phase: ${activeOrder?.status || 'Active'}) to our Support & Operations team. A staff specialist is reviewing your transcript and will reply directly here.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    });

    const escalatedTicket = DataService.escalateAIChat({
      customerId: currentCustomer.id,
      customerName: currentCustomer.name,
      customerEmail: currentCustomer.email,
      customerPhone: currentCustomer.phone,
      customerAddress: currentCustomer.address,
      orderId: activeOrderId || activeOrder?.id,
      projectPhase: activeOrder?.status || 'Active Site Execution',
      subject: customSubject || `AI Assistant Escalation - ${activeOrder?.status || 'Live Order Help'}`,
      messages: escalationMessages
    });

    setActiveTicketId(escalatedTicket.id);
    refreshTickets();
  };

  const handleQuickAction = (action: 'track' | 'subsidy' | 'specs' | 'escalate') => {
    if (action === 'escalate') {
      handleEscalateToStaff();
      return;
    }

    let subject = '';
    let category: 'Installation' | 'Subsidy' | 'Hardware Fault' | 'Technician' = 'General' as any;
    let initialMsg = '';
    let botReply = '';

    switch (action) {
      case 'track':
        subject = 'Track Active Solar Installation Status';
        category = 'Installation';
        initialMsg = `Please provide the current milestone status and expected visit date for my solar installation.`;
        botReply = generateAIResponse('track order status');
        break;

      case 'subsidy':
        subject = 'Government Solar Subsidy Status & DBT Timeline';
        category = 'Subsidy';
        initialMsg = `What is the status of my PM Surya Ghar subsidy application and when will DBT credit my account?`;
        botReply = generateAIResponse('pm surya ghar subsidy timeline');
        break;

      case 'specs':
        subject = 'Solar Equipment Technical Specifications & Warranty';
        category = 'Installation';
        initialMsg = `Could you share the technical specifications of the solar panels, hybrid inverter, and warranty?`;
        botReply = generateAIResponse('technical specs panel inverter battery');
        break;
    }

    const newTicket = DataService.createHelpdeskTicket({
      customerId: currentCustomer.id,
      customerName: currentCustomer.name,
      customerEmail: currentCustomer.email,
      customerPhone: currentCustomer.phone,
      customerAddress: currentCustomer.address,
      orderId: activeOrderId,
      subject,
      category,
      priority: 'Normal',
      initialMessage: initialMsg
    });

    setActiveTicketId(newTicket.id);
    refreshTickets();

    setIsTyping(true);
    setTimeout(() => {
      DataService.sendHelpdeskMessage(newTicket.id, {
        sender: 'bot',
        senderName: 'SunPower AI Assistant',
        text: botReply
      });
      setIsTyping(false);
      refreshTickets();
    }, 700);
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const userText = inputText.trim();
    setInputText('');

    // Check for NLP Staff Escalation trigger
    const lower = userText.toLowerCase();
    const isEscalationRequest = 
      lower.includes('connect to staff') || 
      lower.includes('connect to task') || 
      lower.includes('speak to agent') || 
      lower.includes('talk to human') || 
      lower.includes('human agent') || 
      lower.includes('support team') || 
      lower.includes('escalate');

    if (isEscalationRequest) {
      handleEscalateToStaff(`Customer Request: "${userText.slice(0, 35)}..."`);
      return;
    }

    if (activeTicket) {
      DataService.sendHelpdeskMessage(activeTicket.id, {
        sender: 'customer',
        senderName: currentCustomer.name,
        text: userText
      });
      refreshTickets();

      // If ticket is already escalated to staff, we do not auto-reply with bot
      if (activeTicket.status === 'Escalated to Support Staff') {
        return;
      }

      // Generate instant AI contextual reply
      setIsTyping(true);
      setTimeout(() => {
        const reply = generateAIResponse(userText);
        DataService.sendHelpdeskMessage(activeTicket.id, {
          sender: 'bot',
          senderName: 'SunPower AI Assistant',
          text: reply
        });
        setIsTyping(false);
        refreshTickets();
      }, 750);
    } else {
      // First message: Create ticket and auto-respond
      const newTicket = DataService.createHelpdeskTicket({
        customerId: currentCustomer.id,
        customerName: currentCustomer.name,
        customerEmail: currentCustomer.email,
        customerPhone: currentCustomer.phone,
        customerAddress: currentCustomer.address,
        orderId: activeOrderId,
        subject: userText.slice(0, 40) + '...',
        category: 'General',
        initialMessage: userText
      });
      setActiveTicketId(newTicket.id);
      refreshTickets();

      setIsTyping(true);
      setTimeout(() => {
        const reply = generateAIResponse(userText);
        DataService.sendHelpdeskMessage(newTicket.id, {
          sender: 'bot',
          senderName: 'SunPower AI Assistant',
          text: reply
        });
        setIsTyping(false);
        refreshTickets();
      }, 750);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 font-sans">
      {/* Floating Chat Trigger Launcher Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-3 px-4 py-3 rounded-full bg-[#292724] hover:bg-[#292724]/90 text-white shadow-xl hover:shadow-2xl transition-all duration-200 border border-[#DBBA95]/40 group hover:scale-[1.03]"
        >
          <div className="relative">
            <div className="w-8 h-8 rounded-full bg-[#C66B45] flex items-center justify-center text-white">
              <Sparkles className="w-4 h-4 animate-spin-slow" />
            </div>
            <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-[#292724]" />
          </div>
          <div className="text-left hidden sm:block">
            <p className="text-xs font-bold leading-tight flex items-center gap-1.5">
              <span>Solar AI Assistant</span>
              <span className="text-[9px] px-1.5 py-0.2 rounded bg-[#DBBA95]/20 text-[#DBBA95] font-semibold">24/7</span>
            </p>
            <p className="text-[10px] text-slate-300 leading-tight">Instant Answers & Staff Escalation</p>
          </div>
        </button>
      )}

      {/* Floating Chat Window */}
      {isOpen && (
        <div className="w-[360px] sm:w-[420px] h-[560px] max-h-[85vh] bg-white rounded-2xl border border-[#E7E2D9] shadow-2xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-200">
          {/* Chat Header */}
          <div className="px-4 py-3 bg-[#292724] text-white flex items-center justify-between border-b border-[#292724]/80">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#C66B45] text-white flex items-center justify-center font-bold text-xs shadow-xs">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h4 className="text-xs font-bold text-white leading-tight">SunPower AI Assistant</h4>
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                </div>
                <p className="text-[10px] text-[#DBBA95]/80 leading-tight">
                  {currentCustomer.name} • {currentCustomer.city || 'Active Portal'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Persistent Connect to Staff Button */}
              <button
                type="button"
                onClick={() => handleEscalateToStaff()}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all shadow-xs ${
                  isEscalated
                    ? 'bg-emerald-600 text-white cursor-default'
                    : 'bg-[#C66B45] hover:bg-[#C66B45]/90 text-white hover:scale-[1.02]'
                }`}
                title="Escalate chat transcript directly to human support staff"
              >
                <Headphones className="w-3 h-3" />
                <span>{isEscalated ? 'Staff Connected' : 'Connect to Staff'}</span>
              </button>

              <button
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors"
                aria-label="Close Assistant"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Quick Action Pills Strip */}
          <div className="p-2.5 bg-slate-50 border-b border-slate-200 flex items-center gap-1.5 overflow-x-auto text-[11px]">
            <button
              onClick={() => handleQuickAction('track')}
              className="px-2.5 py-1 rounded-full bg-white border border-slate-200 text-slate-700 hover:border-[#C66B45] hover:text-[#C66B45] whitespace-nowrap transition-colors flex items-center gap-1 shrink-0 font-medium"
            >
              <Truck className="w-3 h-3 text-[#C66B45]" />
              <span>Track Installation</span>
            </button>

            <button
              onClick={() => handleQuickAction('subsidy')}
              className="px-2.5 py-1 rounded-full bg-white border border-slate-200 text-slate-700 hover:border-[#C66B45] hover:text-[#C66B45] whitespace-nowrap transition-colors flex items-center gap-1 shrink-0 font-medium"
            >
              <IndianRupee className="w-3 h-3 text-emerald-600" />
              <span>PM Surya Ghar</span>
            </button>

            <button
              onClick={() => handleQuickAction('specs')}
              className="px-2.5 py-1 rounded-full bg-white border border-slate-200 text-slate-700 hover:border-[#C66B45] hover:text-[#C66B45] whitespace-nowrap transition-colors flex items-center gap-1 shrink-0 font-medium"
            >
              <Zap className="w-3 h-3 text-amber-600" />
              <span>Equipment Specs</span>
            </button>

            <button
              onClick={() => handleQuickAction('escalate')}
              className="px-2.5 py-1 rounded-full bg-rose-50 border border-rose-200 text-rose-700 hover:bg-rose-100 whitespace-nowrap transition-colors flex items-center gap-1 shrink-0 font-bold"
            >
              <Headphones className="w-3 h-3 text-rose-600" />
              <span>Connect Staff</span>
            </button>
          </div>

          {/* Escalation Status Banner */}
          {isEscalated && (
            <div className="px-3 py-1.5 bg-emerald-50 border-b border-emerald-200 flex items-center justify-between text-[11px] text-emerald-800 animate-in fade-in">
              <div className="flex items-center gap-1.5 font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Escalated to Support Staff • Live Handover Active</span>
              </div>
              <span className="font-mono text-[10px] text-emerald-700">{activeTicket?.id}</span>
            </div>
          )}

          {/* Message Transcript Area */}
          <div className="flex-1 p-3.5 overflow-y-auto space-y-3 text-xs bg-slate-50/50">
            {(!activeTicket || activeTicket.messages.length === 0) ? (
              <div className="text-center py-10 text-slate-400 space-y-2">
                <Sparkles className="w-8 h-8 mx-auto text-[#C66B45]/50 animate-pulse" />
                <p className="font-medium text-xs text-slate-700">How can SunPower AI assist you today?</p>
                <p className="text-[11px] text-slate-400 max-w-xs mx-auto">
                  Ask about your installation status, PM Surya Ghar subsidy timeline, or click "Connect to Staff" for a human specialist.
                </p>
              </div>
            ) : (
              activeTicket.messages.map((msg) => {
                const isCustomer = msg.sender === 'customer';
                const isBot = msg.sender === 'bot';
                const isAgent = msg.sender === 'agent';

                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${isCustomer ? 'items-end' : 'items-start'} space-y-1`}
                  >
                    <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
                      <span className={`font-semibold ${isAgent ? 'text-blue-700' : isBot ? 'text-[#C66B45]' : 'text-slate-600'}`}>
                        {isAgent ? '👤 Support Staff' : isBot ? '✨ SunPower AI' : msg.senderName}
                      </span>
                      <span>•</span>
                      <span>{msg.timestamp}</span>
                    </div>

                    <div
                      className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-xs shadow-2xs leading-relaxed ${
                        isCustomer
                          ? 'bg-[#C66B45] text-white rounded-tr-xs'
                          : isAgent
                          ? 'bg-[#292724] text-white rounded-tl-xs border border-blue-400/30'
                          : 'bg-white border border-slate-200 text-slate-800 rounded-tl-xs'
                      }`}
                    >
                      {msg.text}
                    </div>
                  </div>
                );
              })
            )}

            {isTyping && (
              <div className="flex items-center gap-1.5 text-[11px] text-slate-400 italic">
                <Sparkles className="w-3.5 h-3.5 text-[#C66B45] animate-spin" />
                <span>SunPower AI is formulating response...</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Chat Input Form */}
          <form onSubmit={handleSendMessage} className="p-2.5 bg-white border-t border-[#E7E2D9] flex items-center gap-2">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Ask AI or type 'connect to staff'..."
              className="flex-1 px-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#C66B45]"
            />

            <button
              type="submit"
              disabled={!inputText.trim()}
              className="p-2 rounded-xl bg-[#C66B45] hover:bg-[#C66B45]/90 disabled:opacity-40 text-white transition-all shadow-xs cursor-pointer"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

// Aliased export for compatibility
export const CustomerSupportChat = AIChatbotWidget;
