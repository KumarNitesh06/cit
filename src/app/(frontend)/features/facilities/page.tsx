import { supabase } from "@/lib/supabase";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function FacilitiesPage() {
  const { data: sportsItems } = await supabase.from("sports_items").select("*").order("item_name", { ascending: true });

  return (
    <div className="min-h-screen bg-white py-20 px-5 md:px-8">
      <div className="max-w-[1200px] mx-auto">
        <Link href="/" className="text-violet-600 font-bold text-sm hover:underline mb-8 inline-block">← Back to Home</Link>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-5">
          <div>
            <p className="text-[10px] uppercase tracking-[.3em] font-black text-violet-600">Sports facilities</p>
            <h1 className="mt-4 text-4xl md:text-6xl font-black tracking-tight">Ready to play?</h1>
          </div>
          <p className="max-w-md text-sm text-slate-500 leading-6">Explore the sports equipment available to students and keep track of what is currently in circulation.</p>
        </div>

        {sportsItems && sportsItems.length > 0 ? (
          <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {sportsItems.map((item) => {
              const available = Number(item.available_quantity || 0);
              const total = Number(item.total_quantity || 0);
              const percentage = total > 0 ? Math.round((available / total) * 100) : 0;

              return (
                <div key={item.id} className="rounded-3xl border border-slate-200 p-6 hover:border-violet-300 hover:shadow-lg hover:shadow-violet-100/60 transition-all">
                  <div className="flex items-start justify-between">
                    <div className="h-12 w-12 rounded-2xl bg-violet-50 flex items-center justify-center text-xl">🏅</div>
                    <span className={`rounded-full px-3 py-1.5 text-[9px] font-black uppercase ${available > 0 ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-500"}`}>
                      {available > 0 ? "Available" : "Unavailable"}
                    </span>
                  </div>
                  <h3 className="mt-7 text-lg font-black">{item.item_name}</h3>
                  <div className="mt-6">
                    <div className="flex justify-between text-[9px] uppercase tracking-widest font-bold text-slate-400">
                      <span>Stock</span>
                      <span>{available} / {total}</span>
                    </div>
                    <div className="mt-2 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full rounded-full bg-violet-600" style={{ width: `${percentage}%` }} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="mt-12 rounded-3xl border border-dashed border-slate-200 p-16 text-center text-slate-400">No equipment information available.</div>
        )}
      </div>
    </div>
  );
}