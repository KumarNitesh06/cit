"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import HeroCarousel from "./HeroCarousel";

export default function HomePage() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [sportsItems, setSportsItems] = useState<any[]>([]);

  const closeMenu = () => setIsMobileMenuOpen(false);

  useEffect(() => {
    async function loadData() {
      const { data: ann } = await supabase.from("announcements").select("*").order("date_posted", { ascending: false });
      const { data: sports } = await supabase.from("sports_items").select("*").order("item_name", { ascending: true });
      
      if (ann) setAnnouncements(ann);
      if (sports) setSportsItems(sports);
    }
    loadData();
  }, []);

  // Helper to check if the announcement is less than 48 hours old
  const isNew = (dateString: string) => {
    if (!dateString) return false;
    const postDate = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - postDate.getTime()) / (1000 * 60 * 60);
    return diffInHours <= 48;
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 overflow-x-hidden flex flex-col font-sans selection:bg-[#ccff00] selection:text-black">
      
      {/* =========================
          SPORTY HEADER
      ========================== */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-slate-950 border-b-4 border-[#6A00F4]">
        <div className="mx-auto max-w-[1440px] px-5 md:px-8">
          <div className="h-[70px] flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="h-10 w-10 bg-white flex items-center justify-center -skew-x-6 overflow-hidden">
                <div className="skew-x-6">
                  <Image src="/images/logo.png" alt="CITK" width={36} height={36} className="object-contain" />
                </div>
              </div>
              <div className="text-left leading-none uppercase tracking-tighter">
                <div className="font-black text-xl text-white group-hover:text-[#ccff00] transition-colors">
                  CITK <span className="text-[#6A00F4] italic">SPORTS</span>
                </div>
              </div>
            </Link>

            {/* Desktop navigation */}
            <nav className="hidden lg:flex items-center gap-6">
              <Link href="/" className="text-sm font-black uppercase tracking-wider text-[#ccff00] italic">Home</Link>
              <Link href="/features/announcements" className="text-sm font-bold uppercase tracking-wider text-slate-300 hover:text-white transition">Notices</Link>
              <Link href="/features/department" className="text-sm font-bold uppercase tracking-wider text-slate-300 hover:text-white transition">Gallery</Link>
              <Link href="/features/facilities" className="text-sm font-bold uppercase tracking-wider text-slate-300 hover:text-white transition">Inventory</Link>
              <Link href="/features/request" className="text-sm font-bold uppercase tracking-wider text-[#ccff00] hover:text-white transition">Request Gear</Link>
            </nav>

            <div className="flex items-center gap-4">
              
              <button 
                onClick={() => setIsMobileMenuOpen(true)} 
                className="h-10 w-10 bg-white/10 text-white flex flex-col items-center justify-center gap-1.5 hover:bg-[#6A00F4] transition-colors lg:hidden -skew-x-6"
              >
                <span className="block h-[3px] w-5 bg-white skew-x-6" />
                <span className="block h-[3px] w-5 bg-white skew-x-6" />
                <span className="block h-[3px] w-5 bg-white skew-x-6" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* =========================
          MOBILE SLIDE-OUT DRAWER
      ========================== */}
      <div 
        onClick={closeMenu} 
        className={`fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm transition-all duration-300 ${isMobileMenuOpen ? "opacity-100 visible" : "opacity-0 invisible"}`} 
      />
      
      <aside className={`fixed right-0 top-0 bottom-0 z-[70] w-[300px] bg-slate-950 border-l-8 border-[#6A00F4] shadow-2xl transform transition-transform duration-300 ease-in-out flex flex-col ${isMobileMenuOpen ? "translate-x-0" : "translate-x-full"}`}>
        <div className="p-6 flex items-center justify-between border-b border-white/10 bg-slate-900">
          <h2 className="text-xl font-black text-white italic tracking-tighter uppercase">Menu</h2>
          <button onClick={closeMenu} className="text-slate-400 hover:text-[#ccff00] text-3xl font-black transition-colors">&times;</button>
        </div>

        <nav className="flex flex-col p-6 space-y-4 flex-grow">
          {[
            ["/", "HOME"],
            ["/features/announcements", "NOTICES"],
            ["/features/department", "GALLERY"],
            ["/features/facilities", "INVENTORY"],
            ["/features/request", "REQUEST GEAR"],
          ].map(([href, label]) => (
            <Link key={href} href={href} onClick={closeMenu} className="group w-full text-left">
              <div className="text-2xl font-black text-slate-500 uppercase tracking-tighter italic group-hover:text-white group-hover:translate-x-2 transition-all">
                {label}
              </div>
            </Link>
          ))}
          
          
        </nav>
      </aside>

      {/* =========================
          MAIN CONTENT
      ========================== */}
      <main className="flex-grow pt-[70px]">
        
       {/* HERO SECTION */}
        <section className="relative min-h-[400px] md:min-h-[70vh] flex items-center overflow-hidden border-b-8 border-slate-950">
          <div className="absolute inset-0"><HeroCarousel /></div>
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/80 to-transparent" />
          <div className="absolute top-0 right-0 bottom-0 w-1/3 bg-[#6A00F4]/20 -skew-x-12 translate-x-20 pointer-events-none mix-blend-overlay" />

          <div className="relative z-10 w-full max-w-[1440px] mx-auto px-6 md:px-12 py-20">
            <div className="max-w-3xl flex flex-col items-start">
              
              <div className="inline-block bg-[#ccff00] text-black pl-6 pr-4 py-1.5 -skew-x-6 mb-8 ml-1">
                <span className="block skew-x-6 text-[9px] md:text-xs uppercase tracking-[0.2em] font-black">
                  Central Institute of Technology Kokrajhar
                </span>
              </div>

              <h1 className="text-4xl sm:text-7xl md:text-8xl lg:text-[100px] font-black leading-[0.85] tracking-tighter text-white uppercase italic">
                PLAY <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#6A00F4] to-purple-400">TO WIN.</span>
              </h1>

              <p className="mt-8 max-w-xl text-sm md:text-base leading-relaxed text-slate-300 font-medium border-l-4 border-[#ccff00] pl-5 ml-1">
               Forging campus unity through strategy, and sportsmanship. Access the sports arsenal, hit the ground running, and leave your legacy.
              </p>
              
            </div>
          </div>
        </section>

        {/* =========================
            SPLIT CONTENT SECTION 
        ========================== */}
        <section className="max-w-[1400px] mx-auto px-4 md:px-8 py-16 grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          <div className="order-2 lg:order-1 lg:col-span-2 bg-white border-2 border-slate-200 p-6 md:p-10 shadow-[4px_4px_0_0_rgba(15,23,42,1)] flex flex-col">
            <h3 className="text-3xl font-black text-slate-950 uppercase italic tracking-tight mb-8 flex items-center gap-3">
              <span className="w-6 h-2 bg-[#6A00F4] skew-x-[-20deg]"></span> The Department
            </h3>
            
            <div className="space-y-5 text-slate-600 font-medium leading-relaxed text-justify mb-10">
              <p>The Sports Department at Central Institute of Technology Kokrajhar (CIT Kokrajhar) is dedicated to promoting fitness, sportsmanship, teamwork, and overall student development. The department provides students with opportunities to participate in a variety of indoor and outdoor sports, encouraging them to stay active while developing discipline, confidence, and leadership skills.</p>
              <p>Through regular sporting activities, training, tournaments, and institute-level competitions, students are encouraged to discover their potential and represent CIT Kokrajhar at various levels. The department strives to create a vibrant sporting culture where every student can participate, compete, and grow.</p>
              <p>With a strong focus on fitness, teamwork, discipline, and excellence, the Sports Department continues to make sports an integral part of campus life and student experience at CIT Kokrajhar.</p>
            </div>

            
          </div>

          <div className="order-1 lg:order-2 bg-white border-2 border-slate-200 shadow-[4px_4px_0_0_rgba(15,23,42,1)] flex flex-col h-[450px] lg:h-auto">
            <h3 className="bg-slate-950 text-white font-black p-5 text-xl uppercase italic tracking-wide shrink-0 border-b-4 border-[#ccff00] flex items-center justify-between">
              Notices <span className="text-xl"></span>
            </h3>
            
            <div className="p-4 space-y-4 overflow-y-auto flex-grow bg-slate-50">
              {announcements.slice(0, 5).map((ann) => {
                const timestamp = ann.created_at || ann.date_posted;
                const showNewBadge = isNew(timestamp);

                return (
                  <div key={ann.id} className="border-b-2 border-slate-200 pb-4 group">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="inline-block bg-slate-200 text-slate-600 px-2 py-0.5 -skew-x-6">
                        <p className="skew-x-6 text-[9px] font-black uppercase tracking-widest">
                          {new Date(ann.date_posted).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                        </p>
                      </div>
                      
                      {/* NEW BADGE */}
                      {showNewBadge && (
                        <span className="bg-red-500 text-white px-2 py-0.5 text-[9px] font-black uppercase tracking-widest -skew-x-6 animate-pulse">
                          <span className="skew-x-6 block">🔥 NEW</span>
                        </span>
                      )}
                    </div>

                    <h4 className="text-base font-black text-slate-900 group-hover:text-[#6A00F4] transition-colors cursor-pointer leading-snug">
                      {ann.title}
                    </h4>
                  </div>
                );
              })}
              {announcements.length === 0 && (
                <p className="text-slate-400 font-bold text-center mt-10">No active updates.</p>
              )}
            </div>

            <div className="bg-white p-4 border-t-2 border-slate-200 text-center shrink-0">
              <Link href="/features/announcements" className="text-sm font-black text-[#6A00F4] hover:text-slate-950 uppercase tracking-widest transition-colors">
                View Full Feed →
              </Link>
            </div>
          </div>

        </section>
      </main>

      {/* =========================
          HEAVYWEIGHT FOOTER
      ========================== */}
      <footer className="bg-slate-950 text-white border-t-8 border-[#6A00F4]">
        <div className="max-w-[1200px] mx-auto px-5 md:px-8 py-16">
          <div className="grid lg:grid-cols-[1fr_2fr] gap-12 lg:gap-16">
            
            <div>
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 bg-white flex items-center justify-center -skew-x-6 p-2">
                  <div className="skew-x-6">
                    <Image src="/images/logo.png" alt="CITK" width={48} height={48} className="object-contain" />
                  </div>
                </div>
                <div>
                  <h3 className="text-2xl font-black tracking-tighter uppercase italic">CITK <span className="text-[#6A00F4]">SPORTS</span></h3>
                  <p className="text-[10px] uppercase tracking-[.2em] text-[#ccff00] font-black">Official Portal</p>
                </div>
              </div>
              <p className="text-sm text-slate-400 leading-relaxed mb-6 font-medium">
                Central Institute of Technology<br />
                Kokrajhar - 783370, Assam, India
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
              <div>
                <h4 className="text-xs font-black uppercase tracking-widest text-[#6A00F4] mb-4">Platform</h4>
                <ul className="space-y-3 font-medium">
                  <li><Link href="/" className="text-sm text-slate-400 hover:text-white transition">Home</Link></li>
                  <li><Link href="/features/announcements" className="text-sm text-slate-400 hover:text-white transition">Live Feed</Link></li>
                  <li><Link href="/features/facilities" className="text-sm text-slate-400 hover:text-white transition">Inventory</Link></li>
                  
                </ul>
              </div>
              <div>
                <h4 className="text-xs font-black uppercase tracking-widest text-[#6A00F4] mb-4">Institute</h4>
                <ul className="space-y-3 font-medium">
                  
                  <li><Link href="https://cit.ac.in/" className="text-sm text-slate-400 hover:text-white transition">Main Website</Link></li>
                </ul>
              </div>
              <div className="col-span-2 md:col-span-1">
                <h4 className="text-xs font-black uppercase tracking-widest text-[#6A00F4] mb-4">Contact</h4>
                <a href="mailto:webmaster@cit.ac.in" className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white transition bg-white/5 px-4 py-3 border border-white/10 -skew-x-6">
                  <span className="skew-x-6">✉ citk2006@gmail.com</span>
                </a>
              </div>
            </div>
          </div>

          <div className="mt-16 pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-xs text-slate-500 font-medium">
              © {new Date().getFullYear()} Central Institute of Technology Kokrajhar. All rights reserved.
            </p>
           
          </div>
        </div>
      </footer>
    </div>
  );
}