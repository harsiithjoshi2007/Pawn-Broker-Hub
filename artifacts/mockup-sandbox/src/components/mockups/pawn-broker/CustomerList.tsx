import React from "react";
import { 
  LayoutDashboard, Users, FileText, CreditCard, BarChart3, Calculator, 
  Bell, Settings, LogOut, Search, Moon, Menu, ChevronRight, Gem,
  Filter, Download, ChevronDown, UserPlus, Eye, Edit, Trash2, ChevronLeft, Calendar
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
        <a href="#" className="flex items-center gap-3 px-3 py-2 bg-[#D4A017] text-white rounded-md font-medium">
          <Users className="w-5 h-5" /> Customers
        </a>
        <a href="#" className="flex items-center gap-3 px-3 py-2 hover:bg-white/10 rounded-md font-medium transition-colors">
          <FileText className="w-5 h-5" /> Loans
        </a>
        <a href="#" className="flex items-center gap-3 px-3 py-2 hover:bg-white/10 rounded-md font-medium transition-colors">
          <CreditCard className="w-5 h-5" /> Payments
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
      <div className="text-[#1E293B] font-semibold">Customers</div>
    </div>
    <div className="flex items-center gap-5 text-[#64748B]">
      <div className="w-8 h-8 rounded-full bg-[#D4A017] flex items-center justify-center text-white font-bold text-sm cursor-pointer shadow-sm">RK</div>
    </div>
  </div>
);

