import React from "react";
import { 
  LayoutDashboard, Users, FileText, CreditCard, BarChart3, Calculator, 
  Bell, Settings, LogOut, Search, Moon, Menu, ChevronRight, Gem,
  CheckCircle2, ArrowRight, ArrowLeft, Upload, X, Plus, Image as ImageIcon
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
        <a href="#" className="flex items-center justify-between px-3 py-2 bg-[#D4A017] text-white rounded-md font-medium">
          <div className="flex items-center gap-3">
            <FileText className="w-5 h-5" /> Loans
          </div>
        </a>
      </nav>
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
        <span className="text-[#1E293B] font-semibold">New Loan</span>
      </div>
    </div>
  </div>
);

export default function AddLoan() {
  return (
    <div className="flex min-h-screen bg-[#F8FAFC] font-sans text-[#1E293B]">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <TopNav />
        
        <main className="flex-1 p-6 overflow-y-auto max-w-5xl mx-auto w-full">
          <div className="mb-8">
            <h1 className="text-2xl font-bold tracking-tight mb-6">New Gold Loan</h1>
            
            {/* Stepper */}
            <div className="flex items-center justify-between relative">
              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-[#E2E8F0] -z-10"></div>
              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1/2 h-1 bg-[#10B981] -z-10"></div>
              
              <div className="flex flex-col items-center bg-[#F8FAFC] px-2">
                <div className="w-8 h-8 rounded-full bg-[#10B981] text-white flex items-center justify-center font-bold mb-2 shadow-sm border-2 border-[#F8FAFC]">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <span className="text-xs font-semibold text-[#10B981]">Customer</span>
              </div>
              
              <div className="flex flex-col items-center bg-[#F8FAFC] px-2">
                <div className="w-8 h-8 rounded-full bg-[#1E3A5F] text-white flex items-center justify-center font-bold mb-2 shadow-sm ring-4 ring-[#1E3A5F]/10 border-2 border-[#F8FAFC]">
                  2
                </div>
                <span className="text-xs font-bold text-[#1E3A5F]">Jewellery Details</span>
              </div>
              
              <div className="flex flex-col items-center bg-[#F8FAFC] px-2">
                <div className="w-8 h-8 rounded-full bg-white border-2 border-[#E2E8F0] text-[#94A3B8] flex items-center justify-center font-bold mb-2">
                  3
                </div>
                <span className="text-xs font-medium text-[#94A3B8]">Loan Terms</span>
              </div>
            </div>
          </div>

          <div className="bg-[#1E3A5F] text-white rounded-xl p-4 mb-6 flex items-center justify-between shadow-md">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center font-bold text-lg">PS</div>
              <div>
                <p className="font-semibold flex items-center gap-2">
                  Priya Sharma <span className="text-xs font-mono bg-white/10 px-2 py-0.5 rounded">CUS-2024-00045</span>
                </p>
                <p className="text-sm text-white/70">📱 +91 98765 43210</p>
              </div>
            </div>
            <button className="text-sm font-medium text-[#D4A017] hover:text-white transition-colors bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-md">
              Change Customer
            </button>
          </div>

          <h2 className="text-lg font-bold mb-4">Jewellery Items</h2>

          {/* Item 1 */}
          <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-sm p-6 mb-4 relative">
            <button className="absolute top-4 right-4 text-[#94A3B8] hover:text-[#EF4444] p-1 rounded-md hover:bg-red-50 transition-colors">
              <X className="w-5 h-5" />
            </button>
            
            <div className="flex gap-6">
              <div className="w-32 flex-shrink-0">
                <div className="w-full aspect-square bg-[#F8FAFC] border-2 border-dashed border-[#cbd5e1] rounded-lg flex flex-col items-center justify-center text-[#94A3B8] hover:border-[#1E3A5F] hover:text-[#1E3A5F] transition-colors cursor-pointer overflow-hidden relative group">
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <p className="text-white text-xs font-medium">Change Photo</p>
                  </div>
                  <div className="w-full h-full bg-amber-50 flex items-center justify-center text-5xl">
                    📿
                  </div>
                </div>
              </div>
              
              <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="col-span-2">
                  <label className="block text-xs font-medium text-[#64748B] mb-1.5">Jewellery Type</label>
                  <select className="w-full border border-[#E2E8F0] rounded-lg py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#D4A017] bg-white" defaultValue="Necklace">
                    <option>Necklace</option>
                    <option>Bangle</option>
                    <option>Ring</option>
                    <option>Chain</option>
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-medium text-[#64748B] mb-1.5">Category</label>
                  <select className="w-full border border-[#E2E8F0] rounded-lg py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#D4A017] bg-white" defaultValue="Ornament">
                    <option>Ornament</option>
                    <option>Coin</option>
                    <option>Biscuit</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#64748B] mb-1.5">Gross Wt. (g)</label>
                  <input type="number" defaultValue="25.00" className="w-full border border-[#E2E8F0] rounded-lg py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#D4A017] font-mono text-right" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#64748B] mb-1.5">Stone/Dust Wt. (g)</label>
                  <input type="number" defaultValue="2.00" className="w-full border border-[#E2E8F0] rounded-lg py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#D4A017] font-mono text-right" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#64748B] mb-1.5">Net Wt. (g)</label>
                  <input type="number" defaultValue="23.00" readOnly className="w-full border border-[#E2E8F0] bg-[#F8FAFC] text-[#64748B] rounded-lg py-2 px-3 text-sm font-mono text-right outline-none cursor-not-allowed" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#64748B] mb-1.5">Purity</label>
                  <select className="w-full border border-[#E2E8F0] rounded-lg py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#D4A017] bg-white font-medium text-[#D4A017]" defaultValue="22K">
                    <option value="24K">24K Gold</option>
                    <option value="22K">22K Gold</option>
                    <option value="18K">18K Gold</option>
                  </select>
                </div>

                <div className="col-span-2">
                  <label className="block text-xs font-medium text-[#64748B] mb-1.5">Estimated Loan Value (₹)</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#64748B] font-medium">₹</span>
                    <input type="text" defaultValue="60,000" className="w-full border border-[#E2E8F0] rounded-lg py-2 pl-7 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#1E3A5F] font-bold text-[#1E3A5F]" />
                  </div>
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-medium text-[#64748B] mb-1.5">Current Market Value (₹)</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#64748B] font-medium">₹</span>
                    <input type="text" defaultValue="62,000" className="w-full border border-[#E2E8F0] rounded-lg py-2 pl-7 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#D4A017] font-semibold text-[#64748B]" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Item 2 */}
          <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-sm p-6 mb-4 relative">
            <button className="absolute top-4 right-4 text-[#94A3B8] hover:text-[#EF4444] p-1 rounded-md hover:bg-red-50 transition-colors">
              <X className="w-5 h-5" />
            </button>
            
            <div className="flex gap-6">
              <div className="w-32 flex-shrink-0">
                <div className="w-full aspect-square bg-[#F8FAFC] border-2 border-dashed border-[#cbd5e1] rounded-lg flex flex-col items-center justify-center text-[#94A3B8] hover:border-[#1E3A5F] hover:text-[#1E3A5F] transition-colors cursor-pointer hover:bg-slate-50">
                  <ImageIcon className="w-8 h-8 mb-2 opacity-50" />
                  <p className="text-[10px] font-medium px-2 text-center">Click to upload photo</p>
                </div>
              </div>
              
              <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="col-span-2">
                  <label className="block text-xs font-medium text-[#64748B] mb-1.5">Jewellery Type</label>
                  <select className="w-full border border-[#E2E8F0] rounded-lg py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#D4A017] bg-white" defaultValue="Bangle">
                    <option>Necklace</option>
                    <option>Bangle</option>
                    <option>Ring</option>
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-medium text-[#64748B] mb-1.5">Category</label>
                  <select className="w-full border border-[#E2E8F0] rounded-lg py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#D4A017] bg-white" defaultValue="Ornament">
                    <option>Ornament</option>
                    <option>Coin</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#64748B] mb-1.5">Gross Wt. (g)</label>
                  <input type="number" defaultValue="14.00" className="w-full border border-[#E2E8F0] rounded-lg py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#D4A017] font-mono text-right" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#64748B] mb-1.5">Stone/Dust Wt. (g)</label>
                  <input type="number" defaultValue="2.00" className="w-full border border-[#E2E8F0] rounded-lg py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#D4A017] font-mono text-right" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#64748B] mb-1.5">Net Wt. (g)</label>
                  <input type="number" defaultValue="12.00" readOnly className="w-full border border-[#E2E8F0] bg-[#F8FAFC] text-[#64748B] rounded-lg py-2 px-3 text-sm font-mono text-right outline-none cursor-not-allowed" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#64748B] mb-1.5">Purity</label>
                  <select className="w-full border border-[#E2E8F0] rounded-lg py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#D4A017] bg-white font-medium text-[#D4A017]" defaultValue="22K">
                    <option value="24K">24K Gold</option>
                    <option value="22K">22K Gold</option>
                  </select>
                </div>

                <div className="col-span-2">
                  <label className="block text-xs font-medium text-[#64748B] mb-1.5">Estimated Loan Value (₹)</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#64748B] font-medium">₹</span>
                    <input type="text" defaultValue="31,000" className="w-full border border-[#E2E8F0] rounded-lg py-2 pl-7 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#1E3A5F] font-bold text-[#1E3A5F]" />
                  </div>
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-medium text-[#64748B] mb-1.5">Current Market Value (₹)</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#64748B] font-medium">₹</span>
                    <input type="text" defaultValue="32,500" className="w-full border border-[#E2E8F0] rounded-lg py-2 pl-7 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#D4A017] font-semibold text-[#64748B]" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <button className="w-full py-4 border-2 border-dashed border-[#cbd5e1] rounded-xl text-[#64748B] font-medium hover:border-[#1E3A5F] hover:text-[#1E3A5F] hover:bg-[#F8FAFC] transition-colors flex items-center justify-center gap-2 mb-6">
            <Plus className="w-5 h-5" /> Add Another Item
          </button>

          <div className="bg-[#FEFCE8] border border-[#FEF08A] rounded-xl p-5 mb-8 flex flex-col md:flex-row items-center justify-between shadow-sm">
            <div className="text-sm font-medium text-[#B45309]">
              Items Pledged: <span className="font-bold text-lg">2</span>
            </div>
            <div className="flex gap-6 mt-4 md:mt-0">
              <div className="text-right">
                <p className="text-xs text-[#B45309] font-medium">Total Market Value</p>
                <p className="text-xl font-bold text-[#78350F]">₹94,500</p>
              </div>
              <div className="w-px bg-[#FDE047]"></div>
              <div className="text-right">
                <p className="text-xs text-[#B45309] font-medium">Total Est. Loan Value</p>
                <p className="text-2xl font-bold text-[#1E3A5F]">₹91,000</p>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between border-t border-[#E2E8F0] pt-6 pb-12">
            <button className="px-6 py-2.5 border border-[#E2E8F0] rounded-lg font-medium text-[#64748B] hover:bg-[#F8FAFC] hover:text-[#1E293B] transition-colors flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" /> Back
            </button>
            <button className="px-6 py-2.5 bg-[#1E3A5F] hover:bg-[#152a45] text-white rounded-lg font-medium shadow-md transition-colors flex items-center gap-2">
              Next: Loan Terms <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </main>
      </div>
    </div>
  );
}
