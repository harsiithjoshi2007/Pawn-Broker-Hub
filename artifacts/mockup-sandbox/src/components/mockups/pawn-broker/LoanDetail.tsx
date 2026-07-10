import React from "react";
import { 
  LayoutDashboard, Users, FileText, CreditCard, BarChart3, Calculator, 
  Bell, Settings, LogOut, Search, Moon, Menu, ChevronRight, Gem,
  Download, CheckCircle2, ChevronDown, ArrowLeft, Printer, AlertCircle, FileCheck, RefreshCw, XCircle, Clock
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
        </div>
        <a href="#" className="flex items-center gap-3 px-3 py-2 hover:bg-white/10 rounded-md font-medium transition-colors">
          <CreditCard className="w-5 h-5" /> Payments
        </a>
        <a href="#" className="flex items-center gap-3 px-3 py-2 hover:bg-white/10 rounded-md font-medium transition-colors">
          <BarChart3 className="w-5 h-5" /> Reports
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
      </div>
    </div>
  </div>
);

const TopNav = () => (
  <div className="h-16 bg-white border-b border-[#E2E8F0] flex items-center justify-between px-6 sticky top-0 z-10 font-sans">
    <div className="flex items-center gap-4">
      <button className="text-[#64748B] hover:text-[#1E293B]"><Menu className="w-5 h-5" /></button>
      <div className="flex items-center gap-2 text-sm">
        <span className="text-[#64748B]">Loans</span>
        <ChevronRight className="w-4 h-4 text-[#94A3B8]" />
        <span className="text-[#1E293B] font-semibold">GL-2024-00127</span>
      </div>
    </div>
    <div className="flex items-center gap-5 text-[#64748B]">
      <div className="w-8 h-8 rounded-full bg-[#D4A017] flex items-center justify-center text-white font-bold text-sm cursor-pointer shadow-sm">RK</div>
    </div>
  </div>
);

