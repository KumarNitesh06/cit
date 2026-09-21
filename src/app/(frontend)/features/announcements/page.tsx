"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

export default function AnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchAnnouncements() {
      const { data, error } = await supabase
        .from("announcements")
        .select("*")
        .order("date_posted", { ascending: false }); // Switched back to date_posted
      
      if (error) {
        console.error("Supabase Error:", error.message);
      }
      
      if (data) {
        setAnnouncements(data);
      }
      setIsLoading(false);
    }
    fetchAnnouncements();
  }, []);

  // Helper to render the correct emoji
  const renderIcon = (type: string) => {
    switch (type) {
      case "trophy": return "🏆";
      case "briefcase": return "💼";
      case "calendar": return "📅";
      default: return "📢";
    }
  };

  // Helper to check if the announcement is less than 48 hours old
  const isNew = (dateString: string) => {
    const postDate = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - postDate.getTime()) / (1000 * 60 * 60);
    return diffInHours <= 48;
  };

  return (
    <div className="min-h-screen bg-slate-100 pt-6 pb-24 px-5 md:px-8 font-sans selection:bg-[#ccff00] selection:text-black">
      <div className="max-w-[1000px] mx-auto">
        
        <Link href="/" className="text-[#6A00F4] font-black text-sm uppercase tracking-widest hover:text-slate-900 transition-colors mb-4 inline-block -skew-x-6">
          <span className="skew-x-6">← BACK TO COMMAND CENTER</span>
        </Link>
        
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-5 border-b-4 border-slate-950 pb-4 mb-12">
          <div>
            
            <h1 className="mt-1 text-4xl md:text-4xl font-black tracking-tighter uppercase italic text-slate-950">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#6A00F4] to-purple-400">Notices</span>
            </h1>
          </div>
          <p className="max-w-md text-sm text-slate-500 leading-relaxed font-medium">
            Stay updated with the latest tournaments, selection trials, and important sports alerts from the CITK administration.
          </p>
        </div>

        {isLoading ? (
          <div className="text-center py-20 font-black text-slate-400 uppercase tracking-widest animate-pulse">Loading Updates...</div>
        ) : announcements.length === 0 ? (
          <div className="mt-8 border-2 border-dashed border-slate-300 p-16 text-center text-slate-400 font-black uppercase tracking-widest rounded-2xl">
            No active announcements at the moment.
          </div>
        ) : (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
            {announcements.map((ann) => {
              // We use created_at if available for exact timing, otherwise fallback to date_posted
              const timestamp = ann.created_at || ann.date_posted;
              const showNewBadge = isNew(timestamp);

              return (
                <div 
                  key={ann.id} 
                  className="group relative bg-white border-2 border-slate-200 p-6 md:p-8 rounded-2xl shadow-[4px_4px_0_0_rgba(15,23,42,1)] hover:shadow-[6px_6px_0_0_rgba(106,0,244,1)] hover:-translate-y-1 transition-all flex flex-col md:flex-row gap-6"
                >
                  {/* Icon Box */}
                  <div className="shrink-0 w-16 h-16 bg-slate-50 border-2 border-slate-100 rounded-xl flex items-center justify-center text-3xl group-hover:bg-[#ccff00] group-hover:border-[#ccff00] transition-colors relative">
                    {renderIcon(ann.icon_type)}
                    
                    {/* Optional: Add a little ping indicator on the icon if it's new */}
                    {showNewBadge && (
                      <span className="absolute -top-1 -right-1 flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                      </span>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mb-2">
                      <div className="flex items-center gap-3">
                        <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight leading-tight">
                          {ann.title}
                        </h2>
                        
                        {/* THE "NEW" BADGE */}
                        {showNewBadge && (
                          <span className="bg-red-500 text-white px-2 py-0.5 text-[10px] font-black uppercase tracking-widest -skew-x-6 animate-pulse shrink-0">
                            <span className="skew-x-6 block">🔥 NEW</span>
                          </span>
                        )}
                      </div>
                      
                      <span className="inline-block bg-slate-950 text-[#ccff00] px-3 py-1 text-[10px] font-black uppercase tracking-widest -skew-x-6 w-max sm:ml-auto">
                        <span className="skew-x-6 block">
                          {new Date(timestamp).toLocaleDateString(undefined, {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </span>
                      </span>
                    </div>
                    
                    <p className="text-slate-600 font-medium leading-relaxed mt-4">
                      {ann.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}