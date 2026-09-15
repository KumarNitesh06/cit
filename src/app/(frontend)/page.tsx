"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import Image from "next/image";
import HeroCarousel from "./HeroCarousel";

export default function HomePage() {
  const [activeTab, setActiveTab] = useState("home");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [sportsItems, setSportsItems] = useState<any[]>([]);
  const [issuedItems, setIssuedItems] = useState<any[]>([]);

  useEffect(() => {
    async function loadData() {
      const { data: ann } = await supabase.from("announcements").select("*").order("date_posted", { ascending: false });
      const { data: sports } = await supabase.from("sports_items").select("*").order("item_name", { ascending: true });
      const { data: issued } = await supabase.from("issued_items").select("*").order("issue_date", { ascending: false });
      
      if (ann) setAnnouncements(ann);
      if (sports) setSportsItems(sports);
      if (issued) setIssuedItems(issued);
    }
    loadData();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans flex flex-col relative">
      
      {/* 1. TOP UTILITY BAR (Dark Green) */}
      <div className="bg-[#3b6e3e] text-white text-[11px] md:text-xs py-1.5 px-4 md:px-8 flex justify-between items-center font-medium">
        <div className="flex gap-4">
          <span>CITK Sports Portal - 2026   </span>
        </div>
        <div className="flex items-center gap-1">
          <a href="mailto:webmaster@cit.ac.in" className="hover:underline flex items-center gap-1">Email</a>
          <a href="/login" className="hover:underline">| Admin</a>
          
          
        </div>
      </div>

      {/* 2. MAIN LOGO HEADER (White) */}
      <header className="bg-white py-4 px-4 md:px-8 flex justify-between items-center border-b border-slate-200">
        <div className="flex items-center gap-3 md:gap-5">
          <div className="w-16 h-16 md:w-20 md:h-20 shrink-0">
            <Image src="/images/logo.png" alt="CITK Logo" width={80} height={80} className="object-contain w-full h-full" />
          </div>
          <div className="flex flex-col justify-center">
            <h2 className="text-base md:text-xl font-bold text-slate-800 leading-tight">केन्द्रीय प्रौद्योगिकी संस्थान कोकराझार</h2>
            <h1 className="text-lg md:text-2xl font-bold text-slate-900 leading-tight">CENTRAL INSTITUTE OF TECHNOLOGY KOKRAJHAR</h1>
            <p className="text-xs md:text-sm text-slate-600 font-medium">Deemed to be University under MoE, Govt. of India</p>
          </div>
        </div>
        
        {/* Mobile Hamburger */}
        <button onClick={() => setIsMobileMenuOpen(true)} className="lg:hidden p-2 text-[#4b8b4b] hover:bg-slate-50 rounded-lg transition-colors">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path>
          </svg>
        </button>
      </header>

      {/* MOBILE SLIDE-OUT DRAWER OVERLAY */}
      <div 
        onClick={() => setIsMobileMenuOpen(false)} 
        className={`fixed inset-0 z-[60] bg-slate-900/40 backdrop-blur-sm lg:hidden transition-all duration-300 ${isMobileMenuOpen ? "opacity-100 visible" : "opacity-0 invisible"}`} 
      />

      {/* MOBILE SLIDE-OUT DRAWER */}
      <aside 
        className={`fixed right-0 top-0 bottom-0 z-[70] w-[280px] bg-white shadow-2xl lg:hidden transform transition-transform duration-300 ease-in-out flex flex-col ${isMobileMenuOpen ? "translate-x-0" : "translate-x-full"}`}
      >
        <div className="p-5 border-b border-slate-200 flex justify-between items-center bg-[#4b8b4b] text-white">
          <h2 className="font-bold text-lg tracking-wide uppercase">Menu</h2>
          <button onClick={() => setIsMobileMenuOpen(false)} className="p-1 hover:bg-[#3b6e3e] rounded-lg transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>

        <nav className="flex flex-col p-3 space-y-1">
          <button onClick={() => { setActiveTab("home"); setIsMobileMenuOpen(false); }} className={`p-3 text-left rounded-lg text-sm font-bold transition-colors ${activeTab === 'home' ? 'bg-[#4b8b4b]/10 text-[#4b8b4b]' : 'text-slate-600 hover:bg-slate-50'}`}>
            Home
          </button>
          <button onClick={() => { setActiveTab("department"); setIsMobileMenuOpen(false); }} className={`p-3 text-left rounded-lg text-sm font-bold transition-colors ${activeTab === 'department' ? 'bg-[#4b8b4b]/10 text-[#4b8b4b]' : 'text-slate-600 hover:bg-slate-50'}`}>
            Department
          </button>
          <button onClick={() => { setActiveTab("inventory"); setIsMobileMenuOpen(false); }} className={`p-3 text-left rounded-lg text-sm font-bold transition-colors ${activeTab === 'inventory' ? 'bg-[#4b8b4b]/10 text-[#4b8b4b]' : 'text-slate-600 hover:bg-slate-50'}`}>
            Equipment Inventory
          </button>
          <button onClick={() => { setActiveTab("issued"); setIsMobileMenuOpen(false); }} className={`p-3 text-left rounded-lg text-sm font-bold transition-colors ${activeTab === 'issued' ? 'bg-[#4b8b4b]/10 text-[#4b8b4b]' : 'text-slate-600 hover:bg-slate-50'}`}>
            Active Gear
          </button>
          <button onClick={() => { setActiveTab("announcements"); setIsMobileMenuOpen(false); }} className={`p-3 text-left rounded-lg text-sm font-bold transition-colors flex items-center justify-between ${activeTab === 'announcements' ? 'bg-[#4b8b4b]/10 text-[#4b8b4b]' : 'text-slate-600 hover:bg-slate-50'}`}>
            <span>Announcements</span>
            <span className="bg-red-500 text-white text-[9px] px-1.5 py-0.5 rounded shadow-sm"></span>
          </button>
        </nav>
      </aside>

      {/* 3. PRIMARY NAVIGATION BAR (Desktop Only) */}
      <nav className="hidden lg:flex bg-[#4b8b4b] text-white shadow-md sticky top-0 z-40">
        <div className="max-w-[1400px] mx-auto w-full px-4 md:px-8 flex items-center">
          <button onClick={() => setActiveTab("home")} className={`py-3 px-4 hover:bg-[#3b6e3e] transition-colors text-sm font-semibold flex items-center gap-1 ${activeTab === 'home' ? 'bg-[#3b6e3e]' : ''}`}>
            🏠 Home
          </button>
          <button onClick={() => setActiveTab("department")} className={`py-3 px-4 hover:bg-[#3b6e3e] transition-colors text-sm font-semibold flex items-center gap-1 ${activeTab === 'department' ? 'bg-[#3b6e3e]' : ''}`}>
            Department
          </button>
          <button onClick={() => setActiveTab("inventory")} className={`py-3 px-4 hover:bg-[#3b6e3e] transition-colors text-sm font-semibold flex items-center gap-1 ${activeTab === 'inventory' ? 'bg-[#3b6e3e]' : ''}`}>
            Equipment Inventory
          </button>
          <button onClick={() => setActiveTab("issued")} className={`py-3 px-4 hover:bg-[#3b6e3e] transition-colors text-sm font-semibold flex items-center gap-1 ${activeTab === 'issued' ? 'bg-[#3b6e3e]' : ''}`}>
            Active Gear
          </button>
          <button onClick={() => setActiveTab("announcements")} className={`py-3 px-4 hover:bg-[#3b6e3e] transition-colors text-sm font-semibold flex items-center gap-2 ${activeTab === 'announcements' ? 'bg-[#3b6e3e]' : ''}`}>
            Announcements <span className="bg-red-500 text-white text-[9px] px-1.5 py-0.5 rounded shadow-sm">New</span>
          </button>
        </div>
      </nav>

     

      {/* 4. DYNAMIC CONTENT AREA */}
      <main className="flex-grow w-full">
        
        {/* VIEW: HOME */}
        {activeTab === "home" && (
          <div className="animate-in fade-in duration-500">
            {/* Hero Section */}
            <section className="relative w-full h-[300px] md:h-[150px] lg:h-[550px] ">
              <HeroCarousel />
              
            </section>
            
            {/* Split Content Section */}
            <section className="max-w-[1400px] mx-auto px-4 md:px-8 py-12 grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* Left: About (Pushed down on mobile, left on desktop) */}
              <div className="order-2 lg:order-1 lg:col-span-2 bg-white border border-slate-200 p-6 md:p-8 shadow-sm">
                <h3 className="text-2xl font-bold text-[#4b8b4b] border-b-2 border-[#4b8b4b] pb-2 mb-6 uppercase tracking-wide">
                  Welcome to the Sports Department
                </h3>
                <p className="text-slate-700 leading-relaxed mb-4 text-justify">
                  The Sports Department at Central Institute of Technology Kokrajhar (CIT Kokrajhar) is dedicated to promoting fitness, sportsmanship, teamwork, and overall student development. The department provides students with opportunities to participate in a variety of indoor and outdoor sports, encouraging them to stay active while developing discipline, confidence, and leadership skills.
                </p>
                <div className="mt-4">
                  <button onClick={() => setActiveTab('department')} className="text-sm font-bold text-[#4b8b4b] hover:underline">Read Full Details →</button>
                </div>
                
                <div className="grid grid-cols-2 gap-4 mt-8">
                  
                </div>
              </div>

              {/* Right: Quick Notice Board (Pulled up on mobile, right on desktop) */}
              <div className="order-1 lg:order-2 bg-white border border-slate-200 shadow-sm flex flex-col h-[350px] lg:h-auto">
                <h3 className="bg-[#4b8b4b] text-white font-bold p-4 text-lg uppercase tracking-wide shrink-0">
                  Latest Announcements
                </h3>
                <div className="p-4 space-y-4 overflow-y-auto flex-grow">
                  {announcements.slice(0, 5).map((ann) => (
                    <div key={ann.id} className="border-b border-slate-100 pb-3">
                      <p className="text-xs font-bold text-slate-500 mb-1">{new Date(ann.date_posted).toLocaleDateString()}</p>
                      <h4 className="text-sm font-bold text-[#4b8b4b] hover:underline cursor-pointer" onClick={() => setActiveTab('announcements')}>{ann.title}</h4>
                    </div>
                  ))}
                </div>
                <div className="bg-slate-50 p-3 border-t border-slate-200 text-center shrink-0">
                  <button onClick={() => setActiveTab('announcements')} className="text-sm font-bold text-[#4b8b4b] hover:underline">View All Notices →</button>
                </div>
              </div>
            </section>
          </div>
        )}

        {/* VIEW: DEPARTMENT */}
        {activeTab === "department" && (
          <section className="max-w-[1400px] mx-auto px-4 md:px-8 py-12 animate-in fade-in duration-500">
             <div className="bg-white border border-slate-200 p-8 shadow-sm">
                <h3 className="text-2xl font-bold text-[#4b8b4b] border-b-2 border-[#4b8b4b] pb-2 mb-6 uppercase tracking-wide">
                  Sports Department
                </h3>
                <div className="prose max-w-none text-slate-700 text-justify space-y-5">
                  <p>
                    The Sports Department at Central Institute of Technology Kokrajhar (CIT Kokrajhar) is dedicated to promoting fitness, sportsmanship, teamwork, and overall student development. The department provides students with opportunities to participate in a variety of indoor and outdoor sports, encouraging them to stay active while developing discipline, confidence, and leadership skills.
                  </p>
                  <p>
                    Through regular sporting activities, training, tournaments, and institute-level competitions, students are encouraged to discover their potential and represent CIT Kokrajhar at various levels. The department strives to create a vibrant sporting culture where every student can participate, compete, and grow.
                  </p>
                  <p>
                    With a strong focus on fitness, teamwork, discipline, and excellence, the Sports Department continues to make sports an integral part of campus life and student experience at CIT Kokrajhar.
                  </p>
                </div>
             </div>
          </section>
        )}

        {/* VIEW: ANNOUNCEMENTS */}
        {activeTab === "announcements" && (
          <section className="max-w-[1400px] mx-auto px-4 md:px-8 py-12 animate-in fade-in duration-500">
            <div className="bg-white border border-slate-200 shadow-sm">
              <h3 className="bg-[#4b8b4b] text-white font-bold p-4 text-xl uppercase tracking-wide">
                Campus Notices & Announcements
              </h3>
              <div className="p-6 space-y-6">
                {announcements.length > 0 ? (
                  announcements.map((ann) => (
                    <div key={ann.id} className="border border-slate-200 p-5 bg-slate-50 border-l-4 border-l-[#4b8b4b]">
                      <div className="flex justify-between items-center mb-2">
                        <h4 className="text-lg font-bold text-slate-900">{ann.title}</h4>
                        <span className="text-xs font-bold bg-white border border-slate-200 px-2 py-1 text-slate-500">{new Date(ann.date_posted).toLocaleDateString()}</span>
                      </div>
                      <p className="text-sm text-slate-700">{ann.description}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-slate-500 text-center py-8">No active announcements available.</p>
                )}
              </div>
            </div>
          </section>
        )}

        {/* VIEW: ISSUED EQUIPMENT */}
        {activeTab === "issued" && (
          <section className="max-w-[1400px] mx-auto px-4 md:px-8 py-12 animate-in fade-in duration-500">
            <div className="bg-white border border-slate-200 shadow-sm">
              <h3 className="bg-[#4b8b4b] text-white font-bold p-4 text-xl uppercase tracking-wide">
                Currently Issued Equipment
              </h3>
              <div className="p-0 overflow-x-auto">
                <table className="w-full text-left text-sm border-collapse">
                  <thead>
                    <tr className="bg-slate-100 text-slate-700 border-b border-slate-200">
                      <th className="p-4 font-bold border-r border-slate-200">Student Name</th>
                      <th className="p-4 font-bold border-r border-slate-200">Roll No</th>
                      <th className="p-4 font-bold border-r border-slate-200">Branch/Sem</th>
                      <th className="p-4 font-bold text-[#4b8b4b] border-r border-slate-200">Item Issued</th>
                      <th className="p-4 font-bold text-center">Qty</th>
                    </tr>
                  </thead>
                  <tbody>
                    {issuedItems.length > 0 ? (
                      issuedItems.map((record, idx) => (
                        <tr key={record.id} className={`border-b border-slate-100 hover:bg-slate-50 ${idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}`}>
                          <td className="p-4 border-r border-slate-100 font-semibold">{record.student_name}</td>
                          <td className="p-4 border-r border-slate-100 text-slate-600">{record.roll_no}</td>
                          <td className="p-4 border-r border-slate-100 text-slate-600">{record.branch} (S{record.semester})</td>
                          <td className="p-4 border-r border-slate-100 font-bold text-slate-800">{record.item_issued}</td>
                          <td className="p-4 text-center font-bold text-slate-800">{record.quantity || 1}</td>
                        </tr>
                      ))
                    ) : (
                      <tr><td colSpan={5} className="p-8 text-center text-slate-500">No equipment currently issued.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        )}

        {/* VIEW: INVENTORY */}
        {activeTab === "inventory" && (
          <section className="max-w-[1400px] mx-auto px-4 md:px-8 py-12 animate-in fade-in duration-500">
            <div className="bg-white border border-slate-200 shadow-sm">
              <h3 className="bg-[#4b8b4b] text-white font-bold p-4 text-xl uppercase tracking-wide">
                Sports Inventory Catalog
              </h3>
              <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {sportsItems.length > 0 ? (
                  sportsItems.map((item) => {
                    const isAvailable = item.available_quantity > 0;
                    return (
                      <div key={item.id} className="border border-slate-200 p-5 bg-white shadow-sm hover:shadow-md transition-shadow flex flex-col">
                        <h4 className="text-lg font-bold text-slate-900 mb-3 pb-2 border-b border-slate-100">{item.item_name}</h4>
                        <div className="flex justify-between items-center mt-auto">
                          <span className="text-sm font-semibold text-slate-600">Total: {item.total_quantity}</span>
                          <span className={`text-xs font-bold px-3 py-1 rounded border ${isAvailable ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
                            {item.available_quantity} Available
                          </span>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="col-span-full text-center py-8 text-slate-500">No inventory data available.</div>
                )}
              </div>
            </div>
          </section>
        )}
      </main>

      {/* 5. INSTITUTIONAL FOOTER */}
      <footer className="bg-[#2a2a2a] text-white pt-10 pb-6 border-t-[6px] border-[#4b8b4b]">
        <div className="max-w-[1400px] mx-auto px-4 md:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            <div>
              <h4 className="text-lg font-bold mb-4 border-b border-white/20 pb-2">Central Institute of Technology</h4>
              <p className="text-sm text-slate-300 leading-relaxed">
                Kokrajhar - 783370, Assam, India<br/>
                Deemed to be University under MoE, Govt. of India.
              </p>
            </div>
            <div>
              <h4 className="text-lg font-bold mb-4 border-b border-white/20 pb-2">Important Links</h4>
              <ul className="text-sm text-slate-300 space-y-2">
                <li><a href="#" className="hover:text-white hover:underline">CITK Main Website</a></li>
                <li><a href="#" className="hover:text-white hover:underline">AICTE</a></li>
                <li><a href="#" className="hover:text-white hover:underline">MHRD</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-bold mb-4 border-b border-white/20 pb-2">Contact Us</h4>
              <p className="text-sm text-slate-300">
                Email: <a href="mailto:webmaster@cit.ac.in" className="hover:text-white hover:underline">webmaster@cit.ac.in</a>
              </p>
            </div>
          </div>
          
          <div className="text-center border-t border-white/20 pt-6 mt-6">
             <p className="text-xs text-slate-400 mb-2">
                Disclaimer: Neither the website in-charge nor the developer is responsible for any inadvertent error that may have crept in the information being published on the Internet.
             </p>
             <p className="text-xs text-slate-400">
                © {new Date().getFullYear()} CITK Sports Portal | Developed by <span className="text-white font">Nitesh Kr Singh</span> (202402022091)
             </p>
          </div>
        </div>
      </footer>

    </div>
  );
}