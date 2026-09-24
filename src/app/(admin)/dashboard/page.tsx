"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function AdminDashboard() {
  const router = useRouter();

  // --- NAVIGATION & LAYOUT STATES ---
  const [activeTab, setActiveTab] = useState("requests");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // NEW: Controls mobile sidebar

  // --- DATA STATES ---
  const [inventory, setInventory] = useState<any[]>([]);
  const [issuedRecords, setIssuedRecords] = useState<any[]>([]);
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [pendingRequests, setPendingRequests] = useState<any[]>([]);
  const [historyLogs, setHistoryLogs] = useState<any[]>([]);
  const [issueHistory, setIssueHistory] = useState<any[]>([]);

  // --- FORM STATES (INVENTORY) ---
  const [itemName, setItemName] = useState("");
  const [quantity, setQuantity] = useState("");
  const [category, setCategory] = useState("General");
  const [showCustomCategory, setShowCustomCategory] = useState(false);
  const [itemStatus, setItemStatus] = useState("");
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [originalTotalQty, setOriginalTotalQty] = useState(0);

  // --- FORM STATES (ANNOUNCEMENTS) ---
  const [annTitle, setAnnTitle] = useState("");
  const [annDesc, setAnnDesc] = useState("");
  const [annIcon, setAnnIcon] = useState("trophy"); 
  const [annStatus, setAnnStatus] = useState("");
  const [editingAnnId, setEditingAnnId] = useState<string | null>(null);

  // --- FORM STATES (ISSUE) ---
  const [studentName, setStudentName] = useState("");
  const [rollNo, setRollNo] = useState("");
  const [semester, setSemester] = useState("");
  const [branch, setBranch] = useState("");
  const [phone, setPhone] = useState("");
  const [issuedItem, setIssuedItem] = useState("");
  const [issueQuantity, setIssueQuantity] = useState("1");
  const [issueStatus, setIssueStatus] = useState("");
  
  const [isProcessing, setIsProcessing] = useState<string | null>(null);

  // --- FETCH INITIAL DATA & CHECK AUTH ---
  const fetchData = async () => {
    const { data: sportsData } = await supabase.from("sports_items").select("*").order("item_name");
    if (sportsData) setInventory(sportsData);

    const { data: issuedData } = await supabase.from("issued_items").select("*").eq("status", "active").order("issue_date", { ascending: false });
    if (issuedData) setIssuedRecords(issuedData);

    const { data: annData } = await supabase.from("announcements").select("*").order("date_posted", { ascending: false });
    if (annData) setAnnouncements(annData);

    const { data: reqData } = await supabase.from("item_requests").select("*").eq("status", "pending").order("request_date", { ascending: false });
    if (reqData) setPendingRequests(reqData);

    const { data: histData } = await supabase.from("item_requests").select("*").neq("status", "pending").order("request_date", { ascending: false }).limit(100);
    if (histData) setHistoryLogs(histData);

    const { data: issueHistData } = await supabase.from("issued_items").select("*").eq("status", "returned").order("returned_at", { ascending: false }).limit(100);
    if (issueHistData) setIssueHistory(issueHistData);
  };

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) router.push("/login");
      else fetchData();
    };
    checkAuth();
  }, [router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  // --- APPROVAL HANDLERS ---
  const handleApproveRequest = async (req: any) => {
    setIsProcessing(req.id); 
    const { error } = await supabase.rpc('approve_item_request', { req_id: req.id });

    if (error) alert("Failed to approve: " + error.message);
    else {
      if (req.student_email) {
        await fetch('/api/notify-student', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ student_email: req.student_email, student_name: req.student_name, item_name: req.item_name, quantity: req.quantity, status: 'approved' })
        });
      }
      fetchData(); 
    }
    setIsProcessing(null);
  };

  const handleRejectRequest = async (req: any) => {
    if (!window.confirm("Are you sure you want to reject this request?")) return;
    setIsProcessing(req.id);
    const { error } = await supabase.from("item_requests").update({ status: "rejected" }).eq("id", req.id);

    if (error) alert("Failed to reject: " + error.message);
    else {
      if (req.student_email) {
        await fetch('/api/notify-student', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ student_email: req.student_email, student_name: req.student_name, item_name: req.item_name, quantity: req.quantity, status: 'rejected' })
        });
      }
      fetchData(); 
    }
    setIsProcessing(null);
  };

  // --- SAVE / UPDATE ITEM HANDLER ---
  const handleSaveItem = async (e: React.FormEvent) => {
    e.preventDefault();
    setItemStatus(editingItemId ? "Updating..." : "Saving...");
    const finalCategory = category.trim() || "General";
    const newTotal = parseInt(quantity);

    if (editingItemId) {
      const itemToEdit = inventory.find(i => i.id === editingItemId);
      const quantityDifference = newTotal - originalTotalQty;
      const newAvailable = Math.max(0, itemToEdit.available_quantity + quantityDifference);

      const { error } = await supabase.from("sports_items").update({ item_name: itemName, category: finalCategory, total_quantity: newTotal, available_quantity: newAvailable }).eq("id", editingItemId);

      if (error) setItemStatus("❌ Error updating item.");
      else { setItemStatus("✅ Item updated!"); cancelEditItem(); fetchData(); }
    } else {
      const { error } = await supabase.from("sports_items").insert([{ item_name: itemName, category: finalCategory, total_quantity: newTotal, available_quantity: newTotal }]);
      if (error) setItemStatus("❌ Error saving item.");
      else { setItemStatus("✅ Item added!"); setItemName(""); setQuantity(""); setShowCustomCategory(false); fetchData(); }
    }
    setTimeout(() => setItemStatus(""), 3000);
  };

  const startEditItem = (item: any) => {
    setEditingItemId(item.id); setItemName(item.item_name); setCategory(item.category || "General"); setQuantity(item.total_quantity.toString()); setOriginalTotalQty(item.total_quantity); setActiveTab("inventory");
  };

  const cancelEditItem = () => { setEditingItemId(null); setItemName(""); setCategory("General"); setQuantity(""); setShowCustomCategory(false); };

  // --- SAVE / UPDATE ANNOUNCEMENT HANDLER ---
  const handleSaveAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    setAnnStatus(editingAnnId ? "Updating..." : "Posting...");

    if (editingAnnId) {
      const { error } = await supabase.from("announcements").update({ title: annTitle, description: annDesc, icon_type: annIcon }).eq("id", editingAnnId);
      if (error) setAnnStatus("❌ Error updating.");
      else { setAnnStatus("✅ Updated!"); cancelEditAnn(); fetchData(); }
    } else {
      const { error } = await supabase.from("announcements").insert([{ title: annTitle, description: annDesc, icon_type: annIcon }]);
      if (error) setAnnStatus("❌ Error posting.");
      else { setAnnStatus("✅ Posted!"); setAnnTitle(""); setAnnDesc(""); fetchData(); }
    }
    setTimeout(() => setAnnStatus(""), 3000);
  };

  const startEditAnn = (ann: any) => {
    setEditingAnnId(ann.id); setAnnTitle(ann.title); setAnnDesc(ann.description); setAnnIcon(ann.icon_type || "trophy"); setActiveTab("announcements");
  };

  const cancelEditAnn = () => { setEditingAnnId(null); setAnnTitle(""); setAnnDesc(""); setAnnIcon("trophy"); };

  const handleIssueItem = async (e: React.FormEvent) => {
    e.preventDefault();
    setIssueStatus("Processing...");
    const itemToUpdate = inventory.find(i => i.item_name === issuedItem);
    const reqQty = parseInt(issueQuantity);

    if (!itemToUpdate) return setIssueStatus("❌ Please select an item.");
    if (itemToUpdate.available_quantity < reqQty) return setIssueStatus(`❌ Not enough stock! Only ${itemToUpdate.available_quantity} left.`);

    const { error } = await supabase.from("issued_items").insert([{
        student_name: studentName, roll_no: rollNo, semester: semester, 
        branch: branch, phone_number: phone, item_issued: issuedItem, quantity: reqQty, status: 'active',issue_date: new Date().toISOString()
    }]);

    if (error) setIssueStatus("❌ Error saving record.");
    else {
      const newQty = itemToUpdate.available_quantity - reqQty;
      await supabase.from("sports_items").update({ available_quantity: newQty }).eq("id", itemToUpdate.id);
      setIssueStatus("✅ Equipment Issued!");
      setStudentName(""); setRollNo(""); setSemester(""); setBranch(""); setPhone(""); setIssueQuantity("1"); setIssuedItem("");
      fetchData(); 
      setTimeout(() => setIssueStatus(""), 3000);
    }
  };

  // --- RETURN & DELETE HANDLERS ---
  const handleReturnEquipment = async (record: any) => {
    if (!window.confirm(`Mark ${record.quantity}x ${record.item_issued} as returned by ${record.student_name}?`)) return;
    const { error } = await supabase.from("issued_items").update({ status: 'returned', returned_at: new Date().toISOString() }).eq("id", record.id);
    if (error) { alert("Error returning equipment: " + error.message); return; }

    const itemToUpdate = inventory.find(i => i.item_name === record.item_issued);
    if (itemToUpdate) {
      const newQty = itemToUpdate.available_quantity + record.quantity;
      await supabase.from("sports_items").update({ available_quantity: newQty }).eq("id", itemToUpdate.id);
    }
    fetchData(); 
  };

  const handleDeleteItem = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to permanently delete "${name}" from inventory?`)) return;
    const { error } = await supabase.from("sports_items").delete().eq("id", id);
    if (error) {
      alert(`❌ Cannot delete "${name}".\n\nThis usually means the item is currently active in 'Pending Requests' or 'Issued Equipment'. You must Reject/Return those active records before you can delete the item from the database forever.`);
      console.error("Deletion Blocked:", error.message || "Foreign key constraint", error.details || "");
    } else fetchData();
  };

  const handleDeleteAnnouncement = async (id: string, title: string) => {
    if (!window.confirm(`Are you sure you want to delete the announcement "${title}"?`)) return;
    await supabase.from("announcements").delete().eq("id", id);
    fetchData();
  };

  const uniqueCategories = Array.from(new Set([
    "Cricket", "Football", "Badminton", "Volleyball", "Basketball", "Athletics", "Indoor Games", "General",
    ...inventory.map(i => i.category).filter(Boolean)
  ])).sort();

  // Helper to change tab and close sidebar on mobile
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    setIsSidebarOpen(false);
  };

  return (
    <div className="flex h-screen bg-gray-50 font-sans text-gray-800 overflow-hidden relative">
      
      {/* --- MOBILE OVERLAY --- */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-sm" 
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* --- RESPONSIVE SIDEBAR --- */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-slate-950 text-white flex flex-col h-full shadow-[4px_0_15px_rgba(0,0,0,0.5)] transform transition-transform duration-300 lg:relative lg:translate-x-0 shrink-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-6 border-b border-slate-800 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-black uppercase italic tracking-tighter text-[#ccff00]">CITK Sports</h1>
            <p className="text-[10px] text-slate-400 uppercase tracking-widest mt-1">Admin Command Center</p>
          </div>
          {/* Mobile Close Button */}
          <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden text-slate-400 hover:text-white">✕</button>
        </div>
        
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          <button onClick={() => handleTabChange("requests")} className={`w-full flex items-center justify-between p-3 rounded-lg text-sm font-bold transition-all ${activeTab === 'requests' ? 'bg-[#ccff00] text-black shadow-[4px_4px_0_0_#6A00F4] -skew-x-2' : 'text-slate-400 hover:bg-slate-900 hover:text-white'}`}>
            <span className={`flex items-center gap-3 ${activeTab === 'requests' && 'skew-x-2'}`}><span>🔔</span> Requests</span>
            {pendingRequests.length > 0 && <span className="bg-red-500 text-white text-[10px] px-2 py-0.5 rounded-full">{pendingRequests.length}</span>}
          </button>
          
          <button onClick={() => handleTabChange("inventory")} className={`w-full flex items-center p-3 rounded-lg text-sm font-bold transition-all ${activeTab === 'inventory' ? 'bg-[#ccff00] text-black shadow-[4px_4px_0_0_#6A00F4] -skew-x-2' : 'text-slate-400 hover:bg-slate-900 hover:text-white'}`}>
            <span className={`flex items-center gap-3 ${activeTab === 'inventory' && 'skew-x-2'}`}><span>📦</span> Inventory Setup</span>
          </button>

          <button onClick={() => handleTabChange("issue")} className={`w-full flex items-center p-3 rounded-lg text-sm font-bold transition-all ${activeTab === 'issue' ? 'bg-[#ccff00] text-black shadow-[4px_4px_0_0_#6A00F4] -skew-x-2' : 'text-slate-400 hover:bg-slate-900 hover:text-white'}`}>
            <span className={`flex items-center gap-3 ${activeTab === 'issue' && 'skew-x-2'}`}><span>📝</span> Issue & Tracking</span>
          </button>

          <button onClick={() => handleTabChange("announcements")} className={`w-full flex items-center p-3 rounded-lg text-sm font-bold transition-all ${activeTab === 'announcements' ? 'bg-[#ccff00] text-black shadow-[4px_4px_0_0_#6A00F4] -skew-x-2' : 'text-slate-400 hover:bg-slate-900 hover:text-white'}`}>
            <span className={`flex items-center gap-3 ${activeTab === 'announcements' && 'skew-x-2'}`}><span>📢</span> Announcements</span>
          </button>

          <button onClick={() => handleTabChange("history")} className={`w-full flex items-center p-3 rounded-lg text-sm font-bold transition-all ${activeTab === 'history' ? 'bg-[#ccff00] text-black shadow-[4px_4px_0_0_#6A00F4] -skew-x-2' : 'text-slate-400 hover:bg-slate-900 hover:text-white'}`}>
            <span className={`flex items-center gap-3 ${activeTab === 'history' && 'skew-x-2'}`}><span>📜</span> History & Logs</span>
          </button>
        </nav>

        <div className="p-4 border-t border-slate-800">
          <button onClick={handleLogout} className="w-full bg-slate-800 text-slate-300 px-4 py-3 rounded-md text-sm font-bold hover:bg-red-500 hover:text-white transition-colors">Secure Logout</button>
        </div>
      </aside>

      {/* --- MAIN CONTENT LAYOUT --- */}
      <div className="flex-1 flex flex-col h-full overflow-hidden w-full relative">
        
        {/* --- MOBILE HEADER --- */}
        <header className="lg:hidden bg-slate-950 text-white p-4 flex items-center justify-between shrink-0 shadow-md">
          <div>
            <h1 className="text-xl font-black uppercase italic tracking-tighter text-[#ccff00]">CITK Sports</h1>
            <p className="text-[10px] text-slate-400 uppercase tracking-widest">Admin</p>
          </div>
          <button 
            onClick={() => setIsSidebarOpen(true)} 
            className="p-2 bg-slate-800 rounded-md text-[#ccff00] hover:bg-slate-700 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </header>

        {/* --- SCROLLABLE MAIN CONTENT --- */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8 lg:p-12">
          <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-300 pb-12">
            
            {/* VIEW: PENDING REQUESTS */}
            {activeTab === "requests" && (
              <div>
                <div className="mb-6 md:mb-8">
                  <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900">Queue Management</h2>
                  <p className="text-sm text-gray-500 mt-1">Review and approve student gear requests.</p>
                </div>

                <div className="bg-white rounded-xl p-4 md:p-6 border border-gray-200 shadow-sm">
                  <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-4 md:mb-6 flex items-center gap-2">
                    🔔 Pending Requests
                    {pendingRequests.length > 0 && <span className="bg-orange-600 text-white text-xs px-2 py-1 rounded-full">{pendingRequests.length}</span>}
                  </h3>
                  {pendingRequests.length > 0 ? (
                    <div className="overflow-x-auto bg-white rounded-lg border border-gray-200">
                      <table className="w-full text-left text-sm whitespace-nowrap md:whitespace-normal">
                        <thead>
                          <tr className="bg-gray-50 text-gray-700">
                            <th className="p-4 font-semibold border-b">Date</th>
                            <th className="p-4 font-semibold border-b">Student Info</th>
                            <th className="p-4 font-semibold border-b">Gear Requested</th>
                            <th className="p-4 font-semibold text-right border-b">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {pendingRequests.map((req) => (
                            <tr key={req.id} className="hover:bg-gray-50 transition-colors">
                              <td className="p-4 text-gray-600 font-medium">{new Date(req.request_date).toLocaleDateString()}</td>
                              <td className="p-4"><span className="font-bold text-gray-900">{req.student_name}</span> <br/><span className="text-xs text-gray-500">{req.roll_no} • {req.branch} (S{req.semester})</span></td>
                              <td className="p-4 font-bold text-[#6A00F4]">{req.quantity}x {req.item_name}</td>
                              <td className="p-4 text-right">
                                <div className="flex justify-end gap-2">
                                  <button onClick={() => handleRejectRequest(req)} disabled={isProcessing !== null} className="bg-white text-red-600 border border-red-200 px-3 py-2 rounded text-xs font-bold hover:bg-red-50 disabled:opacity-50">Reject</button>
                                  <button onClick={() => handleApproveRequest(req)} disabled={isProcessing !== null} className="bg-black text-[#ccff00] px-4 py-2 rounded text-xs font-bold hover:bg-[#6A00F4] hover:text-white transition-colors disabled:opacity-50">{isProcessing === req.id ? "Processing..." : "Approve"}</button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : <div className="border-2 border-dashed border-gray-200 rounded-lg p-12 text-center text-gray-500 font-medium">All caught up! No pending requests at this time.</div>}
                </div>
              </div>
            )}

            {/* VIEW: INVENTORY SETUP */}
            {activeTab === "inventory" && (
              <div>
                <div className="mb-6 md:mb-8">
                  <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900">Inventory Setup</h2>
                  <p className="text-sm text-gray-500 mt-1">Add, edit, or remove gear from the master database.</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
                  <div className="lg:col-span-1">
                    <div className={`rounded-xl p-4 md:p-6 border shadow-sm transition-colors ${editingItemId ? 'bg-yellow-50 border-yellow-200' : 'bg-blue-50 border-blue-100'}`}>
                      <h2 className={`text-xl font-bold mb-4 ${editingItemId ? 'text-yellow-900' : 'text-blue-900'}`}>{editingItemId ? "✏️ Edit Item" : "➕ Add Item"}</h2>
                      <form onSubmit={handleSaveItem} className="space-y-4">
                        <input type="text" required value={itemName} onChange={(e) => setItemName(e.target.value)} className="w-full border border-gray-200 rounded-md p-3 text-sm" placeholder="Item Name (e.g. Bat)" />
                        <div className="flex gap-2">
                          {!showCustomCategory ? (
                            <select required value={category} onChange={(e) => { if (e.target.value === "ADD_NEW") { setShowCustomCategory(true); setCategory(""); } else setCategory(e.target.value); }} className="w-full border border-gray-200 rounded-md p-3 text-sm bg-white font-medium">
                              <option value="" disabled>Select Category...</option>
                              {uniqueCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                              <option value="ADD_NEW" className="font-bold text-blue-600">➕ Add New Category...</option>
                            </select>
                          ) : (
                            <div className="flex w-full gap-2">
                              <input type="text" required value={category} onChange={(e) => setCategory(e.target.value)} className="w-full border border-gray-200 rounded-md p-3 text-sm" placeholder="New category..." autoFocus />
                              <button type="button" onClick={() => { setShowCustomCategory(false); setCategory("General"); }} className="bg-gray-200 text-gray-700 px-3 py-2 rounded-md font-bold">✕</button>
                            </div>
                          )}
                        </div>
                        <input type="number" required min="1" value={quantity} onChange={(e) => setQuantity(e.target.value)} className="w-full border border-gray-200 rounded-md p-3 text-sm" placeholder="Total Quantity (e.g. 10)" />
                        <div className="flex gap-2 pt-2">
                          <button type="submit" className={`flex-1 text-white px-4 py-3 rounded-md text-sm font-bold transition-colors ${editingItemId ? 'bg-yellow-600 hover:bg-yellow-700' : 'bg-blue-600 hover:bg-blue-700'}`}>{editingItemId ? "Update" : "Save Item"}</button>
                          {editingItemId && <button type="button" onClick={cancelEditItem} className="bg-gray-200 text-gray-700 px-4 py-3 rounded-md text-sm font-bold hover:bg-gray-300 transition-colors">Cancel</button>}
                        </div>
                        {itemStatus && <p className={`text-sm font-bold mt-2 text-center ${editingItemId ? 'text-yellow-800' : 'text-blue-800'}`}>{itemStatus}</p>}
                      </form>
                    </div>
                  </div>

                  <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                    <div className="bg-gray-50 border-b border-gray-200 p-4"><h3 className="font-bold text-gray-900">Master Inventory List</h3></div>
                    <div className="p-0 overflow-x-auto">
                      <table className="w-full text-left text-sm whitespace-nowrap">
                        <thead className="bg-white border-b border-gray-100">
                          <tr className="text-gray-500"><th className="p-4 font-semibold">Item & Category</th><th className="p-4 font-semibold">Stock Level</th><th className="p-4 font-semibold text-right">Actions</th></tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {inventory.map((item) => (
                            <tr key={item.id} className={`hover:bg-gray-50 ${editingItemId === item.id ? 'bg-yellow-50' : ''}`}>
                              <td className="p-4 font-bold text-gray-900">{item.item_name} <br/><span className="text-xs text-gray-500 font-normal">{item.category || 'General'}</span></td>
                              <td className="p-4 text-gray-600 text-sm"><span className={`font-bold ${item.available_quantity > 0 ? 'text-emerald-600' : 'text-red-500'}`}>{item.available_quantity} Avail</span> <span className="text-gray-400 mx-1">/</span> {item.total_quantity} Total</td>
                              <td className="p-4 text-right">
                                <button onClick={() => startEditItem(item)} className="text-blue-600 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded text-xs font-bold mr-2 transition-colors">Edit</button>
                                <button onClick={() => handleDeleteItem(item.id, item.item_name)} className="text-red-600 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded text-xs font-bold transition-colors">Del</button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* VIEW: ISSUE & TRACKING */}
            {activeTab === "issue" && (
              <div>
                <div className="mb-6 md:mb-8">
                  <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900">Issue & Tracking</h2>
                  <p className="text-sm text-gray-500 mt-1">Manually issue gear to walk-ins and track active loans.</p>
                </div>

                <div className="bg-purple-50 rounded-xl p-4 md:p-6 border border-purple-100 shadow-sm mb-6 md:mb-8">
                  <h3 className="text-lg md:text-xl font-bold text-purple-900 mb-4">📝 Fast Issue Form</h3>
                  <form onSubmit={handleIssueItem} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <input type="text" required value={studentName} onChange={(e) => setStudentName(e.target.value)} className="w-full border border-purple-200 rounded-md p-3 text-sm" placeholder="Student Name" />
                    <input type="text" required value={rollNo} onChange={(e) => setRollNo(e.target.value)} className="w-full border border-purple-200 rounded-md p-3 text-sm" placeholder="Roll Number" />
                    <input type="text" required value={branch} onChange={(e) => setBranch(e.target.value)} className="w-full border border-purple-200 rounded-md p-3 text-sm" placeholder="Branch" />
                    <input type="text" required value={semester} onChange={(e) => setSemester(e.target.value)} className="w-full border border-purple-200 rounded-md p-3 text-sm" placeholder="Semester" />
                    <input type="text" required value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full border border-purple-200 rounded-md p-3 text-sm lg:col-span-1" placeholder="Phone" />
                    <select required value={issuedItem} onChange={(e) => setIssuedItem(e.target.value)} className="w-full border border-purple-200 rounded-md p-3 text-sm lg:col-span-2 bg-white">
  <option value="" disabled>Select Item to Issue...</option>
  {inventory.map(item => (
    <option key={item.id} value={item.item_name}>
      {item.item_name} - {item.category || 'General'} ({item.available_quantity} available)
    </option>
  ))}
</select>
                    <input type="number" required min="1" value={issueQuantity} onChange={(e) => setIssueQuantity(e.target.value)} className="w-full border border-purple-200 rounded-md p-3 text-sm lg:col-span-1" placeholder="Qty" />
                    <div className="md:col-span-2 lg:col-span-4 flex items-center gap-4 mt-2">
                      <button type="submit" className="bg-purple-600 text-white px-6 md:px-8 py-3 rounded-md text-sm font-bold hover:bg-purple-700 transition-colors w-full md:w-auto">Issue Record Now</button>
                      {issueStatus && <p className="text-sm font-bold text-purple-800">{issueStatus}</p>}
                    </div>
                  </form>
                </div>

                <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                  <div className="bg-gray-50 border-b border-gray-200 p-4"><h3 className="font-bold text-gray-900">Active Issued Equipment (Currently out)</h3></div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm whitespace-nowrap">
                      <thead><tr className="text-gray-500 border-b border-gray-100 bg-white"><th className="p-4 font-semibold">Student</th><th className="p-4 font-semibold">Roll No / Branch</th><th className="p-4 font-semibold text-purple-600">Item Issued (Qty)</th><th className="p-4 font-semibold text-right">Action</th></tr></thead>
                      <tbody className="divide-y divide-gray-100">
                        {issuedRecords.length > 0 ? issuedRecords.map((record) => (
                          <tr key={record.id} className="hover:bg-gray-50 transition-colors">
                            <td className="p-4 font-medium text-gray-900">{record.student_name}</td>
                            <td className="p-4 text-gray-600">
  {record.roll_no} • {record.branch} <br/>
  <span className="text-xs font-medium text-[#6A00F4] mt-1 inline-block">
    📞 {record.phone_number || "N/A"}
  </span>
</td>
                            <td className="p-4 font-bold text-purple-700">{record.item_issued} (x{record.quantity || 1})</td>
                            <td className="p-4 text-right"><button onClick={() => handleReturnEquipment(record)} className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-4 py-2 rounded text-xs font-bold hover:bg-emerald-600 hover:text-white transition-colors">Mark Returned</button></td>
                          </tr>
                        )) : <tr><td colSpan={4} className="p-12 text-center text-gray-400 font-medium">No equipment currently issued. The vault is full!</td></tr>}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* VIEW: ANNOUNCEMENTS */}
            {activeTab === "announcements" && (
              <div>
                <div className="mb-6 md:mb-8">
                  <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900">Announcements</h2>
                  <p className="text-sm text-gray-500 mt-1">Post updates, tournament alerts, or news to the student portal.</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
                  <div className="lg:col-span-1">
                    <div className={`rounded-xl p-4 md:p-6 border shadow-sm transition-colors ${editingAnnId ? 'bg-yellow-50 border-yellow-200' : 'bg-emerald-50 border-emerald-100'}`}>
                      <h2 className={`text-xl font-bold mb-4 ${editingAnnId ? 'text-yellow-900' : 'text-emerald-900'}`}>{editingAnnId ? "✏️ Edit Post" : "📢 New Post"}</h2>
                      <form onSubmit={handleSaveAnnouncement} className="space-y-4">
                        <input type="text" required value={annTitle} onChange={(e) => setAnnTitle(e.target.value)} className="w-full border border-gray-200 rounded-md p-3 text-sm" placeholder="Title" />
                        <textarea required rows={4} value={annDesc} onChange={(e) => setAnnDesc(e.target.value)} className="w-full border border-gray-200 rounded-md p-3 text-sm resize-none" placeholder="Details..." />
                        <select value={annIcon} onChange={(e) => setAnnIcon(e.target.value)} className="w-full border border-gray-200 rounded-md p-3 text-sm bg-white">
                          <option value="trophy">🏆 Trophy</option>
                          <option value="briefcase">💼 Briefcase</option>
                          <option value="calendar">📅 Calendar</option>
                        </select>
                        <div className="flex gap-2 pt-2">
                          <button type="submit" className={`flex-1 text-white px-4 py-3 rounded-md text-sm font-bold transition-colors ${editingAnnId ? 'bg-yellow-600 hover:bg-yellow-700' : 'bg-emerald-600 hover:bg-emerald-700'}`}>{editingAnnId ? "Update" : "Publish"}</button>
                          {editingAnnId && <button type="button" onClick={cancelEditAnn} className="bg-gray-200 text-gray-700 px-4 py-3 rounded-md text-sm font-bold hover:bg-gray-300 transition-colors">Cancel</button>}
                        </div>
                        {annStatus && <p className={`text-sm font-bold mt-2 text-center ${editingAnnId ? 'text-yellow-800' : 'text-emerald-800'}`}>{annStatus}</p>}
                      </form>
                    </div>
                  </div>

                  <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                    <div className="bg-gray-50 border-b border-gray-200 p-4"><h3 className="font-bold text-gray-900">Live Announcements</h3></div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-sm whitespace-nowrap">
                        <thead className="bg-white border-b border-gray-100">
                          <tr className="text-gray-500"><th className="p-4 font-semibold">Announcement</th><th className="p-4 font-semibold">Date Posted</th><th className="p-4 font-semibold text-right">Actions</th></tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {announcements.length > 0 ? announcements.map((ann) => (
                            <tr key={ann.id} className={`hover:bg-gray-50 ${editingAnnId === ann.id ? 'bg-yellow-50' : ''}`}>
                              <td className="p-4"><span className="font-bold text-gray-900 text-base">{ann.title}</span><br/><span className="text-gray-500 text-xs mt-1 block truncate max-w-[200px] md:max-w-md">{ann.description}</span></td>
                              <td className="p-4 text-gray-600">{new Date(ann.date_posted).toLocaleDateString()}</td>
                              <td className="p-4 text-right">
                                <button onClick={() => startEditAnn(ann)} className="text-blue-600 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded text-xs font-bold mr-2 transition-colors">Edit</button>
                                <button onClick={() => handleDeleteAnnouncement(ann.id, ann.title)} className="text-red-600 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded text-xs font-bold transition-colors">Del</button>
                              </td>
                            </tr>
                          )) : <tr><td colSpan={3} className="p-12 text-center text-gray-400 font-medium">No active announcements.</td></tr>}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* VIEW: HISTORY & LOGS */}
            {activeTab === "history" && (
              <div className="space-y-6 md:space-y-8">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-6 md:mb-8">
                  <div>
                    <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900">History & Logs</h2>
                    <p className="text-sm text-gray-500 mt-1">Audit trail of past gear requests and returned equipment.</p>
                  </div>
                  <button onClick={fetchData} className="w-full sm:w-auto text-xs font-bold text-blue-600 bg-blue-50 px-4 py-2 rounded-md hover:bg-blue-100 transition-colors">↻ Refresh Data</button>
                </div>

                <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                  <div className="bg-purple-50 border-b border-purple-100 p-4"><h3 className="font-bold text-purple-900">Equipment Return Log</h3></div>
                  <div className="overflow-x-auto max-h-[400px] overflow-y-auto">
                    <table className="w-full text-left text-sm whitespace-nowrap">
                      <thead className="sticky top-0 bg-white">
                        <tr className="border-b border-gray-100 text-gray-500">
                          <th className="p-4 font-semibold">Timestamps</th>
                          <th className="p-4 font-semibold">Student Info</th>
                          <th className="p-4 font-semibold">Gear Borrowed</th>
                          <th className="p-4 font-semibold text-right">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
  {issueHistory.length > 0 ? issueHistory.map((log) => (
    <tr key={log.id} className="hover:bg-gray-50 transition-colors">
      
      <td className="p-4">
        <span className="text-xs text-gray-500">Issued: {new Date(log.issue_date).toLocaleDateString()}</span><br/>
        <span className="text-sm font-bold text-gray-900">Returned: {log.returned_at ? new Date(log.returned_at).toLocaleString() : 'N/A'}</span>
      </td>
      
      <td className="p-4">
        <span className="font-bold text-gray-900">{log.student_name}</span> <br/>
        <span className="text-xs text-gray-500 font-medium">
          {log.roll_no} • {log.branch} <br/>
          <span className="text-[#6A00F4] mt-1 inline-block">📞 {log.phone_number || "N/A"}</span>
        </span>
      </td>
      
      <td className="p-4 font-bold text-purple-700">
        {log.quantity}x {log.item_issued}
      </td>
      
      <td className="p-4 text-right">
        <span className="px-3 py-1 rounded text-xs font-bold uppercase tracking-wider bg-gray-100 text-gray-700">Returned</span>
      </td>
      
    </tr>
  )) : (
    <tr>
      <td colSpan={4} className="p-12 text-center text-gray-400 font-medium">
        No returned equipment logs available.
      </td>
    </tr>
  )}
</tbody>
                    </table>
                  </div>
                </div>

                <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden mt-8">
                  <div className="bg-gray-50 border-b border-gray-200 p-4"><h3 className="font-bold text-gray-900">Online Request Audit Log</h3></div>
                  <div className="overflow-x-auto max-h-[400px] overflow-y-auto">
                    <table className="w-full text-left text-sm whitespace-nowrap">
                      <thead className="sticky top-0 bg-white">
                        <tr className="border-b border-gray-100 text-gray-500">
                          <th className="p-4 font-semibold">Date Resolved</th>
                          <th className="p-4 font-semibold">Student Info</th>
                          <th className="p-4 font-semibold">Gear Requested</th>
                          <th className="p-4 font-semibold text-right">Verdict</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {historyLogs.length > 0 ? historyLogs.map((log) => (
                          <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                            <td className="p-4 text-gray-600">{new Date(log.request_date).toLocaleString()}</td>
                            <td className="p-4"><span className="font-bold text-gray-900">{log.student_name}</span> <br/><span className="text-xs text-gray-500">{log.roll_no} • {log.branch}</span></td>
                            <td className="p-4 font-bold text-gray-700">{log.quantity}x {log.item_name}</td>
                            <td className="p-4 text-right">
                              <span className={`px-3 py-1 rounded text-xs font-bold uppercase tracking-wider ${log.status === 'approved' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>{log.status}</span>
                            </td>
                          </tr>
                        )) : <tr><td colSpan={4} className="p-12 text-center text-gray-400 font-medium">No request history logs available.</td></tr>}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

          </div>
        </main>
      </div>
    </div>
  );
}