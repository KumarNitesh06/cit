import { supabase } from "@/lib/supabase";
import Link from "next/link";
import HeroCarousel from "./HeroCarousel";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const { data: announcements } = await supabase.from("announcements").select("*").order("date_posted", { ascending: false });
  const { data: sportsItems } = await supabase.from("sports_items").select("*").order("item_name", { ascending: true });
  const { data: issuedItems } = await supabase.from("issued_items").select("*").order("issue_date", { ascending: false });

  return (
    <div className="min-h-screen bg-[#f4f7fb] flex flex-col font-sans text-gray-800">
      
      {/* HEADER WITH CUSTOM LOGO */}
      <header className="sticky top-0 z-50 bg-[#6A00F4]/90 backdrop-blur-md text-white py-4 px-8 flex justify-between items-center shadow-lg border-b border-white/10">
        <div className="flex items-center gap-4">
          
          {/* YOUR LOGO IMAGE */}
          <img src="/images/logo.png" alt="CITK Logo" className="w-13 h-13 object-contain" />
          
          <div>
            <h1 className="text-3xl font-extrabold tracking-wide drop-shadow-md">
              CITK <span className="text-[#FFD6A5]">SPORTS</span>
            </h1>
            <p className="text-xs text-[#FFD6A5]/80 font-medium tracking-widest uppercase"></p>
          </div>
        </div>
        <div className="flex gap-4">
          <Link href="/login" className="px-5 py-2 rounded-md border-2 border-[#FFD6A5]/50 text-[#FFD6A5] text-sm font-bold hover:bg-[#FFD6A5] hover:text-[#6A00F4] transition-all duration-300">
            Admin Portal
          </Link>
        </div>
      </header>

      {/* MAIN GRID LAYOUT */}
      <main className="flex-grow p-6 max-w-[1400px] mx-auto w-full grid grid-cols-1 lg:grid-cols-3 gap-6 mt-4">

        {/* TOP LEFT: Hero Section (Pure Visual Slideshow) */}
        <section className="lg:col-span-2 relative bg-gray-900 rounded-xl overflow-hidden min-h-[400px] shadow-sm flex items-center">
          
          {/* Our custom slideshow component */}
          <HeroCarousel />
          
          {/* A very light shadow overlay just to make the edges look smooth */}
          <div className="absolute inset-0 bg-black/10 z-10 pointer-events-none"></div>
          
        </section>

        {/* TOP RIGHT: Announcements */}
        <section className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col h-full max-h-[400px] overflow-hidden">
          <h3 className="font-bold flex items-center gap-2 text-sm tracking-wide mb-6 uppercase">
            <span className="text-[#6A00F4] text-lg">📢</span> Announcements
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
          <h3 className="font-bold text-sm tracking-wide mb-4 border-b pb-2 text-gray-800 uppercase">Recently Issued Equipment</h3>
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

        {/* BOTTOM RIGHT: Sports Inventory List */}
        <section className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col h-[300px]">
          <h3 className="font-bold text-sm tracking-wide mb-4 border-b pb-2 text-gray-800 uppercase">Sports Items Inventory</h3>
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
          <p className="text-xs text-[#FFD6A5]/60"></p>
        </div>
      </footer>
    </div>
  );
}