import { supabase } from "@/lib/supabase";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function AnnouncementsPage() {
  const { data: announcements } = await supabase.from("announcements").select("*").order("date_posted", { ascending: false });

  return (
    <div className="min-h-screen bg-white py-20 px-5 md:px-8">
      <div className="max-w-[1200px] mx-auto">
        <Link href="/" className="text-violet-600 font-bold text-sm hover:underline mb-8 inline-block">← Back to Home</Link>
        <div className="grid lg:grid-cols-[.75fr_1.25fr] gap-12 lg:gap-20">
          <div>
            <p className="text-[10px] uppercase tracking-[.3em] font-black text-violet-600">Announcements</p>
            <h1 className="mt-4 text-4xl md:text-6xl font-black tracking-tight leading-[.9]">What&apos;s<br />happening.</h1>
            <p className="mt-6 max-w-sm text-sm text-slate-500 leading-6">Stay updated with the latest news, activities and announcements from the CITK Sports Department.</p>
          </div>

          <div className="space-y-3">
            {announcements && announcements.length > 0 ? (
              announcements.map((ann, index) => (
                <article key={ann.id} className="group border-b border-slate-200 py-5 first:border-t">
                  <div className="grid grid-cols-[42px_1fr_auto] gap-4 items-start">
                    <span className="text-xs font-black text-violet-500 pt-1">{String(index + 1).padStart(2, "0")}</span>
                    <div>
                      <h3 className="text-base md:text-lg font-bold text-slate-800 group-hover:text-violet-600 transition">{ann.title}</h3>
                      <p className="mt-2 text-xs md:text-sm text-slate-500 leading-6">{ann.description}</p>
                    </div>
                    <span className="text-[9px] uppercase tracking-wider text-slate-400 pt-1">{new Date(ann.date_posted).toLocaleDateString()}</span>
                  </div>
                </article>
              ))
            ) : (
              <div className="border border-dashed border-slate-200 rounded-2xl p-12 text-center text-slate-400">No announcements available.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}