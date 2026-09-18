"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

interface RequestRow {
  id: number;
  item_id: string;
  item_name: string;
  quantity: number | string;
  max_quantity: number;
}

export default function RequestGearPage() {
  const [sportsItems, setSportsItems] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Start with completely blank fields
  const [formData, setFormData] = useState({
    name: "",
    rollNo: "",
    branch: "",
    semester: "1",
  });

  const [requestedItems, setRequestedItems] = useState<RequestRow[]>([
    { id: Date.now(), item_id: "", item_name: "", quantity: 1, max_quantity: 1 }
  ]);

  useEffect(() => {
    async function loadInventory() {
      const { data } = await supabase.from("sports_items").select("*").gt("available_quantity", 0).order("item_name", { ascending: true });
      if (data) setSportsItems(data);
      setIsLoading(false);
    }
    loadInventory();
  }, []);

  const handleItemSelect = (rowId: number, selectedItemId: string) => {
    const itemData = sportsItems.find(i => i.id === selectedItemId);
    if (!itemData) return;

    setRequestedItems(prev => prev.map(row => 
      row.id === rowId 
        ? { ...row, item_id: itemData.id, item_name: itemData.item_name, max_quantity: itemData.available_quantity, quantity: 1 }
        : row
    ));
  };

  const handleQuantityChange = (rowId: number, qty: number | string) => {
    setRequestedItems(prev => prev.map(row => 
      row.id === rowId ? { ...row, quantity: qty } : row
    ));
  };

  const addRow = () => {
    setRequestedItems([...requestedItems, { id: Date.now(), item_id: "", item_name: "", quantity: 1, max_quantity: 1 }]);
  };

  const removeRow = (rowId: number) => {
    if (requestedItems.length > 1) {
      setRequestedItems(requestedItems.filter(row => row.id !== rowId));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validItems = requestedItems.filter(item => item.item_id !== "" && Number(item.quantity) > 0);
    if (validItems.length === 0) return alert("Please select at least one item to request.");
    
    setIsSubmitting(true);

    try {
      const rowsToInsert = validItems.map(item => ({
        student_name: formData.name,
        roll_no: formData.rollNo,
        branch: formData.branch,
        semester: parseInt(formData.semester),
        item_id: item.item_id,
        item_name: item.item_name,
        quantity: Number(item.quantity),
      }));

      const { error: dbError } = await supabase.from('item_requests').insert(rowsToInsert);
      if (dbError) throw new Error("Database error: " + dbError.message);

      const emailResponse = await fetch('/api/notify-admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          student_name: formData.name,
          roll_no: formData.rollNo,
          branch: formData.branch,
          semester: formData.semester,
          requested_items: validItems
        })
      });

      if (!emailResponse.ok) throw new Error("Failed to send email notification");

      alert("All requests sent successfully! Awaiting admin approval.");
      setRequestedItems([{ id: Date.now(), item_id: "", item_name: "", quantity: 1, max_quantity: 1 }]); 
      setFormData({ name: "", rollNo: "", branch: "", semester: "1" }); // Reset identity form after submission
      
    } catch (error: any) {
      alert(error.message || "An error occurred while submitting your requests.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 py-28 px-5 md:px-8 font-sans selection:bg-[#ccff00] selection:text-black">
      <div className="max-w-[800px] mx-auto">
        
        <Link href="/" className="text-[#6A00F4] font-black text-sm uppercase tracking-widest hover:text-slate-900 transition-colors mb-8 inline-block -skew-x-6">
          <span className="skew-x-6">← BACK TO COMMAND CENTER</span>
        </Link>
        
        <div className="border-b-4 border-slate-950 pb-6 mb-12">
          <p className="text-[10px] uppercase tracking-[.3em] font-black text-[#6A00F4]">Issue Portal</p>
          <h1 className="mt-2 text-4xl md:text-6xl font-black tracking-tighter uppercase italic text-slate-950">
            Request <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#6A00F4] to-purple-400">Gear.</span>
          </h1>
          <p className="mt-4 max-w-lg text-sm text-slate-500 leading-relaxed font-medium">
            Select multiple items below and submit your request to the sports department in one go.
          </p>
        </div>

        {isLoading ? (
          <div className="text-center py-20 font-black text-slate-400 uppercase tracking-widest animate-pulse">Establishing Connection...</div>
        ) : (
          <form onSubmit={handleSubmit} className="bg-white border-2 border-slate-200 p-6 md:p-10 shadow-[4px_4px_0_0_rgba(15,23,42,1)]">
            
            <div className="mb-10">
              <h2 className="text-xl font-black text-slate-950 uppercase italic tracking-tighter mb-4 border-b-2 border-slate-100 pb-2">Student Identity</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Full Name</label>
                  <input type="text" required placeholder="e.g. Rahul Sharma" className="w-full bg-slate-50 border-2 border-slate-200 p-3 text-sm font-bold text-slate-900 placeholder-slate-400 focus:border-[#6A00F4] focus:outline-none transition-colors" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Roll Number</label>
                  <input type="text" required placeholder="e.g. NAL-26-CS-001" className="w-full bg-slate-50 border-2 border-slate-200 p-3 text-sm font-bold text-slate-900 placeholder-slate-400 focus:border-[#6A00F4] focus:outline-none transition-colors" value={formData.rollNo} onChange={(e) => setFormData({...formData, rollNo: e.target.value})} />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Branch</label>
                  <input type="text" required placeholder="e.g. CSE" className="w-full bg-slate-50 border-2 border-slate-200 p-3 text-sm font-bold text-slate-900 placeholder-slate-400 focus:border-[#6A00F4] focus:outline-none transition-colors uppercase" value={formData.branch} onChange={(e) => setFormData({...formData, branch: e.target.value})} />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Semester</label>
                  <select className="w-full bg-slate-50 border-2 border-slate-200 p-3 text-sm font-bold text-slate-900 focus:border-[#6A00F4] focus:outline-none transition-colors" value={formData.semester} onChange={(e) => setFormData({...formData, semester: e.target.value})}>
                    {[1, 2, 3, 4, 5, 6, 7, 8].map(sem => <option key={sem} value={sem}>Semester {sem}</option>)}
                  </select>
                </div>
              </div>
            </div>

            <div className="mb-10">
              <div className="flex items-center justify-between border-b-2 border-slate-100 pb-2 mb-4">
                <h2 className="text-xl font-black text-slate-950 uppercase italic tracking-tighter">Gear Loadout</h2>
                <button type="button" onClick={addRow} className="text-xs font-black text-[#6A00F4] uppercase tracking-widest hover:text-slate-900 transition-colors">+ Add Gear</button>
              </div>

              <div className="space-y-4">
                {requestedItems.map((row, index) => (
                  <div key={row.id} className="flex flex-col sm:flex-row gap-3 items-start sm:items-end bg-slate-50 p-4 border-2 border-slate-100">
                    <div className="w-full sm:flex-grow">
                      <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Item #{index + 1}</label>
                      <select 
                        required 
                        className="w-full bg-white border-2 border-slate-200 p-3 text-sm font-bold text-slate-900 focus:border-[#6A00F4] focus:outline-none transition-colors"
                        value={row.item_id}
                        onChange={(e) => handleItemSelect(row.id, e.target.value)}
                      >
                        <option value="" disabled>Select Equipment...</option>
                        {sportsItems.map(item => (
                          <option key={item.id} value={item.id}>{item.item_name} ({item.available_quantity} Available)</option>
                        ))}
                      </select>
                    </div>
                    
                    <div className="w-full sm:w-24 shrink-0">
                      <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Qty</label>
                      <input 
                        type="number" 
                        min="1" 
                        max={row.max_quantity}
                        disabled={row.item_id === ""}
                        className="w-full bg-white border-2 border-slate-200 p-3 text-sm font-bold text-slate-900 focus:border-[#6A00F4] focus:outline-none transition-colors"
                        value={row.quantity}
                        onChange={(e) => {
                          const val = parseInt(e.target.value);
                          handleQuantityChange(row.id, isNaN(val) ? "" : val);
                        }}
                      />
                    </div>

                    <button type="button" onClick={() => removeRow(row.id)} className={`w-full sm:w-12 h-[48px] flex items-center justify-center border-2 border-slate-200 bg-white hover:bg-red-50 hover:text-red-500 hover:border-red-200 transition-colors ${requestedItems.length === 1 ? 'opacity-50 cursor-not-allowed' : ''}`} disabled={requestedItems.length === 1}>
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <button type="submit" disabled={isSubmitting} className="w-full bg-[#6A00F4] text-white py-5 text-sm font-black uppercase tracking-widest -skew-x-6 hover:bg-[#ccff00] hover:text-black transition-all shadow-[4px_4px_0_0_rgba(15,23,42,1)] disabled:opacity-50 disabled:cursor-not-allowed">
              <span className="block skew-x-6">{isSubmitting ? "TRANSMITTING..." : "DEPLOY REQUEST"}</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
}