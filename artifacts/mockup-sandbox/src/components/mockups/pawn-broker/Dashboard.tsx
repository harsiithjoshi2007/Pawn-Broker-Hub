import React from "react";
import { 
  LayoutDashboard, Users, FileText, CreditCard, BarChart3, Calculator, 
  Bell, Settings, LogOut, Search, Moon, Menu, ChevronRight, Gem,
  TrendingUp, TrendingDown, AlertTriangle, ArrowUpRight
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
        <a href="#" className="flex items-center gap-3 px-3 py-2 bg-[#D4A017] text-white rounded-md font-medium">
          <LayoutDashboard className="w-5 h-5" /> Dashboard
        </a>
        <a href="#" className="flex items-center gap-3 px-3 py-2 hover:bg-white/10 rounded-md font-medium transition-colors">
          <Users className="w-5 h-5" /> Customers
        </a>
        <div className="pt-2 pb-1">
          <a href="#" className="flex items-center justify-between px-3 py-2 hover:bg-white/10 rounded-md font-medium transition-colors">
            <div className="flex items-center gap-3">
              <FileText className="w-5 h-5" /> Loans
            </div>
            <ChevronRight className="w-4 h-4 opacity-50" />
          </a>
          <div className="ml-11 mt-1 flex flex-col gap-1 text-sm text-white/60">
            <a href="#" className="hover:text-white py-1">All Loans</a>
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
      
      <div className="mt-8 px-3">
        <div className="text-xs font-semibold text-white/40 uppercase tracking-wider px-3 mb-2">System</div>
        <nav className="space-y-1">
          <a href="#" className="flex items-center gap-3 px-3 py-2 hover:bg-white/10 rounded-md font-medium transition-colors">
            <Bell className="w-5 h-5" /> Notifications
            <span className="ml-auto bg-[#EF4444] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">5</span>
          </a>
          <a href="#" className="flex items-center gap-3 px-3 py-2 hover:bg-white/10 rounded-md font-medium transition-colors">
            <Settings className="w-5 h-5" /> Settings
          </a>
        </nav>
      </div>
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
      <div className="text-[#1E293B] font-semibold">Dashboard</div>
    </div>
    
    <div className="flex-1 max-w-xl mx-8">
      <div className="relative">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
        <input 
          type="text" 
          placeholder="Search customers, loans, receipts..." 
          className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-full py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-[#D4A017]/50 focus:border-[#D4A017] transition-all"
        />
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

export default function Dashboard() {
  return (
    <div className="flex min-h-screen bg-[#F8FAFC] font-sans text-[#1E293B]">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <TopNav />
        
        <main className="flex-1 p-6 overflow-y-auto">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
              <p className="text-sm text-[#64748B]">Wednesday, 9 July 2025</p>
            </div>
            <button className="bg-[#D4A017] hover:bg-[#c29112] text-white px-4 py-2 rounded-lg font-medium text-sm transition-colors shadow-sm flex items-center gap-2">
              <Gem className="w-4 h-4" /> New Gold Loan
            </button>
          </div>

          <div className="bg-[#FEF3C7] border border-[#FDE68A] rounded-lg p-4 mb-6 flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-3 text-[#B45309]">
              <AlertTriangle className="w-5 h-5" />
              <span className="font-medium text-sm">Complete your company profile to get started</span>
            </div>
            <button className="bg-white text-[#B45309] border border-[#FDE68A] hover:bg-[#FFFBEB] px-3 py-1.5 rounded-md text-sm font-medium transition-colors shadow-sm">
              Go to Settings
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            {[
              { title: "Total Active Loans", value: "247", trend: "↑12%", trendUp: true, icon: FileText, color: "bg-blue-50 text-blue-600" },
              { title: "Overdue Loans", value: "18", isDanger: true, icon: AlertTriangle, color: "bg-red-50 text-[#EF4444]" },
              { title: "Today's Collection", value: "₹1,24,500", trend: "↑8%", trendUp: true, icon: CreditCard, color: "bg-green-50 text-green-600" },
              { title: "Monthly Income", value: "₹8,67,000", icon: TrendingUp, color: "bg-emerald-50 text-[#10B981]" },
              { title: "Loan Portfolio", value: "₹42,50,000", icon: BarChart3, color: "bg-indigo-50 text-[#1E3A5F]" },
              { title: "Auction Loans", value: "4", isWarning: true, icon: AlertTriangle, color: "bg-orange-50 text-[#F59E0B]" }
            ].map((card, i) => (
              <div key={i} className="bg-white p-5 rounded-xl border border-[#E2E8F0] shadow-sm hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-2">
                  <p className="text-[#64748B] text-sm font-medium">{card.title}</p>
                  <div className={`p-2 rounded-lg ${card.color}`}>
                    <card.icon className="w-4 h-4" />
                  </div>
                </div>
                <div className="flex items-end gap-3">
                  <h3 className={`text-2xl font-bold ${card.isDanger ? 'text-[#EF4444]' : card.isWarning ? 'text-[#F59E0B]' : 'text-[#1E293B]'}`}>
                    {card.value}
                  </h3>
                  {card.trend && (
                    <span className={`text-xs font-medium mb-1 ${card.trendUp ? 'text-[#22C55E]' : 'text-[#EF4444]'}`}>
                      {card.trend}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="bg-white rounded-xl border border-[#E2E8F0] p-5 shadow-sm mb-6">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-semibold text-sm">Portfolio Split by Metal</h3>
              <div className="text-xs font-medium text-[#64748B]">Total: ₹42,50,000</div>
            </div>
            <div className="h-4 w-full bg-gray-100 rounded-full overflow-hidden flex shadow-inner">
              <div className="bg-[#D4A017] h-full" style={{ width: '73%' }}></div>
              <div className="bg-[#94A3B8] h-full" style={{ width: '27%' }}></div>
            </div>
            <div className="flex justify-between text-xs mt-2 font-medium">
              <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#D4A017]"></span> Gold (73%)</div>
              <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#94A3B8]"></span> Silver (27%)</div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-6 mb-6">
            <div className="col-span-2 bg-white rounded-xl border border-[#E2E8F0] shadow-sm p-5">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-semibold">Monthly Disbursement</h3>
                <select className="text-xs border border-[#E2E8F0] rounded p-1 text-[#64748B] bg-white">
                  <option>Last 6 Months</option>
                </select>
              </div>
              <div className="h-[200px] flex items-end justify-between gap-4 pt-4">
                {[
                  { month: 'Feb', h: '40%' }, { month: 'Mar', h: '65%' }, { month: 'Apr', h: '55%' },
                  { month: 'May', h: '80%' }, { month: 'Jun', h: '95%' }, { month: 'Jul', h: '70%' }
                ].map((bar, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-2">
                    <div className="w-full bg-[#E2E8F0] rounded-t-sm relative h-full flex items-end group">
                      <div 
                        className="w-full bg-gradient-to-t from-[#1E3A5F] to-[#3b6094] rounded-t-sm group-hover:from-[#D4A017] group-hover:to-[#ebd281] transition-colors" 
                        style={{ height: bar.h }}
                      ></div>
                    </div>
                    <span className="text-xs text-[#64748B] font-medium">{bar.month}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="col-span-1 bg-white rounded-xl border border-[#E2E8F0] shadow-sm p-5">
              <h3 className="font-semibold mb-6">Loan Status</h3>
              <div className="flex flex-col items-center justify-center">
                <div className="relative w-32 h-32 mb-6">
                  {/* Mock Donut Chart with CSS */}
                  <div className="absolute inset-0 rounded-full border-[12px] border-[#22C55E]" style={{ clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0 100%)' }}></div>
                  <div className="absolute inset-0 rounded-full border-[12px] border-[#EF4444]" style={{ clipPath: 'polygon(50% 50%, 100% 100%, 0 100%, 0 0)' }}></div>
                  <div className="absolute inset-0 rounded-full border-[12px] border-[#F59E0B]" style={{ clipPath: 'polygon(50% 50%, 0 0, 0 100%)' }}></div>
                  <div className="absolute inset-0 rounded-full border-[12px] border-[#64748B]" style={{ clipPath: 'polygon(50% 50%, 100% 0, 100% 50%)' }}></div>
                  <div className="absolute inset-2 bg-white rounded-full flex flex-col items-center justify-center">
                    <span className="text-lg font-bold">384</span>
                    <span className="text-[10px] text-[#64748B]">Total</span>
                  </div>
                </div>
                <div className="w-full space-y-2">
                  <div className="flex items-center justify-between text-xs"><div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-[#22C55E]"></div>Active</div><span className="font-medium">247</span></div>
                  <div className="flex items-center justify-between text-xs"><div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-[#EF4444]"></div>Overdue</div><span className="font-medium">18</span></div>
                  <div className="flex items-center justify-between text-xs"><div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-[#F59E0B]"></div>Auction</div><span className="font-medium">4</span></div>
                  <div className="flex items-center justify-between text-xs"><div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-[#64748B]"></div>Closed</div><span className="font-medium">115</span></div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-6">
            <div className="col-span-3 bg-white rounded-xl border border-[#E2E8F0] shadow-sm overflow-hidden">
              <div className="p-5 border-b border-[#E2E8F0] flex justify-between items-center">
                <h3 className="font-semibold">Recent Loans</h3>
                <a href="#" className="text-sm text-[#1E3A5F] hover:text-[#D4A017] font-medium transition-colors">View All</a>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-[#64748B] uppercase bg-[#F8FAFC] border-b border-[#E2E8F0]">
                    <tr>
                      <th className="px-5 py-3 font-semibold">Loan No.</th>
                      <th className="px-5 py-3 font-semibold">Customer</th>
                      <th className="px-5 py-3 font-semibold">Type</th>
                      <th className="px-5 py-3 font-semibold text-right">Principal</th>
                      <th className="px-5 py-3 font-semibold text-center">Status</th>
                      <th className="px-5 py-3 font-semibold">Due Date</th>
                      <th className="px-5 py-3 font-semibold text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-[#E2E8F0] hover:bg-[#F8FAFC] transition-colors">
                      <td className="px-5 py-3 font-mono font-medium text-[#1E3A5F]">GL-2024-00127</td>
                      <td className="px-5 py-3 font-medium">Priya Sharma</td>
                      <td className="px-5 py-3"><span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-amber-100 text-amber-800 border border-amber-200">Gold</span></td>
                      <td className="px-5 py-3 text-right font-medium">₹75,000</td>
                      <td className="px-5 py-3 text-center"><span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-[#DCFCE7] text-[#166534] border border-[#BBF7D0]">Active</span></td>
                      <td className="px-5 py-3 text-[#64748B]">15 Jul 2024</td>
                      <td className="px-5 py-3 text-center"><button className="text-[#1E3A5F] hover:bg-slate-100 p-1.5 rounded-md"><ArrowUpRight className="w-4 h-4" /></button></td>
                    </tr>
                    <tr className="border-b border-[#E2E8F0] bg-red-50/30 hover:bg-red-50 transition-colors">
                      <td className="px-5 py-3 font-mono font-medium text-[#1E3A5F]">GL-2024-00084</td>
                      <td className="px-5 py-3 font-medium">Ramesh Patel</td>
                      <td className="px-5 py-3"><span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-amber-100 text-amber-800 border border-amber-200">Gold</span></td>
                      <td className="px-5 py-3 text-right font-medium">₹1,50,000</td>
                      <td className="px-5 py-3 text-center"><span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-[#FEE2E2] text-[#991B1B] border border-[#FECACA]">Overdue</span></td>
                      <td className="px-5 py-3 text-[#EF4444] font-medium">02 Jul 2024</td>
                      <td className="px-5 py-3 text-center"><button className="text-[#1E3A5F] hover:bg-slate-100 p-1.5 rounded-md"><ArrowUpRight className="w-4 h-4" /></button></td>
                    </tr>
                    <tr className="border-b border-[#E2E8F0] hover:bg-[#F8FAFC] transition-colors">
                      <td className="px-5 py-3 font-mono font-medium text-[#1E3A5F]">SL-2024-00012</td>
                      <td className="px-5 py-3 font-medium">Anjali Desai</td>
                      <td className="px-5 py-3"><span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-800 border border-slate-200">Silver</span></td>
                      <td className="px-5 py-3 text-right font-medium">₹25,000</td>
                      <td className="px-5 py-3 text-center"><span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-[#DBEAFE] text-[#1E40AF] border border-[#BFDBFE]">Partially Paid</span></td>
                      <td className="px-5 py-3 text-[#64748B]">20 Aug 2024</td>
                      <td className="px-5 py-3 text-center"><button className="text-[#1E3A5F] hover:bg-slate-100 p-1.5 rounded-md"><ArrowUpRight className="w-4 h-4" /></button></td>
                    </tr>
                    <tr className="border-b border-[#E2E8F0] hover:bg-[#F8FAFC] transition-colors">
                      <td className="px-5 py-3 font-mono font-medium text-[#1E3A5F]">GL-2024-00128</td>
                      <td className="px-5 py-3 font-medium">Vikram Singh</td>
                      <td className="px-5 py-3"><span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-amber-100 text-amber-800 border border-amber-200">Gold</span></td>
                      <td className="px-5 py-3 text-right font-medium">₹4,20,000</td>
                      <td className="px-5 py-3 text-center"><span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-[#DCFCE7] text-[#166534] border border-[#BBF7D0]">Active</span></td>
                      <td className="px-5 py-3 text-[#64748B]">18 Jan 2025</td>
                      <td className="px-5 py-3 text-center"><button className="text-[#1E3A5F] hover:bg-slate-100 p-1.5 rounded-md"><ArrowUpRight className="w-4 h-4" /></button></td>
                    </tr>
                    <tr className="hover:bg-[#F8FAFC] transition-colors">
                      <td className="px-5 py-3 font-mono font-medium text-[#1E3A5F]">GL-2023-00405</td>
                      <td className="px-5 py-3 font-medium">Meena Kumari</td>
                      <td className="px-5 py-3"><span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-amber-100 text-amber-800 border border-amber-200">Gold</span></td>
                      <td className="px-5 py-3 text-right font-medium">₹60,000</td>
                      <td className="px-5 py-3 text-center"><span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-[#F1F5F9] text-[#475569] border border-[#E2E8F0]">Closed</span></td>
                      <td className="px-5 py-3 text-[#64748B]">-</td>
                      <td className="px-5 py-3 text-center"><button className="text-[#1E3A5F] hover:bg-slate-100 p-1.5 rounded-md"><ArrowUpRight className="w-4 h-4" /></button></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div className="col-span-1 bg-white rounded-xl border border-[#E2E8F0] shadow-sm p-5">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold">Upcoming Due Dates</h3>
              </div>
              <div className="space-y-4">
                {[
                  { name: "Rahul Verma", id: "GL-2024-00042", amt: "₹45,000", date: "Today" },
                  { name: "Sunita Devi", id: "GL-2024-00055", amt: "₹1,12,000", date: "Tomorrow", isWarning: true },
                  { name: "Kiran Patel", id: "SL-2024-00008", amt: "₹15,000", date: "12 Jul 2024" },
                  { name: "Mohammed Ali", id: "GL-2024-00061", amt: "₹2,50,000", date: "14 Jul 2024" }
                ].map((item, i) => (
                  <div key={i} className="flex justify-between items-center p-3 rounded-lg border border-[#E2E8F0] hover:border-[#cbd5e1] transition-colors cursor-pointer group">
                    <div>
                      <p className="text-sm font-semibold group-hover:text-[#1E3A5F]">{item.name}</p>
                      <p className="text-[10px] font-mono text-[#64748B] mt-0.5">{item.id}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-[#1E293B]">{item.amt}</p>
                      <p className={`text-[10px] font-medium mt-0.5 ${item.isWarning ? 'text-[#F59E0B]' : item.date === 'Today' ? 'text-[#EF4444]' : 'text-[#64748B]'}`}>{item.date}</p>
                    </div>
                  </div>
                ))}
              </div>
              <button className="w-full mt-4 py-2 border border-[#E2E8F0] rounded-lg text-sm font-medium text-[#1E3A5F] hover:bg-[#F8FAFC] transition-colors">
                View Calendar
              </button>
            </div>
          </div>

        </main>
      </div>
    </div>
  );
}
