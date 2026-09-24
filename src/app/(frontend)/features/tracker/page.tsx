"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

export default function LiveTrackerPage() {
  const [rawLoans, setRawLoans] = useState<any[]>([]);
  const [itemToCategory, setItemToCategory] = useState<Record<string, string>>({});
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchTrackerData() {
      // Fetch both active loans and the master inventory to get the categories
      const [loansResponse, inventoryResponse] = await Promise.all([
        supabase.from("issued_items").select("*").eq("status", "active").order("issue_date", { ascending: false }),
        supabase.from("sports_items").select("item_name, category")
      ]);
      
      if (loansResponse.error) {
        console.error("Error fetching live tracker:", loansResponse.error.message);
      }

      // Create a quick lookup map so we know which item belongs to which category
      const categoryMap: Record<string, string> = {};
      if (inventoryResponse.data) {
        inventoryResponse.data.forEach(item => {
          categoryMap[item.item_name] = item.category || 'General';
        });
      }
      setItemToCategory(categoryMap);

      if (loansResponse.data) {
        setRawLoans(loansResponse.data);
      }
      setIsLoading(false);
    }
    
    fetchTrackerData();
  }, []);

  // Filter the loans based on the search query
  const filteredLoans = rawLoans.filter(loan => {
    const cat = itemToCategory[loan.item_issued] || 'General';
    const query = searchQuery.toLowerCase();
    return (
      loan.student_name?.toLowerCase().includes(query) ||
      loan.item_issued?.toLowerCase().includes(query) ||
      cat.toLowerCase().includes(query) ||
      loan.branch?.toLowerCase().includes(query) ||
      loan.roll_no?.toLowerCase().includes(query)
    );
  });

  // Group the filtered data: Sport Category -> Item Name -> Array of Loans (Students)
  const groupedData: Record<string, Record<string, any[]>> = {};
  filteredLoans.forEach(loan => {
    const cat = itemToCategory[loan.item_issued] || 'General';
    const item = loan.item_issued;
    
    if (!groupedData[cat]) groupedData[cat] = {};
    if (!groupedData[cat][item]) groupedData[cat][item] = [];
    
    groupedData[cat][item].push(loan);
  });

  return (
    <div className="min-h-screen bg-slate-100 pt-6 pb-24 px-5 md:px-8 font-sans selection:bg-[#ccff00] selection:text-black">
      <div className="max-w-[1400px] mx-auto">
        
        <Link href="/" className="text-[#6A00F4] font-black text-sm uppercase tracking-widest hover:text-slate-900 transition-colors mb-4 inline-block -skew-x-6">
          <span className="skew-x-6">← BACK TO COMMAND CENTER</span>
        </Link>
        
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-5 border-b-4 border-slate-950 pb-4 mb-8">
          <div>
            <p className="text-[10px] uppercase tracking-[.3em] font-black text-[#6A00F4]">Campus Radar</p>
            <h1 className="mt-1 text-4xl md:text-6xl font-black tracking-tighter uppercase italic text-slate-950">
              Live <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#6A00F4] to-purple-400">Tracker.</span>
            </h1>
          </div>
          <p className="max-w-md text-sm text-slate-500 leading-relaxed font-medium">
            Real-time visibility into the campus arsenal. Track which department and student is currently holding specific gear.
          </p>
        </div>

        {/* SEARCH BAR */}
        <div className="mb-12">
          <div className="relative max-w-2xl">
            <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
              <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
              </svg>
            </div>
            <input 
              type="text" 
              placeholder="Search by student, roll no, gear, branch, or sport..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-white border-2 border-slate-200 text-sm font-bold text-slate-900 placeholder-slate-400 focus:border-[#6A00F4] focus:outline-none transition-colors shadow-[4px_4px_0_0_rgba(15,23,42,1)]"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="text-center py-20 font-black text-slate-400 uppercase tracking-widest animate-pulse">Scanning Radar...</div>
        ) : rawLoans.length === 0 ? (
          <div className="mt-8 border-2 border-dashed border-slate-300 p-16 text-center text-slate-400 font-black uppercase tracking-widest rounded-2xl">
            All gear is currently resting in the vault.
          </div>
        ) : Object.keys(groupedData).length === 0 ? (
          <div className="mt-8 border-2 border-dashed border-slate-300 p-16 text-center text-slate-400 font-black uppercase tracking-widest rounded-2xl">
            No radar contacts matching "{searchQuery}".
          </div>
        ) : (
          <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-300">
            {Object.keys(groupedData).sort().map(category => (
              <div key={category}>
                <h2 className="text-2xl font-black uppercase italic tracking-tighter text-slate-950 border-b-4 border-[#6A00F4] pb-2 mb-6 inline-block pr-8">
                  {category}
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                  {Object.keys(groupedData[category]).sort().map(itemName => {
                    const activeLoans = groupedData[category][itemName];

                    return (
                      <div key={itemName} className="bg-white border-2 border-slate-200 p-4 shadow-[4px_4px_0_0_rgba(15,23,42,1)] rounded-xl flex flex-col">
                        
                        {/* ITEM NAME HEADER - REMOVED CHECKED OUT BADGE */}
                        <div className="border-b-2 border-slate-100 pb-3 mb-4">
                          <h3 className="text-lg font-black text-[#6A00F4] uppercase tracking-tight">
                            {itemName}
                          </h3>
                        </div>

                        <div className="space-y-3">
                          {activeLoans.map(loan => (
                            <div key={loan.id} className="bg-slate-50 p-3 border border-slate-200 rounded-lg relative overflow-hidden group hover:border-[#6A00F4] transition-colors">
                              
                              <div className="flex justify-between items-start mb-1">
                                <span className="font-bold text-slate-900 text-sm uppercase tracking-tight truncate pr-2">
                                  {loan.student_name}
                                </span>
                                <span className="bg-slate-950 text-[#ccff00] px-2 py-0.5 text-[10px] font-black -skew-x-6 shrink-0">
                                  <span className="skew-x-6 block">{loan.quantity}x</span>
                                </span>
                              </div>
                              
                              <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-0.5">
                                <span className="text-[#6A00F4]">{loan.roll_no}</span> • {loan.branch} • Sem {loan.semester}
                              </div>
                              
                              <div className="text-[9px] font-black text-slate-400 mt-2 flex items-center gap-1.5">
                                <span>OUT:</span>
                                <span className="text-slate-700 bg-slate-200 px-1.5 py-0.5 rounded">
                                  {new Date(loan.issue_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}