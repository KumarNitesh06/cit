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
      
      {/* 1. FIXED HEADER */}
      {/* Added strict h-20 / h-24 classes so the header can NEVER stretch out of control */}
      <header className="sticky top-0 z-50 bg-[#6A00F4]/95 backdrop-blur-md text-white h-20 md:h-24 px-4 md:px-8 flex justify-between items-center shadow-lg border-b border-white/10">
        <div className="flex items-center gap-3 md:gap-4">
          
          {/* FIXED LOGO: Wrapped in a white circular badge to force it to look clean */}
          <div className="h-12 w-12 md:h-16 md:w-16 flex-shrink-0 bg-white rounded-full p-1 shadow-md border-2 border-[#FFD6A5] flex items-center justify-center overflow-hidden">
            <img src="/images/logo.png" alt="CITK Logo" className="h-full w-full object-contain" />
          </div>
          
          <div className="flex flex-col justify-center">
            <h1 className="text-xl md:text-3xl font-extrabold tracking-wide drop-shadow-md leading-none mb-1">
              CITK <span className="text-[#FFD6A5]">SPORTS</span>
            </h1>
            <p className="hidden sm:block text-[10px] md:text-xs text-[#FFD6A5]/80 font-medium tracking-widest uppercase">
              
            </p>
          </div>
        </div>
        <div className="flex gap-2 md:gap-4 flex-shrink-0">
          <Link href="/login" className="px-4 py-2 md:px-5 rounded-md border-2 border-[#FFD6A5]/50 text-[#FFD6A5] text-xs md:text-sm font-bold hover:bg-[#FFD6A5] hover:text-[#6A00F4] transition-all duration-300">
            Admin
          </Link>
        </div>
      </header>

      {/* 2. MAIN GRID LAYOUT */}
      <main className="flex-grow p-4 md:p-6 max-w-[1400px] mx-auto w-full grid grid-cols-1 lg:grid-cols-3 gap-6 mt-2 md:mt-4">

        {/* TOP LEFT: Hero Slideshow */}
        {/* FIXED HEIGHT: Changed min-h to strict h-[250px] lg:h-[400px] so it never collapses */}
        <section className="lg:col-span-2 relative bg-gray-900 rounded-xl overflow-hidden h-[250px] lg:h-[400px] shadow-sm">
          <HeroCarousel />
          <div className="absolute inset-0 bg-black/10 z-10 pointer-events-none"></div>
        </section>

        {/* TOP RIGHT: Announcements */}
        <section className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 md:p-6 flex flex-col h-[250px] lg:h-[400px] overflow-hidden">
          <h3 className="font-bold flex items-center gap-2 text-sm tracking-wide mb-6 uppercase">
            <span className="text-[#6A00F4] text-lg">📢</span> Announcements
          </h3>
          <div className="space-y-6 overflow-y-auto pr-2 custom-scrollbar">
            {announcements && announcements.length > 0 ? (
              announcements.map((ann) => (
                <div key={ann.id} className="flex gap-4 border-b border-gray-50 pb-4 last:border-0">
                  <div className={`w-10 h-10 md:w-12 md:h-12 shrink-0 rounded-full flex items-center justify-center text-lg md:text-xl ${ann.icon_type === 'briefcase' ? 'bg-orange-50 text-orange-600' : ann.icon_type === 'calendar' ? 'bg-purple-50 text-purple-600' : 'bg-[#6A00F4]/10 text-[#6A00F4]'}`}>
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
        <section className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 p-5 md:p-6 flex flex-col h-[350px]">
          <h3 className="font-bold text-sm tracking-wide mb-4 border-b pb-2 text-gray-800 uppercase">Recently Issued Equipment</h3>
          <div className="overflow-y-auto overflow-x-auto pr-2 custom-scrollbar flex-grow">
            {issuedItems && issuedItems.length > 0 ? (
              <table className="w-full text-left text-sm min-w-[500px]">
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
                      <td className="py-3 font-medium whitespace-nowrap">{record.student_name}</td>
                      <td className="py-3 text-gray-600 whitespace-nowrap">{record.roll_no}</td>
                      <td className="py-3 text-gray-600 whitespace-nowrap">{record.branch} ({record.semester})</td>
                      <td className="py-3 font-bold text-[#6A00F4] whitespace-nowrap">{record.item_issued}</td>
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
        <section className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 md:p-6 flex flex-col h-[350px]">
          <h3 className="font-bold text-sm tracking-wide mb-4 border-b pb-2 text-gray-800 uppercase">Sports Items Inventory</h3>
          <div className="space-y-4 overflow-y-auto pr-2 custom-scrollbar">
            {sportsItems && sportsItems.length > 0 ? (
              sportsItems.map((item) => (
                <div key={item.id} className="flex items-center justify-between border-b border-gray-50 pb-3 last:border-0">
                  <div className="flex items-center gap-3">
                    <span className="text-xl md:text-2xl">•</span>
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
      <footer className="bg-[#6A00F4] text-white py-6 md:py-8 mt-auto">
        <div className="max-w-[1400px] mx-auto px-6 flex flex-col md:flex-row justify-between items-center text-center md:text-left gap-4">
          <div>
            <h4 className="font-bold tracking-wide text-lg md:text-base">CITK <span className="text-[#FFD6A5]">SPORTS</span></h4>
            <p className="text-xs text-[#FFD6A5]/80 mt-1">Stronger Together, Champions Forever!</p>
          </div>
          <div className="text-xs text-[#FFD6A5]/60 flex flex-col gap-1">
            
          </div>
        </div>
      </footer>
    </div>
  );
}