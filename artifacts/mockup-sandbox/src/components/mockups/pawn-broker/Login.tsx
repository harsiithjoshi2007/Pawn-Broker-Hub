import React, { useState } from "react";
import { Gem, Eye, EyeOff } from "lucide-react";

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0F172A] to-[#1E3A5F] flex flex-col justify-center items-center p-4 font-sans text-[#1E293B]">
      <div className="w-full max-w-md bg-white rounded-xl shadow-2xl overflow-hidden">
        <div className="p-8">
          <div className="flex flex-col items-center mb-8">
            <div className="w-16 h-16 bg-[#1E3A5F] rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-[#1E3A5F]/20">
              <Gem className="w-8 h-8 text-[#D4A017]" />
            </div>
            <h1 className="text-3xl font-bold text-[#D4A017] tracking-tight">Pawn Broker</h1>
            <p className="text-[#64748B] mt-2 text-center text-sm">Sign in to manage loans and customers</p>
          </div>

          <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>
            <div>
              <label className="block text-sm font-medium text-[#1E293B] mb-1.5" htmlFor="email">
                Email or Phone Number
              </label>
              <input
                id="email"
                type="text"
                placeholder="admin@pawnbroker.in or +91 98765 43210"
                className="w-full px-4 py-2.5 border border-[#E2E8F0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4A017] focus:border-transparent transition-all placeholder:text-[#94A3B8]"
                defaultValue="admin@pawnbroker.in"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#1E293B] mb-1.5" htmlFor="password">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  className="w-full px-4 py-2.5 border border-[#E2E8F0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4A017] focus:border-transparent transition-all placeholder:text-[#94A3B8]"
                  defaultValue="password123"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#64748B] hover:text-[#1E293B] transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer group">
                <input
                  type="checkbox"
                  className="w-4 h-4 rounded border-[#E2E8F0] text-[#D4A017] focus:ring-[#D4A017]"
                  defaultChecked
                />
                <span className="text-sm text-[#64748B] group-hover:text-[#1E293B] transition-colors">Remember me</span>
              </label>
              <a href="#" className="text-sm font-medium text-[#1E3A5F] hover:text-[#D4A017] transition-colors">
                Forgot Password?
              </a>
            </div>

            <button
              type="submit"
              className="w-full py-3 px-4 bg-gradient-to-r from-[#1E3A5F] to-[#2a4d7a] hover:from-[#152a45] hover:to-[#1E3A5F] text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all focus:outline-none focus:ring-2 focus:ring-[#D4A017] focus:ring-offset-2 flex items-center justify-center gap-2 mt-4"
            >
              Login to Dashboard
            </button>
          </form>
        </div>
        
        <div className="bg-[#F8FAFC] p-4 text-center border-t border-[#E2E8F0]">
          <p className="text-xs text-[#64748B]">
            Need help logging in? <a href="#" className="text-[#1E3A5F] hover:underline font-medium">Contact Support</a>
          </p>
        </div>
      </div>
      
      <div className="mt-8 text-center">
        <p className="text-white/60 text-sm">Pawn Broker Professional v2.4.0</p>
        <p className="text-white/40 text-xs mt-1">&copy; 2024 Vault Systems Ltd.</p>
      </div>
    </div>
  );
}
