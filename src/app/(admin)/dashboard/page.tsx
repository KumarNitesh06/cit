"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function AdminDashboard() {
  const router = useRouter();

  // --- DATA STATES ---
  const [inventory, setInventory] = useState<any[]>([]);
  const [issuedRecords, setIssuedRecords] = useState<any[]>([]);
  const [announcements, setAnnouncements] = useState<any[]>([]); // NEW

  // --- FORM STATES ---
  const [itemName, setItemName] = useState("");
  const [quantity, setQuantity] = useState("");
  const [itemStatus, setItemStatus] = useState("");

  const [annTitle, setAnnTitle] = useState("");
  const [annDesc, setAnnDesc] = useState("");
  const [annIcon, setAnnIcon] = useState("trophy"); 
  const [annStatus, setAnnStatus] = useState("");

  const [studentName, setStudentName] = useState("");
  const [rollNo, setRollNo] = useState("");
  const [semester, setSemester] = useState("");
  const [branch, setBranch] = useState("");
  const [phone, setPhone] = useState("");
  const [issuedItem, setIssuedItem] = useState("");
  const [issueQuantity, setIssueQuantity] = useState("1");
  const [issueStatus, setIssueStatus] = useState("");

  // --- FETCH INITIAL DATA & CHECK AUTH ---
  const fetchData = async () => {
    const { data: sportsData } = await supabase.from("sports_items").select("*").order("item_name");
    if (sportsData) setInventory(sportsData);

    const { data: issuedData } = await supabase.from("issued_items").select("*").order("issue_date", { ascending: false });
    if (issuedData) setIssuedRecords(issuedData);

    // NEW: Fetch Announcements
    const { data: annData } = await supabase.from("announcements").select("*").order("date_posted", { ascending: false });
    if (annData) setAnnouncements(annData);
  };

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) router.push("/login");
      else fetchData();
    };
    checkAuth();
  }, [router]);

  // --- LOGOUT HANDLER ---
  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  // --- SUBMIT HANDLERS ---
  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    setItemStatus("Saving...");
    const { error } = await supabase.from("sports_items").insert([
      { item_name: itemName, total_quantity: parseInt(quantity), available_quantity: parseInt(quantity) },
    ]);
    if (error) setItemStatus("❌ Error saving item.");
    else {
      setItemStatus("✅ Item added!");
      setItemName(""); setQuantity("");
      fetchData(); 
      setTimeout(() => setItemStatus(""), 3000);
    }
  };

  const handleAddAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    setAnnStatus("Posting...");
    const { error } = await supabase.from("announcements").insert([
      { title: annTitle, description: annDesc, icon_type: annIcon },
    ]);
    if (error) setAnnStatus("❌ Error posting.");
    else {
      setAnnStatus("✅ Posted!");
      setAnnTitle(""); setAnnDesc("");
      fetchData(); // Refresh announcements list
      setTimeout(() => setAnnStatus(""), 3000);
    }
  };

  const handleIssueItem = async (e: React.FormEvent) => {
    e.preventDefault();
    setIssueStatus("Processing...");

    const itemToUpdate = inventory.find(i => i.item_name === issuedItem);
    const reqQty = parseInt(issueQuantity);

    if (!itemToUpdate) {
      setIssueStatus("❌ Please select an item.");
      return;
    }
    if (itemToUpdate.available_quantity < reqQty) {
      setIssueStatus(`❌ Not enough stock! Only ${itemToUpdate.available_quantity} left.`);
      return;
    }

    const { error } = await supabase.from("issued_items").insert([{
        student_name: studentName, roll_no: rollNo, semester: semester, 
        branch: branch, phone_number: phone, item_issued: issuedItem, quantity: reqQty
    }]);

    if (error) {
      setIssueStatus("❌ Error saving record.");
    } else {
      const newQty = itemToUpdate.available_quantity - reqQty;
      await supabase.from("sports_items").update({ available_quantity: newQty }).eq("id", itemToUpdate.id);

      setIssueStatus("✅ Equipment Issued!");
      setStudentName(""); setRollNo(""); setSemester(""); setBranch(""); setPhone(""); setIssueQuantity("1"); setIssuedItem("");
      fetchData(); 
      setTimeout(() => setIssueStatus(""), 3000);
    }
  };

  // --- DELETE HANDLERS (NEW) ---
  const handleReturnEquipment = async (record: any) => {
    if (!window.confirm(`Mark ${record.quantity}x ${record.item_issued} as returned by ${record.student_name}?`)) return;
    await supabase.from("issued_items").delete().eq("id", record.id);
    const itemToUpdate = inventory.find(i => i.item_name === record.item_issued);
    if (itemToUpdate) {
      const newQty = itemToUpdate.available_quantity + record.quantity;
      await supabase.from("sports_items").update({ available_quantity: newQty }).eq("id", itemToUpdate.id);
    }
    fetchData();
  };

  const handleDeleteItem = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to permanently delete "${name}" from inventory?`)) return;
    await supabase.from("sports_items").delete().eq("id", id);
    fetchData();
  };

  const handleDeleteAnnouncement = async (id: string, title: string) => {
    if (!window.confirm(`Are you sure you want to delete the announcement "${title}"?`)) return;
    await supabase.from("announcements").delete().eq("id", id);
    fetchData();
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8 font-sans text-gray-800">
      <div className="max-w-6xl mx-auto bg-white rounded-xl shadow-sm border border-gray-200 p-8">
        
        {/* HEADER SECTION WITH LOGOUT BUTTON */}
        <div className="border-b border-gray-100 pb-6 mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900">Sports Admin Dashboard</h1>
            <p className="text-sm text-gray-500 mt-1">System Administrator Dashboard</p>
          </div>
          <button onClick={handleLogout} className="bg-gray-100 text-gray-700 px-4 py-2 rounded-md text-sm font-bold hover:bg-red-50 hover:text-red-600 transition">
            Logout
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* 1. ADD NEW ITEM FORM */}
          <div className="bg-blue-50 rounded-xl p-6 border border-blue-100 shadow-sm">
            <h2 className="text-xl font-bold text-blue-900 mb-4">➕ Add Sports Item</h2>
            <form onSubmit={handleAddItem} className="space-y-4">
              <input type="text" required value={itemName} onChange={(e) => setItemName(e.target.value)} className="w-full border border-blue-200 rounded-md p-2.5 text-sm" placeholder="Item Name (e.g. Tennis Racket)" />
              <input type="number" required min="1" value={quantity} onChange={(e) => setQuantity(e.target.value)} className="w-full border border-blue-200 rounded-md p-2.5 text-sm" placeholder="Total Quantity (e.g. 10)" />
              <button type="submit" className="w-full bg-blue-600 text-white px-4 py-3 rounded-md text-sm font-bold hover:bg-blue-700">Save to Inventory</button>
              {itemStatus && <p className="text-sm font-bold mt-2 text-blue-800 text-center">{itemStatus}</p>}
            </form>
          </div>

          {/* 2. POST ANNOUNCEMENT FORM */}
          <div className="bg-emerald-50 rounded-xl p-6 border border-emerald-100 shadow-sm">
            <h2 className="text-xl font-bold text-emerald-900 mb-4">📢 Post Announcement</h2>
            <form onSubmit={handleAddAnnouncement} className="space-y-4">
              <input type="text" required value={annTitle} onChange={(e) => setAnnTitle(e.target.value)} className="w-full border border-emerald-200 rounded-md p-2.5 text-sm" placeholder="Title" />
              <textarea required rows={2} value={annDesc} onChange={(e) => setAnnDesc(e.target.value)} className="w-full border border-emerald-200 rounded-md p-2.5 text-sm resize-none" placeholder="Details..." />
              <select value={annIcon} onChange={(e) => setAnnIcon(e.target.value)} className="w-full border border-emerald-200 rounded-md p-2.5 text-sm bg-white">
                <option value="trophy">🏆 Trophy</option>
                <option value="briefcase">💼 Briefcase</option>
                <option value="calendar">📅 Calendar</option>
              </select>
              <button type="submit" className="w-full bg-emerald-600 text-white px-4 py-3 rounded-md text-sm font-bold hover:bg-emerald-700">Publish</button>
              {annStatus && <p className="text-sm font-bold mt-2 text-emerald-800 text-center">{annStatus}</p>}
            </form>
          </div>
        </div>

        {/* 3. ISSUE EQUIPMENT FORM */}
        <div className="bg-purple-50 rounded-xl p-6 border border-purple-100 shadow-sm mb-8">
          <h2 className="text-xl font-bold text-purple-900 mb-4">📝 Issue Equipment</h2>
          <form onSubmit={handleIssueItem} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <input type="text" required value={studentName} onChange={(e) => setStudentName(e.target.value)} className="w-full border border-purple-200 rounded-md p-2.5 text-sm" placeholder="Student Name" />
            <input type="text" required value={rollNo} onChange={(e) => setRollNo(e.target.value)} className="w-full border border-purple-200 rounded-md p-2.5 text-sm" placeholder="Roll Number" />
            <input type="text" required value={branch} onChange={(e) => setBranch(e.target.value)} className="w-full border border-purple-200 rounded-md p-2.5 text-sm" placeholder="Branch" />
            <input type="text" required value={semester} onChange={(e) => setSemester(e.target.value)} className="w-full border border-purple-200 rounded-md p-2.5 text-sm" placeholder="Semester" />
            <input type="text" required value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full border border-purple-200 rounded-md p-2.5 text-sm lg:col-span-1" placeholder="Phone" />
            
            <select required value={issuedItem} onChange={(e) => setIssuedItem(e.target.value)} className="w-full border border-purple-200 rounded-md p-2.5 text-sm lg:col-span-2 bg-white">
              <option value="" disabled>Select Item to Issue...</option>
              {inventory.map(item => (
                <option key={item.id} value={item.item_name}>
                  {item.item_name} ({item.available_quantity} available)
                </option>
              ))}
            </select>
            
            <input type="number" required min="1" value={issueQuantity} onChange={(e) => setIssueQuantity(e.target.value)} className="w-full border border-purple-200 rounded-md p-2.5 text-sm lg:col-span-1" placeholder="Qty" />
            
            <div className="md:col-span-2 lg:col-span-4 flex items-center gap-4 mt-2">
              <button type="submit" className="flex-1 bg-purple-600 text-white px-4 py-3 rounded-md text-sm font-bold hover:bg-purple-700">Issue Record</button>
              {issueStatus && <p className="flex-1 text-sm font-bold text-purple-800">{issueStatus}</p>}
            </div>
          </form>
        </div>

        {/* 4. ACTIVE ISSUES MANAGEMENT TABLE */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm mb-8">
          <div className="bg-gray-50 border-b border-gray-200 p-4">
            <h2 className="text-lg font-bold text-gray-900">Active Issued Equipment</h2>
          </div>
          <div className="overflow-x-auto p-4 max-h-[300px] overflow-y-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="text-gray-500 border-b border-gray-200">
                  <th className="pb-3 font-semibold">Student</th>
                  <th className="pb-3 font-semibold">Roll No / Branch</th>
                  <th className="pb-3 font-semibold text-purple-600">Item Issued (Qty)</th>
                  <th className="pb-3 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {issuedRecords.length > 0 ? issuedRecords.map((record) => (
                  <tr key={record.id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50">
                    <td className="py-3 font-medium text-gray-900">{record.student_name}</td>
                    <td className="py-3 text-gray-600">{record.roll_no} • {record.branch}</td>
                    <td className="py-3 font-bold text-purple-700">{record.item_issued} (x{record.quantity || 1})</td>
                    <td className="py-3 text-right">
                      <button onClick={() => handleReturnEquipment(record)} className="bg-emerald-50 text-emerald-600 border border-emerald-200 px-3 py-1.5 rounded text-xs font-bold hover:bg-emerald-600 hover:text-white transition">
                        Mark Returned
                      </button>
                    </td>
                  </tr>
                )) : (
                  <tr><td colSpan={4} className="py-6 text-center text-gray-500">No equipment currently issued.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* 5. DATABASE MANAGEMENT (NEW) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* INVENTORY MANAGEMENT */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
            <div className="bg-blue-50 border-b border-blue-100 p-4">
              <h2 className="text-lg font-bold text-blue-900">Manage Inventory</h2>
            </div>
            <div className="overflow-x-auto p-4 max-h-[250px] overflow-y-auto custom-scrollbar">
              <table className="w-full text-left text-sm">
                <tbody>
                  {inventory.map((item) => (
                    <tr key={item.id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50">
                      <td className="py-3 font-bold text-gray-900">{item.item_name}</td>
                      <td className="py-3 text-gray-600 text-sm">Qty: {item.total_quantity}</td>
                      <td className="py-3 text-right">
                        <button onClick={() => handleDeleteItem(item.id, item.item_name)} className="text-red-500 hover:text-red-700 font-bold text-xs">Remove</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* ANNOUNCEMENT MANAGEMENT */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
            <div className="bg-emerald-50 border-b border-emerald-100 p-4">
              <h2 className="text-lg font-bold text-emerald-900">Manage Announcements</h2>
            </div>
            <div className="overflow-x-auto p-4 max-h-[250px] overflow-y-auto custom-scrollbar">
              <table className="w-full text-left text-sm">
                <tbody>
                  {announcements.map((ann) => (
                    <tr key={ann.id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50">
                      <td className="py-3 font-bold text-gray-900">{ann.title}</td>
                      <td className="py-3 text-gray-500 text-xs truncate max-w-[120px]">{new Date(ann.date_posted).toLocaleDateString()}</td>
                      <td className="py-3 text-right">
                        <button onClick={() => handleDeleteAnnouncement(ann.id, ann.title)} className="text-red-500 hover:text-red-700 font-bold text-xs">Remove</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}