"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

export default function FacilitiesPage() {
  const [groupedItems, setGroupedItems] = useState<Record<string, any[]>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  useEffect(() => {
    async function loadInventory() {
      const { data } = await supabase.from("sports_items").select("*").order("item_name", { ascending: true });
      
      if (data) {
        const grouped = data.reduce((acc, item) => {
          const cat = item.category || 'General';
          if (!acc[cat]) acc[cat] = [];
          acc[cat].push(item);
          return acc;
        }, {} as Record<string, any[]>);
        
        setGroupedItems(grouped);
      }
      setIsLoading(false);
    }
    loadInventory();
  }, []);

  return (
    <div className="min-h-screen bg-slate-100 pt-6 pb-24 px-5 md:px-8 font-sans selection:bg-[#ccff00] selection:text-black">
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
            See what gear is available to borrow right now for your next match.
          </p>
        </div>

        {isLoading ? (
          <div className="text-center py-20 font-black text-slate-400 uppercase tracking-widest animate-pulse">Loading Arsenal...</div>
        ) : Object.keys(groupedItems).length === 0 ? (
          <div className="mt-12 border-2 border-dashed border-slate-300 p-16 text-center text-slate-400 font-black uppercase tracking-widest">
            No equipment available in the vault.
          </div>
        ) : !selectedCategory ? (
          // VIEW 1: SPORTS CATEGORIES GRID (COMPACT LAYOUT)
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {Object.keys(groupedItems).map((category) => {
              const itemsCount = groupedItems[category].length;
              return (
                <button 
                  key={category} 
                  onClick={() => setSelectedCategory(category)}
                  className="group rounded-2xl border-2 border-slate-200 bg-white p-6 text-left shadow-[4px_4px_0_0_rgba(15,23,42,1)] hover:shadow-[6px_6px_0_0_rgba(106,0,244,1)] hover:-translate-y-1 transition-all flex flex-col justify-center"
                >
                  <div className="flex items-center justify-between w-full mb-2">
                    <h3 className="text-xl sm:text-2xl font-black text-slate-900 uppercase tracking-tight">{category}</h3>
                    <span className="text-[#6A00F4] font-black text-2xl group-hover:translate-x-1 transition-transform">→</span>
                  </div>
                  <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">{itemsCount} Types of Gear</p>
                </button>
              );
            })}
          </div>
        ) : (
          // VIEW 2: SPECIFIC ITEMS FOR SELECTED SPORT (COMPACT LAYOUT)
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div className="flex items-center gap-6 mb-8">
              <button 
                onClick={() => setSelectedCategory(null)}
                className="bg-slate-950 text-white px-4 py-2 font-black uppercase tracking-widest text-xs -skew-x-6 hover:bg-[#6A00F4] transition-colors"
              >
                <span className="block skew-x-6">← ALL SPORTS</span>
              </button>
              <h2 className="text-3xl font-black text-slate-950 uppercase tracking-tighter">
                {selectedCategory} Gear
              </h2>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {groupedItems[selectedCategory].map((item) => {
                const available = Number(item.available_quantity || 0);
                const total = Number(item.total_quantity || 0);
                const percentage = total > 0 ? Math.round((available / total) * 100) : 0;
                const isAvailable = available > 0;

                return (
                  <div key={item.id} className="group rounded-2xl border-2 border-slate-200 bg-white p-6 shadow-[4px_4px_0_0_rgba(15,23,42,1)] hover:shadow-[6px_6px_0_0_rgba(106,0,244,1)] hover:-translate-y-1 transition-all flex flex-col justify-between">
                    
                    <div className="flex items-start justify-between gap-4 mb-8">
                      <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight leading-tight">{item.item_name}</h3>
                      <span className={`px-2 py-1 text-[9px] font-black uppercase tracking-widest -skew-x-6 shrink-0 ${isAvailable ? "bg-[#ccff00] text-slate-950" : "bg-red-100 text-red-600"}`}>
                        <span className="skew-x-6 block">{isAvailable ? "AVAILABLE" : "DEPLETED"}</span>
                      </span>
                    </div>

                    <div className="mt-auto">
                      <div className="flex justify-between text-[10px] uppercase tracking-widest font-black text-slate-500 mb-2">
                        <span>Stock Level</span>
                        <span className="text-[#6A00F4]">{available} / {total}</span>
                      </div>
                      <div className="h-2 bg-slate-100 rounded-none overflow-hidden -skew-x-6">
                        <div className="h-full bg-[#6A00F4]" style={{ width: `${percentage}%` }} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}