export default function CustomerList() {
  const customers = [
    { id: "CUS-2024-00045", name: "Priya Sharma", phone: "+91 98765 43210", aadhaar: "XXXX-XXXX-8921", loans: 2, date: "10 Jan 2024", initials: "PS", color: "bg-pink-100 text-pink-700" },
    { id: "CUS-2024-00082", name: "Mohan Singh", phone: "+91 91234 56780", aadhaar: "XXXX-XXXX-4452", loans: 1, date: "05 Mar 2024", initials: "MS", color: "bg-blue-100 text-blue-700" },
    { id: "CUS-2024-00112", name: "Kavita Patel", phone: "+91 98989 89898", aadhaar: "XXXX-XXXX-1123", loans: 3, date: "12 Apr 2024", initials: "KP", color: "bg-emerald-100 text-emerald-700" },
    { id: "CUS-2024-00156", name: "Ramesh Verma", phone: "+91 87654 32109", aadhaar: "XXXX-XXXX-7765", loans: 1, date: "22 May 2024", initials: "RV", color: "bg-purple-100 text-purple-700" },
    { id: "CUS-2023-00890", name: "Sunita Devi", phone: "+91 90000 11111", aadhaar: "XXXX-XXXX-9900", loans: 0, date: "18 Nov 2023", initials: "SD", color: "bg-amber-100 text-amber-700" },
    { id: "CUS-2024-00184", name: "Vikram Reddy", phone: "+91 94444 55555", aadhaar: "XXXX-XXXX-3344", loans: 2, date: "01 Jul 2024", initials: "VR", color: "bg-indigo-100 text-indigo-700" },
    { id: "CUS-2024-00145", name: "Anjali Desai", phone: "+91 99999 88888", aadhaar: "XXXX-XXXX-2211", loans: 1, date: "15 May 2024", initials: "AD", color: "bg-rose-100 text-rose-700" },
    { id: "CUS-2023-00567", name: "Mohammed Ali", phone: "+91 97777 66666", aadhaar: "XXXX-XXXX-5566", loans: 3, date: "04 Sep 2023", initials: "MA", color: "bg-cyan-100 text-cyan-700" },
  ];

  return (
    <div className="flex min-h-screen bg-[#F8FAFC] font-sans text-[#1E293B]">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <TopNav />
        
        <main className="flex-1 p-6 overflow-y-auto">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold tracking-tight">Customers</h1>
            <div className="flex items-center gap-3">
              <button className="bg-white border border-[#E2E8F0] hover:bg-[#F8FAFC] text-[#1E3A5F] px-4 py-2 rounded-lg font-medium text-sm transition-colors shadow-sm flex items-center gap-2">
                <Download className="w-4 h-4" /> Export
              </button>
              <button className="bg-[#1E3A5F] hover:bg-[#152a45] text-white px-4 py-2 rounded-lg font-medium text-sm transition-colors shadow-sm flex items-center gap-2">
                <UserPlus className="w-4 h-4" /> Add New Customer
              </button>
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-[#E2E8F0] shadow-sm mb-4 flex flex-wrap gap-4 items-end">
            <div className="flex-1 min-w-[250px]">
              <label className="block text-xs font-medium text-[#64748B] mb-1">Search Customers</label>
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
                <input 
                  type="text" 
                  placeholder="Name, Phone, Aadhaar, ID..." 
                  className="w-full border border-[#E2E8F0] rounded-lg py-2 pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#1E3A5F] focus:border-transparent transition-all"
                />
              </div>
            </div>
            <div className="w-[180px]">
              <label className="block text-xs font-medium text-[#64748B] mb-1">City/Location</label>
              <div className="relative">
                <select className="w-full border border-[#E2E8F0] rounded-lg py-2 pl-3 pr-8 text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-[#1E3A5F] bg-white cursor-pointer">
                  <option>All Locations</option>
                  <option>Mumbai</option>
                  <option>Delhi</option>
                  <option>Bangalore</option>
                </select>
                <ChevronDown className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-[#94A3B8] pointer-events-none" />
              </div>
            </div>
            <div className="w-[180px]">
              <label className="block text-xs font-medium text-[#64748B] mb-1">Loan Status</label>
              <div className="relative">
                <select className="w-full border border-[#E2E8F0] rounded-lg py-2 pl-3 pr-8 text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-[#1E3A5F] bg-white cursor-pointer">
                  <option>All Customers</option>
                  <option>With Active Loans</option>
                  <option>With Overdue Loans</option>
                  <option>No Active Loans</option>
                </select>
                <ChevronDown className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-[#94A3B8] pointer-events-none" />
              </div>
            </div>
            <button className="border border-[#E2E8F0] hover:bg-[#F8FAFC] text-[#64748B] px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2">
              <Filter className="w-4 h-4" /> Filters
            </button>
          </div>

          <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-sm overflow-hidden flex flex-col">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-[#64748B] uppercase bg-[#F8FAFC] border-b border-[#E2E8F0]">
                  <tr>
                    <th className="px-5 py-3 font-semibold w-16">Profile</th>
                    <th className="px-5 py-3 font-semibold">Customer Details</th>
                    <th className="px-5 py-3 font-semibold">Contact Info</th>
                    <th className="px-5 py-3 font-semibold">ID Proof (Aadhaar)</th>
                    <th className="px-5 py-3 font-semibold text-center">Active Loans</th>
                    <th className="px-5 py-3 font-semibold">Date Added</th>
                    <th className="px-5 py-3 font-semibold text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {customers.map((c, idx) => (
                    <tr key={idx} className="border-b border-[#E2E8F0] hover:bg-[#F8FAFC] transition-colors">
                      <td className="px-5 py-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${c.color}`}>
                          {c.initials}
                        </div>
                      </td>
                      <td className="px-5 py-3">
                        <div className="font-semibold text-[#1E293B] hover:text-[#1E3A5F] cursor-pointer">{c.name}</div>
                        <div className="font-mono text-xs text-[#64748B] mt-0.5">{c.id}</div>
                      </td>
                      <td className="px-5 py-3 font-medium text-[#1E3A5F]">{c.phone}</td>
                      <td className="px-5 py-3 text-[#64748B] font-mono">{c.aadhaar}</td>
                      <td className="px-5 py-3 text-center">
                        <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${c.loans > 0 ? 'bg-[#1E3A5F] text-white' : 'bg-slate-100 text-slate-500'}`}>
                          {c.loans}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-[#64748B] flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5 opacity-70"/> {c.date}</td>
                      <td className="px-5 py-3 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button className="text-[#64748B] hover:text-[#1E3A5F] p-1.5 rounded-md hover:bg-slate-100 transition-colors" title="View Profile"><Eye className="w-4 h-4" /></button>
                          <button className="text-[#64748B] hover:text-[#D4A017] p-1.5 rounded-md hover:bg-slate-100 transition-colors" title="Edit"><Edit className="w-4 h-4" /></button>
                          <button className="text-[#64748B] hover:text-[#EF4444] p-1.5 rounded-md hover:bg-slate-100 transition-colors" title="Delete"><Trash2 className="w-4 h-4" /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            <div className="p-4 border-t border-[#E2E8F0] flex items-center justify-between bg-white text-sm">
              <span className="text-[#64748B]">Showing <span className="font-medium text-[#1E293B]">1-8</span> of <span className="font-medium text-[#1E293B]">184</span> customers</span>
              <div className="flex items-center gap-1">
                <button className="p-1.5 border border-[#E2E8F0] rounded-md text-[#64748B] hover:bg-[#F8FAFC] disabled:opacity-50"><ChevronLeft className="w-4 h-4" /></button>
                <button className="w-8 h-8 border border-[#1E3A5F] bg-[#1E3A5F] text-white rounded-md font-medium">1</button>
                <button className="w-8 h-8 border border-[#E2E8F0] hover:bg-[#F8FAFC] text-[#1E293B] rounded-md font-medium">2</button>
                <button className="w-8 h-8 border border-[#E2E8F0] hover:bg-[#F8FAFC] text-[#1E293B] rounded-md font-medium">3</button>
                <span className="px-2 text-[#64748B]">...</span>
                <button className="w-8 h-8 border border-[#E2E8F0] hover:bg-[#F8FAFC] text-[#1E293B] rounded-md font-medium">23</button>
                <button className="p-1.5 border border-[#E2E8F0] rounded-md text-[#64748B] hover:bg-[#F8FAFC]"><ChevronRight className="w-4 h-4" /></button>
              </div>
            </div>
          </div>

        </main>
      </div>
    </div>
  );
}
