import React from "react";
import { 
  LayoutDashboard, Users, FileText, CreditCard, BarChart3, Calculator, 
  Bell, Settings, LogOut, Search, Moon, Menu, ChevronRight, Gem,
  Filter, Download, ChevronDown, CheckCircle2, AlertTriangle, Eye, Printer, Edit, Trash2, ChevronLeft
} from "lucide-react";

const Sidebar = () => (
  <div className="w-[240px] flex-shrink-0 bg-[#1E3A5F] text-[rgba(255,255,255,0.85)] flex flex-col h-screen sticky top-0 font-sans">
    <div className="h-16 flex items-center px-6 border-b border-white/10">
      <div className="flex items-center gap-2">
        <Gem className="text-[#D4A017] w-6 h-6" />
        <span className="text-white font-bold text-lg">Pawn Broker</span>
      </div>
    </div>
    <div className="flex-1 overflow-y-auto py-4">
      <nav className="space-y-1 px-3">
        <a href="#" className="flex items-center gap-3 px-3 py-2 hover:bg-white/10 rounded-md font-medium transition-colors">
          <LayoutDashboard className="w-5 h-5" /> Dashboard
        </a>
        <a href="#" className="flex items-center gap-3 px-3 py-2 hover:bg-white/10 rounded-md font-medium transition-colors">
          <Users className="w-5 h-5" /> Customers
        </a>
        <div className="pt-2 pb-1">
          <a href="#" className="flex items-center justify-between px-3 py-2 bg-[#D4A017] text-white rounded-md font-medium">
            <div className="flex items-center gap-3">
              <FileText className="w-5 h-5" /> Loans
            </div>
            <ChevronDown className="w-4 h-4" />
          </a>
          <div className="ml-11 mt-1 flex flex-col gap-1 text-sm text-white/60">
            <a href="#" className="text-white font-medium py-1">All Loans</a>
            <a href="#" className="hover:text-white py-1">Active</a>
            <a href="#" className="text-[#EF4444] hover:text-[#EF4444] font-medium py-1">Overdue</a>
            <a href="#" className="hover:text-white py-1">Closed</a>
            <a href="#" className="text-[#F59E0B] hover:text-[#F59E0B] font-medium py-1">Auction</a>
            <a href="#" className="text-[#D4A017] hover:text-[#D4A017] font-medium py-1 mt-1">+ New Loan</a>
          </div>
        </div>
        <a href="#" className="flex items-center gap-3 px-3 py-2 hover:bg-white/10 rounded-md font-medium transition-colors">
          <CreditCard className="w-5 h-5" /> Payments
        </a>
        <a href="#" className="flex items-center gap-3 px-3 py-2 hover:bg-white/10 rounded-md font-medium transition-colors">
          <BarChart3 className="w-5 h-5" /> Reports
        </a>
        <a href="#" className="flex items-center gap-3 px-3 py-2 hover:bg-white/10 rounded-md font-medium transition-colors">
          <Calculator className="w-5 h-5" /> Calculator
        </a>
      </nav>
    </div>
    <div className="p-4 border-t border-white/10">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-[#D4A017] flex items-center justify-center text-white font-bold shadow-md">RK</div>
        <div className="flex-1 overflow-hidden">
          <p className="text-sm font-medium text-white truncate">Rajesh Kumar</p>
          <p className="text-xs text-[#D4A017] font-medium">Admin</p>
        </div>
        <button className="text-white/60 hover:text-white transition-colors">
          <LogOut className="w-5 h-5" />
        </button>
      </div>
    </div>
  </div>
);

const TopNav = () => (
  <div className="h-16 bg-white border-b border-[#E2E8F0] flex items-center justify-between px-6 sticky top-0 z-10 font-sans">
    <div className="flex items-center gap-4">
      <button className="text-[#64748B] hover:text-[#1E293B]">
        <Menu className="w-5 h-5" />
      </button>
      <div className="flex items-center gap-2 text-sm">
        <span className="text-[#64748B]">Loans</span>
        <ChevronRight className="w-4 h-4 text-[#94A3B8]" />
        <span className="text-[#1E293B] font-semibold">All Loans</span>
      </div>
    </div>
    
    <div className="flex items-center gap-5 text-[#64748B]">
      <button className="hover:text-[#1E293B] transition-colors"><Moon className="w-5 h-5" /></button>
      <button className="hover:text-[#1E293B] transition-colors relative">
        <Bell className="w-5 h-5" />
        <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#EF4444] rounded-full text-[9px] font-bold text-white flex items-center justify-center border-2 border-white">5</span>
      </button>
      <div className="w-8 h-8 rounded-full bg-[#D4A017] flex items-center justify-center text-white font-bold text-sm cursor-pointer shadow-sm">RK</div>
    </div>
  </div>
);

export default function LoanList() {
  const loans = [
    { id: "GL-2024-00127", customer: "Priya Sharma", type: "Gold", typeIcon: "🥇", principal: "₹75,000", rate: "2%", date: "15 Jul 2024", status: "Active", overdue: "-", action: "view" },
    { id: "GL-2024-00126", customer: "Vikram Singh", type: "Gold", typeIcon: "🥇", principal: "₹4,20,000", rate: "1.5%", date: "18 Jan 2025", status: "Active", overdue: "-", action: "view" },
    { id: "GL-2024-00084", customer: "Ramesh Patel", type: "Gold", typeIcon: "🥇", principal: "₹1,50,000", rate: "2%", date: "02 Jul 2024", status: "Overdue", overdue: "7 days", action: "view" },
    { id: "SL-2024-00012", customer: "Anjali Desai", type: "Silver", typeIcon: "🥈", principal: "₹25,000", rate: "3%", date: "20 Aug 2024", status: "Partially Paid", overdue: "-", action: "view" },
    { id: "GL-2024-00080", customer: "Mohammed Ali", type: "Gold", typeIcon: "🥇", principal: "₹2,50,000", rate: "1.8%", date: "14 Jul 2024", status: "Active", overdue: "-", action: "view" },
    { id: "GL-2024-00055", customer: "Sunita Devi", type: "Gold", typeIcon: "🥇", principal: "₹1,12,000", rate: "2%", date: "10 Jul 2024", status: "Overdue", overdue: "1 day", action: "view" },
    { id: "SL-2024-00008", customer: "Kiran Patel", type: "Silver", typeIcon: "🥈", principal: "₹15,000", rate: "3%", date: "12 Jul 2024", status: "Active", overdue: "-", action: "view" },
    { id: "GL-2023-00405", customer: "Meena Kumari", type: "Gold", typeIcon: "🥇", principal: "₹60,000", rate: "2%", date: "-", status: "Closed", overdue: "-", action: "view" },
    { id: "GL-2024-00110", customer: "Rahul Verma", type: "Gold", typeIcon: "🥇", principal: "₹45,000", rate: "2%", date: "09 Jul 2024", status: "Active", overdue: "-", action: "view" },
    { id: "SL-2024-00005", customer: "Neha Gupta", type: "Silver", typeIcon: "🥈", principal: "₹8,500", rate: "3%", date: "25 Jul 2024", status: "Partially Paid", overdue: "-", action: "view" },
  ];

  return (
    <div className="flex min-h-screen bg-[#F8FAFC] font-sans text-[#1E293B]">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <TopNav />
        
        <main className="flex-1 p-6 overflow-y-auto">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold tracking-tight">Loans</h1>
            <div className="flex items-center gap-3">
              <button className="bg-white border border-[#E2E8F0] hover:bg-[#F8FAFC] text-[#1E3A5F] px-4 py-2 rounded-lg font-medium text-sm transition-colors shadow-sm flex items-center gap-2">
                <Download className="w-4 h-4" /> Export
                <ChevronDown className="w-3 h-3 ml-1" />
              </button>
              <button className="bg-[#D4A017] hover:bg-[#c29112] text-white px-4 py-2 rounded-lg font-medium text-sm transition-colors shadow-sm flex items-center gap-2">
                <Gem className="w-4 h-4" /> New Loan
              </button>
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-[#E2E8F0] shadow-sm mb-4 flex flex-wrap gap-4 items-end">
            <div className="flex-1 min-w-[200px]">
              <label className="block text-xs font-medium text-[#64748B] mb-1">Search</label>
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
                <input 
                  type="text" 
                  placeholder="Loan No, Customer, Phone..." 
                  className="w-full border border-[#E2E8F0] rounded-lg py-2 pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#D4A017] focus:border-transparent transition-all"
                />
              </div>
            </div>
            <div className="w-[150px]">
              <label className="block text-xs font-medium text-[#64748B] mb-1">Status</label>
              <div className="relative">
                <select className="w-full border border-[#E2E8F0] rounded-lg py-2 pl-3 pr-8 text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-[#D4A017] bg-white cursor-pointer">
                  <option>All Statuses</option>
                  <option>Active</option>
                  <option>Overdue</option>
                  <option>Partially Paid</option>
                  <option>Closed</option>
                  <option>Auction</option>
                </select>
                <ChevronDown className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-[#94A3B8] pointer-events-none" />
              </div>
            </div>
            <div className="w-[150px]">
              <label className="block text-xs font-medium text-[#64748B] mb-1">Type</label>
              <div className="relative">
                <select className="w-full border border-[#E2E8F0] rounded-lg py-2 pl-3 pr-8 text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-[#D4A017] bg-white cursor-pointer">
                  <option>All Types</option>
                  <option>Gold Loan</option>
                  <option>Silver Loan</option>
                </select>
                <ChevronDown className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-[#94A3B8] pointer-events-none" />
              </div>
            </div>
            <div className="w-[200px]">
              <label className="block text-xs font-medium text-[#64748B] mb-1">Date Range</label>
              <input 
                type="date" 
                className="w-full border border-[#E2E8F0] rounded-lg py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#D4A017] bg-white text-[#64748B]"
              />
            </div>
            <button className="border border-[#E2E8F0] hover:bg-[#F8FAFC] text-[#64748B] px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2">
              <Filter className="w-4 h-4" /> More Filters
            </button>
          </div>

          <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-sm overflow-hidden flex flex-col">
            <div className="bg-[#F8FAFC] px-5 py-2.5 border-b border-[#E2E8F0] flex justify-between items-center text-sm">
              <div className="flex items-center gap-3">
                <input type="checkbox" className="w-4 h-4 rounded border-[#E2E8F0] text-[#1E3A5F] focus:ring-[#1E3A5F]" />
                <span className="text-[#64748B] font-medium">Select All</span>
              </div>
              <div className="flex items-center gap-2 opacity-50 pointer-events-none">
                <button className="text-xs font-medium px-3 py-1.5 border border-[#E2E8F0] rounded bg-white flex items-center gap-1"><Printer className="w-3 h-3" /> Print Selected</button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-[#64748B] uppercase bg-white border-b border-[#E2E8F0]">
                  <tr>
                    <th className="px-5 py-3 w-12"></th>
                    <th className="px-5 py-3 font-semibold cursor-pointer group">Loan No. <ChevronDown className="w-3 h-3 inline opacity-0 group-hover:opacity-100 transition-opacity" /></th>
                    <th className="px-5 py-3 font-semibold cursor-pointer group">Customer <ChevronDown className="w-3 h-3 inline opacity-0 group-hover:opacity-100 transition-opacity" /></th>
                    <th className="px-5 py-3 font-semibold">Type</th>
                    <th className="px-5 py-3 font-semibold text-right cursor-pointer group">Principal <ChevronDown className="w-3 h-3 inline opacity-0 group-hover:opacity-100 transition-opacity" /></th>
                    <th className="px-5 py-3 font-semibold text-right">Int. Rate</th>
                    <th className="px-5 py-3 font-semibold cursor-pointer group">Due Date <ChevronDown className="w-3 h-3 inline opacity-0 group-hover:opacity-100 transition-opacity" /></th>
                    <th className="px-5 py-3 font-semibold text-center">Status</th>
                    <th className="px-5 py-3 font-semibold text-center">Overdue</th>
                    <th className="px-5 py-3 font-semibold text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loans.map((loan, idx) => (
                    <tr key={idx} className={`border-b border-[#E2E8F0] hover:bg-[#F8FAFC] transition-colors ${loan.status === 'Overdue' ? 'bg-red-50/20' : ''}`}>
                      <td className="px-5 py-3"><input type="checkbox" className="w-4 h-4 rounded border-[#E2E8F0] text-[#1E3A5F] focus:ring-[#1E3A5F]" /></td>
                      <td className="px-5 py-3 font-mono font-medium text-[#1E3A5F] hover:underline cursor-pointer">{loan.id}</td>
                      <td className="px-5 py-3 font-medium">{loan.customer}</td>
                      <td className="px-5 py-3">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium border ${loan.type === 'Gold' ? 'bg-amber-100 text-amber-800 border-amber-200' : 'bg-slate-100 text-slate-800 border-slate-200'}`}>
                          {loan.typeIcon} {loan.type}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-right font-semibold">{loan.principal}</td>
                      <td className="px-5 py-3 text-right text-[#64748B]">{loan.rate}</td>
                      <td className={`px-5 py-3 font-medium ${loan.status === 'Overdue' ? 'text-[#EF4444]' : 'text-[#64748B]'}`}>{loan.date}</td>
                      <td className="px-5 py-3 text-center">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium border
                          ${loan.status === 'Active' ? 'bg-[#DCFCE7] text-[#166534] border-[#BBF7D0]' : ''}
                          ${loan.status === 'Overdue' ? 'bg-[#FEE2E2] text-[#991B1B] border-[#FECACA]' : ''}
                          ${loan.status === 'Partially Paid' ? 'bg-[#DBEAFE] text-[#1E40AF] border-[#BFDBFE]' : ''}
                          ${loan.status === 'Closed' ? 'bg-[#F1F5F9] text-[#475569] border-[#E2E8F0]' : ''}
                        `}>
                          {loan.status}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-center font-medium text-[#EF4444]">{loan.overdue}</td>
                      <td className="px-5 py-3 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button className="text-[#64748B] hover:text-[#1E3A5F] p-1.5 rounded-md hover:bg-slate-100 transition-colors" title="View Details"><Eye className="w-4 h-4" /></button>
                          <button className="text-[#64748B] hover:text-[#1E3A5F] p-1.5 rounded-md hover:bg-slate-100 transition-colors" title="Print Receipt"><Printer className="w-4 h-4" /></button>
                          <button className="text-[#64748B] hover:text-[#D4A017] p-1.5 rounded-md hover:bg-slate-100 transition-colors" title="Edit"><Edit className="w-4 h-4" /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            <div className="p-4 border-t border-[#E2E8F0] flex items-center justify-between bg-white text-sm">
              <span className="text-[#64748B]">Showing <span className="font-medium text-[#1E293B]">1-10</span> of <span className="font-medium text-[#1E293B]">247</span> loans</span>
              <div className="flex items-center gap-1">
                <button className="p-1.5 border border-[#E2E8F0] rounded-md text-[#64748B] hover:bg-[#F8FAFC] disabled:opacity-50"><ChevronLeft className="w-4 h-4" /></button>
                <button className="w-8 h-8 border border-[#1E3A5F] bg-[#1E3A5F] text-white rounded-md font-medium">1</button>
                <button className="w-8 h-8 border border-[#E2E8F0] hover:bg-[#F8FAFC] text-[#1E293B] rounded-md font-medium">2</button>
                <button className="w-8 h-8 border border-[#E2E8F0] hover:bg-[#F8FAFC] text-[#1E293B] rounded-md font-medium">3</button>
                <span className="px-2 text-[#64748B]">...</span>
                <button className="w-8 h-8 border border-[#E2E8F0] hover:bg-[#F8FAFC] text-[#1E293B] rounded-md font-medium">25</button>
                <button className="p-1.5 border border-[#E2E8F0] rounded-md text-[#64748B] hover:bg-[#F8FAFC]"><ChevronRight className="w-4 h-4" /></button>
              </div>
            </div>
          </div>

        </main>
      </div>
    </div>
  );
}
