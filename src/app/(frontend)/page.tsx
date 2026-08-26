import { supabase } from "@/lib/supabase";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const { data: announcements } = await supabase.from("announcements").select("*").order("date_posted", { ascending: false });
  const { data: sportsItems } = await supabase.from("sports_items").select("*").order("item_name", { ascending: true });
  const { data: issuedItems } = await supabase.from("issued_items").select("*").order("issue_date", { ascending: false });

  return (
    <div className="min-h-screen bg-[#f4f7fb] flex flex-col font-sans text-gray-800">
      
      {/* 1. HEADER */}
      <header className="bg-[#6A00F4] text-white py-4 px-8 flex justify-between items-center shadow-lg">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 border-2 border-[#FFD6A5] rotate-45 flex items-center justify-center">
            <span className="-rotate-45 font-bold text-xs text-[#FFD6A5]">CITK</span>
          </div>
          <div>
            <h1 className="text-3xl font-extrabold tracking-wide">
              CITK <span className="text-[#FFD6A5]">SPORTS</span>
            </h1>
            <p className="text-xs text-[#FFD6A5]/80 font-medium">Commitment • Integrity • Teamwork • Knowledge</p>
          </div>
        </div>
        <div className="flex gap-4">
          <Link href="/login" className="px-5 py-2 rounded-md border border-[#FFD6A5]/50 text-[#FFD6A5] text-sm font-medium hover:bg-[#FFD6A5]/10 transition">
            Admin Login
          </Link>
        </div>
      </header>

      <main className="flex-grow p-6 max-w-[1400px] mx-auto w-full grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* TOP LEFT: Hero Image */}
        <section className="lg:col-span-2 relative bg-[#6A00F4] rounded-xl overflow-hidden min-h-[400px] shadow-sm flex items-center">
          <div className="absolute inset-0 bg-gradient-to-r from-[#6A00F4] via-[#6A00F4]/90 to-transparent z-10"></div>
          <div className="relative z-20 px-12 text-white">
            <h2 className="text-5xl font-black mb-1 drop-shadow-md">PLAY HARD.</h2>
            <h2 className="text-5xl font-black text-[#FFD6A5] mb-1 drop-shadow-md">TRAIN SMART.</h2>
            <h2 className="text-5xl font-black mb-4 drop-shadow-md">WIN TOGETHER.</h2>
            <p className="text-gray-100 mb-8 max-w-sm text-lg">Empowering athletes. Building champions.</p>
            <button className="bg-[#FFD6A5] text-[#6A00F4] px-6 py-3 rounded-md font-extrabold flex items-center gap-2 hover:opacity-90 transition shadow-lg shadow-[#FFD6A5]/20">
              Explore Sports <span>→</span>
            </button>
          </div>
        </section>

        {/* TOP RIGHT: Announcements */}
        <section className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col h-full max-h-[400px] overflow-hidden">
          <h3 className="font-bold flex items-center gap-2 text-sm tracking-wide mb-6">
            <span className="text-[#6A00F4] text-lg">📢</span> ANNOUNCEMENTS
          </h3>
          <div className="space-y-6 overflow-y-auto pr-2 custom-scrollbar">
            {announcements && announcements.length > 0 ? (
              announcements.map((ann) => (
                <div key={ann.id} className="flex gap-4 border-b border-gray-50 pb-4 last:border-0">
                  <div className={`w-12 h-12 shrink-0 rounded-full flex items-center justify-center text-xl ${ann.icon_type === 'briefcase' ? 'bg-orange-50 text-orange-600' : ann.icon_type === 'calendar' ? 'bg-purple-50 text-purple-600' : 'bg-[#6A00F4]/10 text-[#6A00F4]'}`}>
                    {ann.icon_type === 'briefcase' ? '💼' : ann.icon_type === 'calendar' ? '📅' : '🏆'}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-gray-900">{ann.title}</h4>
                    <p className="text-xs text-gray-500 mt-1">{ann.description}</p>
                    <p className="text-xs text-[#6A00F4] mt-2 font-medium">{new Date(ann.date_posted).toLocaleDateString()}</p>
                  </div>
                </div>
              ))
            ) : <p className="text-sm text-gray-500">No new announcements.</p>}
          </div>
        </section>

        {/* BOTTOM SECTION: ISSUED ITEMS */}
        <section className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col h-[300px]">
          <h3 className="font-bold text-sm tracking-wide mb-4 border-b pb-2 text-gray-800">RECENTLY ISSUED EQUIPMENT</h3>
          <div className="overflow-y-auto pr-2 custom-scrollbar">
            {issuedItems && issuedItems.length > 0 ? (
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="text-gray-500 border-b">
                    <th className="pb-2 font-semibold">Student Name</th>
                    <th className="pb-2 font-semibold">Roll No</th>
                    <th className="pb-2 font-semibold">Branch/Sem</th>
                    <th className="pb-2 font-semibold text-[#6A00F4]">Item Issued</th>
                    <th className="pb-2 font-semibold text-[#6A00F4] text-center">Qty</th>
                  </tr>
                </thead>
                <tbody>
                  {issuedItems.map((record) => (
                    <tr key={record.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50">
                      <td className="py-3 font-medium">{record.student_name}</td>
                      <td className="py-3 text-gray-600">{record.roll_no}</td>
                      <td className="py-3 text-gray-600">{record.branch} ({record.semester})</td>
                      <td className="py-3 font-bold text-[#6A00F4]">{record.item_issued}</td>
                      <td className="py-3 font-bold text-[#6A00F4] text-center">{record.quantity || 1}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="text-sm text-gray-500">No equipment currently issued.</p>
            )}
          </div>
        </section>

        {/* Sports Inventory List */}
        <section className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col h-[300px]">
          <h3 className="font-bold text-sm tracking-wide mb-4 border-b pb-2 text-gray-800">SPORTS ITEMS INVENTORY</h3>
          <div className="space-y-4 overflow-y-auto pr-2 custom-scrollbar">
            {sportsItems && sportsItems.length > 0 ? (
              sportsItems.map((item) => (
                <div key={item.id} className="flex items-center justify-between border-b border-gray-50 pb-3 last:border-0">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">📌</span>
                    <div>
                      <h4 className="text-sm font-bold">{item.item_name}</h4>
                      <p className="text-xs text-[#6A00F4] font-bold">Available: {item.available_quantity} / {item.total_quantity}</p>
                    </div>
                  </div>
                </div>
              ))
            ) : <p className="text-sm text-gray-500">Inventory is empty.</p>}
          </div>
        </section>

      </main>

      {/* FOOTER */}
      <footer className="bg-[#6A00F4] text-white py-6 mt-auto">
        <div className="max-w-[1400px] mx-auto px-6 flex justify-between items-center">
          <div>
            <h4 className="font-bold tracking-wide">CITK <span className="text-[#FFD6A5]">SPORTS</span></h4>
            <p className="text-xs text-[#FFD6A5]/80 mt-1">Stronger Together, Champions Forever!</p>
          </div>
          <p className="text-xs text-[#FFD6A5]/60">© 2026 CITK. Platform by Nitesh Kr Singh (NAL-22-CS-003). All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}