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
  ShieldCheck
} from 'lucide-react';
import { DataService } from '../../services/dataService';
import { HelpdeskTicket, HelpdeskMessage, CustomerPersona } from '../../types';

interface CustomerSupportChatProps {
  currentCustomer: CustomerPersona;
  activeOrderId?: string;
}

export const CustomerSupportChat: React.FC<CustomerSupportChatProps> = ({
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
  }, [tickets, activeTicketId, isTyping]);

  const activeTicket = tickets.find(t => t.id === activeTicketId) || tickets[0];

  const handleQuickAction = (action: 'track' | 'subsidy' | 'technician' | 'fault') => {
    let subject = '';
    let category: 'Installation' | 'Subsidy' | 'Hardware Fault' | 'Technician' = 'General' as any;
    let initialMsg = '';
    let botReply = '';

    const orders = DataService.getCustomerOrders(currentCustomer.id);
    const activeOrder = orders[0];

    switch (action) {
      case 'track':
        subject = 'Track Active Solar Installation Status';
        category = 'Installation';
        initialMsg = `Please provide the current milestone status and expected visit date for my solar installation.`;
        botReply = activeOrder
          ? `Hello ${currentCustomer.name}! Your order ${activeOrder.id} is currently in the "${activeOrder.status}" milestone (${activeOrder.progressPercent}% complete). Assigned Technician: ${activeOrder.assignedTechnicianName || 'Rajesh & Team'} (${activeOrder.assignedTechnicianPhone || '+91 98600 55891'}). Next milestone: Hardware allocation & site execution.`
          : `Hello ${currentCustomer.name}! You do not currently have a pending installation. Click "Configure & Place Order" to begin your solar journey.`;
        break;

      case 'subsidy':
        subject = 'Government Solar Subsidy Status & DBT Timeline';
        category = 'Subsidy';
        initialMsg = `What is the status of my PM Surya Ghar subsidy application and when will DBT credit my account?`;
        botReply = `Under the PM Surya Ghar scheme, central subsidies (up to ₹78,000) are disbursed via Direct Benefit Transfer (DBT) directly into your Aadhaar-seeded bank account within 30 to 45 business days following final DISCOM net-meter inspection and commissioning. Our liaison team has submitted your documents.`;
        break;

      case 'technician':
        subject = 'Request On-Site Field Technician Visit';
        category = 'Technician';
        initialMsg = `I would like to schedule a field technician visit for site inspection / wiring audit.`;
        botReply = `Your service ticket has been created! Our Operations Lead has assigned Lead Technician Rajesh & Team (+91 98600 55891). A technician will call your registered contact (${currentCustomer.phone}) within 2 hours to confirm your preferred visit slot.`;
        break;

      case 'fault':
        subject = 'Report Inverter / Hardware Anomaly';
        category = 'Hardware Fault';
        initialMsg = `My solar inverter / equipment is indicating an anomaly or warning LED code.`;
        botReply = `Hardware anomaly ticket logged under 5-Year Priority Warranty! Please note the error code on the LCD display (e.g., Error 102 - Grid Voltage High). An engineer from SunPower RMA support will contact you shortly. Diagnostic visit is ₹0 under active warranty.`;
        break;
    }

    const newTicket = DataService.createHelpdeskTicket({
      customerId: currentCustomer.id,
      customerName: currentCustomer.name,
      customerEmail: currentCustomer.email,
      customerPhone: currentCustomer.phone,
      customerAddress: currentCustomer.address,
      orderId: activeOrderId || activeOrder?.id,
      subject,
      category,
      priority: action === 'fault' ? 'Urgent' : 'Normal',
      initialMessage: initialMsg
    });

    setActiveTicketId(newTicket.id);
    refreshTickets();

    // Auto-respond with helpful instant context
    setIsTyping(true);
    setTimeout(() => {
      DataService.sendHelpdeskMessage(newTicket.id, {
        sender: 'bot',
        senderName: 'SunPower Smart Bot',
        text: botReply
      });
      setIsTyping(false);
      refreshTickets();
    }, 800);
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const text = inputText.trim();
    setInputText('');

    if (activeTicket) {
      DataService.sendHelpdeskMessage(activeTicket.id, {
        sender: 'customer',
        senderName: currentCustomer.name,
        text
      });
      refreshTickets();

      // Bot acknowledgment if first reply
      if (activeTicket.messages.length === 1) {
        setIsTyping(true);
        setTimeout(() => {
          DataService.sendHelpdeskMessage(activeTicket.id, {
            sender: 'bot',
            senderName: 'SunPower Support',
            text: `Thank you, ${currentCustomer.name}. Your message has been dispatched to our Operations & Support desk (Ticket #${activeTicket.id}). An agent will reply directly here shortly.`
          });
          setIsTyping(false);
          refreshTickets();
        }, 1000);
      }
    } else {
      // Create new ticket
      const newTicket = DataService.createHelpdeskTicket({
        customerId: currentCustomer.id,
        customerName: currentCustomer.name,
        customerEmail: currentCustomer.email,
        customerPhone: currentCustomer.phone,
        customerAddress: currentCustomer.address,
        orderId: activeOrderId,
        subject: text.slice(0, 40) + '...',
        category: 'General',
        initialMessage: text
      });
      setActiveTicketId(newTicket.id);
      refreshTickets();
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 font-sans">
      {/* Floating Chat Trigger Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-2.5 px-4 py-3 rounded-full bg-[#292724] hover:bg-[#292724]/90 text-white shadow-xl hover:shadow-2xl transition-all duration-200 border border-[#DBBA95]/30 group hover:scale-[1.03]"
        >
          <div className="relative">
            <MessageSquare className="w-5 h-5 text-[#C66B45]" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-[#292724]" />
          </div>
          <div className="text-left hidden sm:block">
            <p className="text-xs font-bold leading-tight">Solar Support</p>
            <p className="text-[10px] text-[#DBBA95]/80 leading-tight">Helpdesk Online</p>
          </div>
        </button>
      )}

      {/* Floating Chat Window */}
      {isOpen && (
        <div className="w-[360px] sm:w-[400px] h-[540px] max-h-[85vh] bg-white rounded-2xl border border-[#E7E2D9] shadow-2xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-200">
          {/* Chat Header */}
          <div className="px-4 py-3 bg-[#292724] text-white flex items-center justify-between border-b border-[#292724]/80">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#C66B45] text-white flex items-center justify-center font-bold text-xs shadow-xs">
                SP
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h4 className="text-xs font-bold text-white leading-tight">SunPower Helpdesk</h4>
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                </div>
                <p className="text-[10px] text-[#DBBA95]/80 leading-tight">
                  {currentCustomer.name} • {currentCustomer.city}
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
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
              <span>Subsidy Queries</span>
            </button>

            <button
              onClick={() => handleQuickAction('technician')}
              className="px-2.5 py-1 rounded-full bg-white border border-slate-200 text-slate-700 hover:border-[#C66B45] hover:text-[#C66B45] whitespace-nowrap transition-colors flex items-center gap-1 shrink-0 font-medium"
            >
              <Wrench className="w-3 h-3 text-blue-600" />
              <span>Technician Visit</span>
            </button>

            <button
              onClick={() => handleQuickAction('fault')}
              className="px-2.5 py-1 rounded-full bg-white border border-slate-200 text-slate-700 hover:border-[#C66B45] hover:text-[#C66B45] whitespace-nowrap transition-colors flex items-center gap-1 shrink-0 font-medium"
            >
              <AlertTriangle className="w-3 h-3 text-rose-600" />
              <span>Hardware Fault</span>
            </button>
          </div>

          {/* Active Ticket Banner / Ticket Switcher */}
          {activeTicket && (
            <div className="px-3 py-1.5 bg-[#F5F3EF] border-b border-[#E7E2D9] flex items-center justify-between text-[10px]">
              <div className="flex items-center gap-1.5 font-mono">
                <span className="font-bold text-[#C66B45]">{activeTicket.id}</span>
                <span className="text-slate-400">•</span>
                <span className="text-slate-600 truncate max-w-[170px]">{activeTicket.subject}</span>
              </div>
              <span className={`px-2 py-0.5 rounded font-bold uppercase tracking-wider ${
                activeTicket.status === 'Resolved'
                  ? 'bg-emerald-100 text-emerald-800'
                  : activeTicket.status === 'In Progress'
                  ? 'bg-blue-100 text-blue-800'
                  : 'bg-amber-100 text-amber-800'
              }`}>
                {activeTicket.status}
              </span>
            </div>
          )}

          {/* Message Transcript Area */}
          <div className="flex-1 p-3.5 overflow-y-auto space-y-3 text-xs bg-slate-50/50">
            {(!activeTicket || activeTicket.messages.length === 0) ? (
              <div className="text-center py-10 text-slate-400 space-y-2">
                <MessageSquare className="w-8 h-8 mx-auto text-slate-300" />
                <p className="font-medium text-xs text-slate-600">How can we help your solar setup today?</p>
                <p className="text-[11px] text-slate-400 max-w-xs mx-auto">
                  Click a quick action above or type below to connect directly with SunPower operations.
                </p>
              </div>
            ) : (
              activeTicket.messages.map((msg) => {
                const isCustomer = msg.sender === 'customer';
                const isBot = msg.sender === 'bot';

                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${isCustomer ? 'items-end' : 'items-start'} space-y-1`}
                  >
                    <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
                      <span>{msg.senderName}</span>
                      <span>•</span>
                      <span>{msg.timestamp}</span>
                    </div>

                    <div
                      className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-xs shadow-2xs leading-relaxed ${
                        isCustomer
                          ? 'bg-[#C66B45] text-white rounded-tr-xs'
                          : isBot
                          ? 'bg-white border border-slate-200 text-slate-800 rounded-tl-xs'
                          : 'bg-[#292724] text-white rounded-tl-xs'
                      }`}
                    >
                      {msg.text}
                    </div>
                  </div>
                );
              })
            )}

            {isTyping && (
              <div className="flex items-center gap-1 text-[11px] text-slate-400 italic">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-pulse" />
                <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-pulse delay-100" />
                <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-pulse delay-200" />
                <span>Support assistant is formulating response...</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Chat Input Bar */}
          <form onSubmit={handleSendMessage} className="p-2.5 bg-white border-t border-[#E7E2D9] flex items-center gap-2">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Type your solar query..."
              className="flex-1 px-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#C66B45]"
            />

            <button
              type="submit"
              disabled={!inputText.trim()}
              className="p-2 rounded-xl bg-[#C66B45] hover:bg-[#C66B45]/90 disabled:opacity-40 text-white transition-all shadow-xs"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