export default function LoanDetail() {
  return (
    <div className="flex min-h-screen bg-[#F8FAFC] font-sans text-[#1E293B]">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <TopNav />
        
        <main className="flex-1 p-6 overflow-y-auto max-w-6xl mx-auto w-full">
          <button className="text-[#64748B] hover:text-[#1E3A5F] flex items-center gap-1.5 text-sm font-medium mb-4 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to Loans
          </button>

          <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-sm mb-6 p-6">
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-6">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-2xl font-bold font-mono text-[#1E3A5F] tracking-tight">GL-2024-00127</h1>
                  <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold bg-[#DCFCE7] text-[#166534] border border-[#BBF7D0]">
                    <CheckCircle2 className="w-3 h-3 mr-1" /> Active
                  </span>
                </div>
                <div className="flex items-center gap-4 text-sm text-[#64748B]">
                  <span className="flex items-center gap-1.5"><Users className="w-4 h-4" /> Customer: <a href="#" className="text-[#1E3A5F] font-medium hover:underline">Priya Sharma</a></span>
                  <span className="text-[#E2E8F0]">|</span>
                  <span className="flex items-center gap-1.5"><Gem className="w-4 h-4 text-[#D4A017]" /> Gold Loan</span>
                  <span className="text-[#E2E8F0]">|</span>
                  <span className="flex items-center gap-1.5"><Clock className="w-4 h-4" /> Created: 15 Jan 2024</span>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <button className="bg-white border border-[#E2E8F0] hover:bg-[#F8FAFC] text-[#1E3A5F] px-4 py-2 rounded-lg font-medium text-sm transition-colors shadow-sm flex items-center gap-2">
                  <Printer className="w-4 h-4" /> Print
                </button>
                <button className="bg-white border border-[#E2E8F0] hover:bg-[#F8FAFC] text-[#1E3A5F] px-4 py-2 rounded-lg font-medium text-sm transition-colors shadow-sm flex items-center gap-2">
                  <Download className="w-4 h-4" /> Agreement
                </button>
                <button className="bg-white border border-[#E2E8F0] hover:bg-[#F8FAFC] text-[#1E3A5F] px-4 py-2 rounded-lg font-medium text-sm transition-colors shadow-sm flex items-center gap-2">
                  <RefreshCw className="w-4 h-4" /> Renew
                </button>
                <button className="bg-[#D4A017] hover:bg-[#c29112] text-white px-5 py-2 rounded-lg font-medium text-sm transition-colors shadow-sm flex items-center gap-2 ml-2">
                  <CreditCard className="w-4 h-4" /> Record Payment
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div className="bg-[#F8FAFC] p-4 rounded-lg border border-[#E2E8F0]">
                <p className="text-xs font-medium text-[#64748B] mb-1">Principal Amount</p>
                <p className="text-2xl font-bold text-[#1E293B]">₹75,000</p>
                <div className="mt-3 flex justify-between text-sm">
                  <span className="text-[#64748B]">Interest Rate</span>
                  <span className="font-medium text-[#1E293B]">2% / month (Simple)</span>
                </div>
                <div className="mt-1 flex justify-between text-sm">
                  <span className="text-[#64748B]">Duration</span>
                  <span className="font-medium text-[#1E293B]">6 months</span>
                </div>
              </div>
              
              <div className="bg-[#F8FAFC] p-4 rounded-lg border border-[#E2E8F0]">
                <p className="text-xs font-medium text-[#64748B] mb-1">Outstanding Balance</p>
                <p className="text-2xl font-bold text-[#EF4444]">₹82,500</p>
                <div className="mt-3 flex justify-between text-sm">
                  <span className="text-[#64748B]">Due Date</span>
                  <span className="font-medium text-[#1E293B]">15 Jul 2024</span>
                </div>
                <div className="mt-1 flex justify-between text-sm">
                  <span className="text-[#64748B]">Expiry Date</span>
                  <span className="font-medium text-[#1E293B]">15 Aug 2024</span>
                </div>
              </div>

              <div className="bg-[#F8FAFC] p-4 rounded-lg border border-[#E2E8F0] flex flex-col justify-center">
                <div className="flex justify-between items-end mb-2">
                  <p className="text-xs font-medium text-[#64748B]">Repayment Progress</p>
                  <p className="text-xs font-bold text-[#1E3A5F]">9% Paid</p>
                </div>
                <div className="h-2.5 w-full bg-[#E2E8F0] rounded-full overflow-hidden mb-3">
                  <div className="h-full bg-[#22C55E] rounded-full" style={{ width: '9%' }}></div>
                </div>
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between"><span className="text-[#64748B]">Total Interest:</span><span className="font-medium">₹9,000</span></div>
                  <div className="flex justify-between"><span className="text-[#64748B]">Amount Paid:</span><span className="font-medium text-[#22C55E]">₹7,500</span></div>
                  <div className="flex justify-between border-t border-[#E2E8F0] pt-1 mt-1"><span className="text-[#64748B]">Remaining:</span><span className="font-bold text-[#1E293B]">₹76,500</span></div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-sm overflow-hidden">
                <div className="p-4 border-b border-[#E2E8F0] flex items-center gap-2">
                  <Gem className="w-5 h-5 text-[#D4A017]" />
                  <h3 className="font-semibold text-[#1E293B]">Pledged Jewellery Items</h3>
                  <span className="ml-auto text-xs font-medium bg-slate-100 px-2 py-1 rounded text-slate-600">2 Items</span>
                </div>
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-[#64748B] uppercase bg-[#F8FAFC] border-b border-[#E2E8F0]">
                    <tr>
                      <th className="px-4 py-3 font-semibold">Item</th>
                      <th className="px-4 py-3 font-semibold text-right">Gross Wt.</th>
                      <th className="px-4 py-3 font-semibold text-right">Net Wt.</th>
                      <th className="px-4 py-3 font-semibold text-center">Purity</th>
                      <th className="px-4 py-3 font-semibold text-right">Est. Value</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-[#E2E8F0]">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-amber-50 border border-amber-100 rounded-md flex items-center justify-center text-xl">📿</div>
                          <div>
                            <p className="font-medium text-[#1E293B]">Gold Necklace</p>
                            <p className="text-xs text-[#64748B]">Ornament</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right">25.00 g</td>
                      <td className="px-4 py-3 text-right font-medium">23.00 g</td>
                      <td className="px-4 py-3 text-center"><span className="inline-flex px-2 py-0.5 rounded text-[10px] font-medium bg-amber-100 text-amber-800">22K</span></td>
                      <td className="px-4 py-3 text-right font-semibold">₹60,000</td>
                    </tr>
                    <tr className="border-b border-[#E2E8F0]">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-amber-50 border border-amber-100 rounded-md flex items-center justify-center text-xl">💍</div>
                          <div>
                            <p className="font-medium text-[#1E293B]">Gold Bangle</p>
                            <p className="text-xs text-[#64748B]">Ornament</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right">14.00 g</td>
                      <td className="px-4 py-3 text-right font-medium">12.00 g</td>
                      <td className="px-4 py-3 text-center"><span className="inline-flex px-2 py-0.5 rounded text-[10px] font-medium bg-amber-100 text-amber-800">22K</span></td>
                      <td className="px-4 py-3 text-right font-semibold">₹31,000</td>
                    </tr>
                  </tbody>
                  <tfoot className="bg-[#F8FAFC] font-semibold text-[#1E293B]">
                    <tr>
                      <td className="px-4 py-3 text-right">Total:</td>
                      <td className="px-4 py-3 text-right">39.00 g</td>
                      <td className="px-4 py-3 text-right text-[#D4A017]">35.00 g</td>
                      <td></td>
                      <td className="px-4 py-3 text-right">₹91,000</td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-sm overflow-hidden">
                <div className="p-4 border-b border-[#E2E8F0] flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-[#1E3A5F]" />
                    <h3 className="font-semibold text-[#1E293B]">Payment History</h3>
                  </div>
                  <button className="text-sm font-medium text-[#1E3A5F] hover:text-[#D4A017]">View All Receipts</button>
                </div>
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-[#64748B] uppercase bg-[#F8FAFC] border-b border-[#E2E8F0]">
                    <tr>
                      <th className="px-4 py-3 font-semibold">Receipt No.</th>
                      <th className="px-4 py-3 font-semibold">Date</th>
                      <th className="px-4 py-3 font-semibold">Mode</th>
                      <th className="px-4 py-3 font-semibold text-right">Interest</th>
                      <th className="px-4 py-3 font-semibold text-right">Principal</th>
                      <th className="px-4 py-3 font-semibold text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-[#E2E8F0] hover:bg-[#F8FAFC]">
                      <td className="px-4 py-3 font-mono font-medium text-[#1E3A5F]">RCP-2024-00089</td>
                      <td className="px-4 py-3">20 Feb 2024</td>
                      <td className="px-4 py-3"><span className="inline-flex px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-800 border border-slate-200">Cash</span></td>
                      <td className="px-4 py-3 text-right">₹6,000</td>
                      <td className="px-4 py-3 text-right">₹1,500</td>
                      <td className="px-4 py-3 text-right font-bold text-[#22C55E]">₹7,500</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-sm p-4">
                <h3 className="font-semibold text-[#1E293B] mb-4 flex items-center gap-2"><AlertCircle className="w-4 h-4 text-[#64748B]"/> Quick Actions</h3>
                <div className="space-y-2">
                  <button className="w-full text-left px-4 py-3 border border-[#E2E8F0] rounded-lg hover:border-[#1E3A5F] hover:bg-[#F8FAFC] transition-colors group flex items-center justify-between">
                    <div>
                      <div className="font-medium text-[#1E293B] text-sm group-hover:text-[#1E3A5F]">Close Loan</div>
                      <div className="text-xs text-[#64748B] mt-0.5">Pay remaining ₹76,500 and release items</div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-[#94A3B8] group-hover:text-[#1E3A5F]" />
                  </button>
                  <button className="w-full text-left px-4 py-3 border border-[#E2E8F0] rounded-lg hover:border-[#1E3A5F] hover:bg-[#F8FAFC] transition-colors group flex items-center justify-between">
                    <div>
                      <div className="font-medium text-[#1E293B] text-sm group-hover:text-[#1E3A5F]">Send Notice</div>
                      <div className="text-xs text-[#64748B] mt-0.5">Send SMS/WhatsApp reminder</div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-[#94A3B8] group-hover:text-[#1E3A5F]" />
                  </button>
                </div>
              </div>

              <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-sm overflow-hidden">
                <div className="p-4 border-b border-[#E2E8F0]">
                  <h3 className="font-semibold text-[#1E293B]">Audit Trail</h3>
                </div>
                <div className="p-4">
                  <div className="relative border-l-2 border-[#E2E8F0] ml-3 pl-5 space-y-5">
                    <div className="relative">
                      <div className="absolute -left-[27px] bg-[#1E3A5F] w-3 h-3 rounded-full border-2 border-white ring-2 ring-[#1E3A5F]/20"></div>
                      <p className="text-xs text-[#64748B] mb-0.5">20 Feb 2024, 11:45 AM</p>
                      <p className="text-sm font-medium text-[#1E293B]">Payment Received</p>
                      <p className="text-xs text-[#64748B] mt-0.5">₹7,500 cash payment recorded by Rajesh Kumar.</p>
                    </div>
                    <div className="relative">
                      <div className="absolute -left-[27px] bg-[#D4A017] w-3 h-3 rounded-full border-2 border-white ring-2 ring-[#D4A017]/20"></div>
                      <p className="text-xs text-[#64748B] mb-0.5">15 Jan 2024, 02:30 PM</p>
                      <p className="text-sm font-medium text-[#1E293B]">Loan Disbursed</p>
                      <p className="text-xs text-[#64748B] mt-0.5">₹75,000 transferred via IMPS. Items kept in Vault 3, Locker B.</p>
                    </div>
                    <div className="relative">
                      <div className="absolute -left-[27px] bg-[#E2E8F0] w-3 h-3 rounded-full border-2 border-white"></div>
                      <p className="text-xs text-[#64748B] mb-0.5">15 Jan 2024, 10:15 AM</p>
                      <p className="text-sm font-medium text-[#1E293B]">Loan Created</p>
                      <p className="text-xs text-[#64748B] mt-0.5">Application initiated by Rajesh Kumar.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
