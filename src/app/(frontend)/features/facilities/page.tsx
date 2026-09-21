"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

export default function FacilitiesPage() {
  const [sportsItems, setSportsItems] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadInventory() {
      const { data } = await supabase.from("sports_items").select("*").order("item_name", { ascending: true });
      if (data) setSportsItems(data);
      setIsLoading(false);
    }
    loadInventory();
  }, []);

  return (
    <div className="min-h-screen bg-slate-100 py-28 px-5 md:px-8 font-sans selection:bg-[#ccff00] selection:text-black">
      <div className="max-w-[1400px] mx-auto">
        <Link href="/" className="text-[#6A00F4] font-black text-sm uppercase tracking-widest hover:text-slate-900 transition-colors mb-8 inline-block -skew-x-6">
          <span className="skew-x-6">← BACK TO COMMAND CENTER</span>
        </Link>
        
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-5 border-b-4 border-slate-950 pb-6 mb-12">
          <div>
            <p className="text-[10px] uppercase tracking-[.3em] font-black text-[#6A00F4]">The Arsenal</p>
            <h1 className="mt-2 text-4xl md:text-6xl font-black tracking-tighter uppercase italic text-slate-950">
              Equipment <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#6A00F4] to-purple-400">Vault.</span>
            </h1>
          </div>
          <p className="max-w-md text-sm text-slate-500 leading-relaxed font-medium">
            Browse sports inventory. See what gear is available to borrow right now for your next match.
          </p>
        </div>

        {isLoading ? (
          <div className="text-center py-20 font-black text-slate-400 uppercase tracking-widest animate-pulse">Loading Arsenal...</div>
        ) : sportsItems.length > 0 ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {sportsItems.map((item) => {
              const available = Number(item.available_quantity || 0);
              const total = Number(item.total_quantity || 0);
              const percentage = total > 0 ? Math.round((available / total) * 100) : 0;
              const isAvailable = available > 0;

              return (
                <div key={item.id} className="group rounded-3xl border-2 border-slate-200 bg-white p-8 shadow-[4px_4px_0_0_rgba(15,23,42,1)] hover:shadow-[8px_8px_0_0_rgba(106,0,244,1)] hover:-translate-y-1 transition-all flex flex-col">
                  <div className="flex items-start justify-between mb-6">
                    <div className="h-14 w-14 rounded-2xl bg-slate-100 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">🏅</div>
                    <span className={`px-3 py-1.5 text-[10px] font-black uppercase tracking-widest -skew-x-6 ${isAvailable ? "bg-[#ccff00] text-slate-950" : "bg-red-100 text-red-600"}`}>
                      <span className="skew-x-6">{isAvailable ? "AVAILABLE" : "DEPLETED"}</span>
                    </span>
                  </div>

                  <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight mb-6">{item.item_name}</h3>

                  <div className="mt-auto">
                    <div className="flex justify-between text-[10px] uppercase tracking-widest font-black text-slate-500 mb-2">
                      <span>Stock Level</span>
                      <span className="text-[#6A00F4]">{available} / {total}</span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-none overflow-hidden mb-6 -skew-x-6">
                      <div className="h-full bg-[#6A00F4]" style={{ width: `${percentage}%` }} />
                    </div>

                    <Link 
                      href="/features/request"
                      className={`block w-full py-3 text-center text-xs font-black uppercase tracking-widest -skew-x-6 transition-all ${isAvailable ? 'bg-slate-950 text-white hover:bg-[#ccff00] hover:text-black' : 'bg-slate-200 text-slate-400 pointer-events-none'}`}
                    >
                      <span className="block skew-x-6">{isAvailable ? "Request Item" : "Out of Stock"}</span>
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="mt-12 border-2 border-dashed border-slate-300 p-16 text-center text-slate-400 font-black uppercase tracking-widest">
            No equipment available in the vault.
          </div>
        )}
      </div>
    </div>
  );
}