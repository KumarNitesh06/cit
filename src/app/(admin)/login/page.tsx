"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    // Send credentials to Supabase
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setErrorMsg("❌ Invalid email or password.");
      setLoading(false);
    } else {
      // If successful, send them to the dashboard!
      router.push("/dashboard");
    }
  };

  return (
    <div className="min-h-screen bg-[#f4f7fb] flex items-center justify-center p-6 font-sans text-gray-800">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
        
        {/* Header */}
        <div className="bg-[#6A00F4] p-8 text-center">
          <div className="w-12 h-12 border-2 border-[#FFD6A5] rotate-45 flex items-center justify-center mx-auto mb-4">
            <span className="-rotate-45 font-bold text-xs text-[#FFD6A5]">CITK</span>
          </div>
          <h1 className="text-2xl font-black text-[#FFD6A5] tracking-wide">ADMIN LOGIN</h1>
          <p className="text-[#FFD6A5]/80 text-sm mt-1">Authorized Personnel Only</p>
        </div>

        {/* Login Form */}
        <div className="p-8">
          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Email Address</label>
              <input 
                type="email" 
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border border-gray-300 rounded-md p-3 text-sm outline-none focus:border-[#6A00F4] focus:ring-1 focus:ring-[#6A00F4]"
                placeholder="admin@citk.ac.in"
              />
            </div>
            
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Password</label>
              <input 
                type="password" 
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border border-gray-300 rounded-md p-3 text-sm outline-none focus:border-[#6A00F4] focus:ring-1 focus:ring-[#6A00F4]"
                placeholder="••••••••"
              />
            </div>

            {errorMsg && <p className="text-sm font-bold text-red-600 text-center">{errorMsg}</p>}

            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-[#6A00F4] text-[#FFD6A5] px-4 py-3 rounded-md text-sm font-extrabold hover:opacity-90 transition shadow-lg mt-4 disabled:opacity-50"
            >
              {loading ? "Authenticating..." : "Secure Login →"}
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}