 "use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import HeroCarousel from "./HeroCarousel";

export default function HomePage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [sportsItems, setSportsItems] = useState<any[]>([]);

  useEffect(() => {
    const loadData = async () => {
      const [{ data: ann }, { data: sports }] = await Promise.all([
        supabase
          .from("announcements")
          .select("*")
          .order("date_posted", { ascending: false }),
        supabase
          .from("sports_items")
          .select("*")
          .order("item_name", { ascending: true }),
      ]);

      if (ann) setAnnouncements(ann);
      if (sports) setSportsItems(sports);
    };

    loadData();
  }, []);

  const closeMenu = () => setIsMenuOpen(false);

  const scrollTo = (id: string) => {
    closeMenu();
    document.getElementById(id)?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  const availableCount = sportsItems.reduce(
    (sum, item) => sum + Number(item.available_quantity || 0),
    0
  );

  const totalCount = sportsItems.reduce(
    (sum, item) => sum + Number(item.total_quantity || 0),
    0
  );

  return (
    <div className="min-h-screen bg-[#f7f8fc] text-slate-900 overflow-x-hidden">

      {/* =========================
          NAVIGATION
      ========================== */}
      <header className="fixed top-0 left-0 right-0 z-50">
        <div className="mx-auto max-w-[1440px] px-5 md:px-8 pt-4">
          <div className="h-[70px] rounded-2xl border border-white/60 bg-white/85 backdrop-blur-xl shadow-[0_12px_40px_rgba(15,23,42,.08)] flex items-center justify-between px-4 md:px-6">

            <button
              onClick={() => scrollTo("home")}
              className="flex items-center gap-3"
            >
              <div className="h-11 w-11 rounded-xl bg-white border border-slate-100 overflow-hidden flex items-center justify-center">
                <Image
                  src="/images/logo.png"
                  alt="CITK"
                  width={44}
                  height={44}
                  className="object-contain"
                />
              </div>

              <div className="text-left leading-none">
                <div className="font-black text-lg tracking-tight">
                  CITK <span className="text-violet-600">SPORTS</span>
                </div>
                <div className="mt-1 text-[8px] tracking-[.25em] uppercase text-slate-400 font-bold">
                  Sports Department
                </div>
              </div>
            </button>

            {/* Desktop navigation */}
            <nav className="hidden md:flex items-center gap-1">
              <button
                onClick={() => scrollTo("home")}
                className="px-4 py-2 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-100 hover:text-violet-600 transition"
              >
                Home
              </button>
              <button
                onClick={() => scrollTo("announcements")}
                className="px-4 py-2 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-100 hover:text-violet-600 transition"
              >
                Announcements
              </button>
              <button
                onClick={() => scrollTo("department")}
                className="px-4 py-2 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-100 hover:text-violet-600 transition"
              >
                Sports Department
              </button>
              <button
                onClick={() => scrollTo("facilities")}
                className="px-4 py-2 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-100 hover:text-violet-600 transition"
              >
                Facilities
              </button>
            </nav>

            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className="hidden sm:flex rounded-xl bg-slate-950 text-white px-4 py-2.5 text-xs font-bold hover:bg-violet-600 transition"
              >
                Admin Portal
              </Link>

              <button
                onClick={() => setIsMenuOpen(true)}
                className="h-11 w-11 rounded-xl bg-slate-950 text-white flex flex-col items-center justify-center gap-1.5 hover:bg-violet-600 transition"
                aria-label="Open navigation menu"
              >
                <span className="block h-0.5 w-5 bg-white rounded-full" />
                <span className="block h-0.5 w-3.5 bg-white rounded-full" />
                <span className="block h-0.5 w-5 bg-white rounded-full" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* =========================
          HAMBURGER DRAWER
      ========================== */}
      <div
        onClick={closeMenu}
        className={`fixed inset-0 z-[60] bg-slate-950/40 backdrop-blur-sm transition ${
          isMenuOpen ? "opacity-100 visible" : "opacity-0 invisible"
        }`}
      />

      <aside
        className={`fixed right-0 top-0 bottom-0 z-[70] w-[360px] max-w-[90vw] bg-white shadow-2xl transition-transform duration-500 ${
          isMenuOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="h-full flex flex-col">
          <div className="p-6 flex items-center justify-between border-b border-slate-100">
            <div>
              <p className="text-[9px] uppercase tracking-[.3em] font-black text-violet-600">
                CITK Sports
              </p>
              <h2 className="mt-1 text-xl font-black">Navigation</h2>
            </div>

            <button
              onClick={closeMenu}
              className="h-10 w-10 rounded-xl bg-slate-100 text-slate-600 text-xl hover:bg-slate-200"
            >
              ×
            </button>
          </div>

          <nav className="p-5 space-y-2">
            {[
              ["home", "01", "Home"],
              ["announcements", "02", "Announcements"],
              ["department", "03", "Sports Department"],
              ["facilities", "04", "Facilities"],
            ].map(([id, no, label]) => (
              <button
                key={id}
                onClick={() => scrollTo(id)}
                className="w-full flex items-center gap-4 p-4 rounded-2xl text-left hover:bg-violet-50 group transition"
              >
                <span className="text-[10px] font-black text-slate-300 group-hover:text-violet-500">
                  {no}
                </span>
                <span className="font-bold text-slate-700 group-hover:text-violet-700">
                  {label}
                </span>
                <span className="ml-auto text-slate-300 group-hover:text-violet-500">
                  →
                </span>
              </button>
            ))}
          </nav>

          <div className="mt-auto p-5">
            <div className="rounded-3xl bg-slate-950 text-white p-6 overflow-hidden relative">
              <div className="absolute -right-12 -top-12 h-36 w-36 rounded-full bg-violet-600/40 blur-3xl" />
              <p className="relative text-[9px] uppercase tracking-[.25em] text-white/40 font-black">
                Student access
              </p>
              <p className="relative mt-2 text-lg font-black">
                Check sports equipment availability.
              </p>
              <button
                onClick={() => scrollTo("facilities")}
                className="relative mt-5 w-full rounded-xl bg-white text-slate-950 py-3 text-xs font-black hover:bg-violet-100 transition"
              >
                Explore Facilities
              </button>
            </div>

            <Link
              href="/login"
              className="mt-3 flex justify-center rounded-xl border border-slate-200 py-3 text-xs font-bold text-slate-600 hover:bg-slate-50"
            >
              Open Admin Portal
            </Link>
          </div>
        </div>
      </aside>

      {/* =========================
          HERO
      ========================== */}
      <main>
        <section
          id="home"
          className="relative min-h-[720px] md:min-h-[820px] flex items-center overflow-hidden scroll-mt-28"
        >
          <div className="absolute inset-0">
            <HeroCarousel />
          </div>

          {/* clean cinematic overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#07091a] via-[#07091a]/80 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#07091a] via-transparent to-white/5" />

          <div className="relative z-10 w-full max-w-[1440px] mx-auto px-5 md:px-8 pt-24">
            <div className="max-w-2xl">

              <div className="inline-flex items-center gap-2 rounded-full bg-white/10 border border-white/20 backdrop-blur-md px-4 py-2">
                <span className="h-2 w-2 rounded-full bg-emerald-400" />
                <span className="text-[9px] md:text-[10px] uppercase tracking-[.24em] font-bold text-white/75">
                  Central Institute of Technology, Kokrajhar
                </span>
              </div>

              <h1 className="mt-7 text-6xl sm:text-7xl md:text-8xl lg:text-[112px] font-black leading-[.82] tracking-[-.065em] text-white">
                SPORTS
                <br />
                <span className="text-violet-300 italic">AT CITK.</span>
              </h1>

              <p className="mt-8 max-w-xl text-sm md:text-base leading-7 text-white/65">
                Building a stronger campus through competition, teamwork,
                discipline and the spirit of sport.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <button
                  onClick={() => scrollTo("department")}
                  className="rounded-xl bg-white px-6 py-3.5 text-xs font-black text-slate-950 hover:bg-violet-100 transition"
                >
                  Discover Sports Department →
                </button>

                <button
                  onClick={() => scrollTo("announcements")}
                  className="rounded-xl border border-white/20 bg-white/10 backdrop-blur-md px-6 py-3.5 text-xs font-black text-white hover:bg-white/15 transition"
                >
                  Latest Announcements
                </button>
              </div>
            </div>
          </div>

          <div className="absolute bottom-8 left-5 md:left-8 right-5 md:right-8 z-10 flex items-end justify-between text-white/40">
            <div className="text-[9px] uppercase tracking-[.3em] font-bold">
              CITK • Sports & Games
            </div>
            <div className="hidden sm:flex items-center gap-3 text-[9px] uppercase tracking-[.25em]">
              Scroll to explore
              <span className="h-px w-12 bg-white/30" />
            </div>
          </div>
        </section>

        {/* =========================
            ANNOUNCEMENTS
        ========================== */}
        <section
          id="announcements"
          className="scroll-mt-28 bg-white py-20 md:py-28"
        >
          <div className="max-w-[1200px] mx-auto px-5 md:px-8">
            <div className="grid lg:grid-cols-[.75fr_1.25fr] gap-12 lg:gap-20">

              <div>
                <p className="text-[10px] uppercase tracking-[.3em] font-black text-violet-600">
                  Announcements
                </p>
                <h2 className="mt-4 text-4xl md:text-6xl font-black tracking-tight leading-[.9]">
                  What&apos;s
                  <br />
                  happening.
                </h2>
                <p className="mt-6 max-w-sm text-sm text-slate-500 leading-6">
                  Stay updated with the latest news, activities and
                  announcements from the CITK Sports Department.
                </p>

                <div className="mt-8 inline-flex items-center gap-3 rounded-full bg-slate-100 px-4 py-2.5">
                  <span className="text-lg">📣</span>
                  <span className="text-xs font-bold text-slate-600">
                    {announcements.length} current updates
                  </span>
                </div>
              </div>

              <div className="space-y-3">
                {announcements.length > 0 ? (
                  announcements.slice(0, 5).map((ann, index) => (
                    <article
                      key={ann.id}
                      className="group border-b border-slate-200 py-5 first:border-t"
                    >
                      <div className="grid grid-cols-[42px_1fr_auto] gap-4 items-start">
                        <span className="text-xs font-black text-violet-500 pt-1">
                          {String(index + 1).padStart(2, "0")}
                        </span>

                        <div>
                          <h3 className="text-base md:text-lg font-bold text-slate-800 group-hover:text-violet-600 transition">
                            {ann.title}
                          </h3>
                          <p className="mt-2 text-xs md:text-sm text-slate-500 leading-6 line-clamp-2">
                            {ann.description}
                          </p>
                        </div>

                        <span className="text-[9px] uppercase tracking-wider text-slate-400 pt-1">
                          {new Date(ann.date_posted).toLocaleDateString()}
                        </span>
                      </div>
                    </article>
                  ))
                ) : (
                  <div className="border border-dashed border-slate-200 rounded-2xl p-12 text-center text-slate-400">
                    No announcements available.
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* =========================
            SPORTS DEPARTMENT
        ========================== */}
        <section
          id="department"
          className="scroll-mt-28 bg-[#f1f2f7] py-20 md:py-28"
        >
          <div className="max-w-[1200px] mx-auto px-5 md:px-8">

            <div className="max-w-2xl">
              <p className="text-[10px] uppercase tracking-[.3em] font-black text-violet-600">
                About the department
              </p>

              <h2 className="mt-4 text-4xl md:text-6xl font-black tracking-tight leading-[.92]">
                More than
                <br />
                <span className="text-violet-600">just a game.</span>
              </h2>

              <p className="mt-7 text-sm md:text-base text-slate-500 leading-7">
                The Sports Department at Central Institute of Technology,
                Kokrajhar encourages students to participate in sports and
                games as an important part of campus life. It promotes
                fitness, teamwork, discipline, confidence and healthy
                competition alongside academic development.
              </p>
            </div>

            <div className="mt-14 grid md:grid-cols-3 gap-4">
              {[
                {
                  no: "01",
                  title: "Participation",
                  text: "Encouraging students to take part in different sports and recreational activities.",
                },
                {
                  no: "02",
                  title: "Team Spirit",
                  text: "Creating opportunities to build communication, leadership and teamwork.",
                },
                {
                  no: "03",
                  title: "Excellence",
                  text: "Supporting students who want to compete, improve and represent CITK.",
                },
              ].map((item) => (
                <div
                  key={item.no}
                  className="rounded-3xl bg-white p-7 md:p-8 border border-slate-200 hover:-translate-y-1 hover:shadow-xl hover:shadow-slate-200/60 transition-all"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black text-violet-600 tracking-[.2em]">
                      {item.no}
                    </span>
                    <span className="text-slate-300">↗</span>
                  </div>

                  <h3 className="mt-12 text-xl font-black">{item.title}</h3>
                  <p className="mt-3 text-sm text-slate-500 leading-6">
                    {item.text}
                  </p>
                </div>
              ))}
            </div>

            {/* Department numbers */}
            <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="rounded-3xl bg-slate-950 text-white p-6">
                <p className="text-3xl font-black">{sportsItems.length}</p>
                <p className="mt-2 text-[9px] uppercase tracking-[.2em] text-white/40 font-bold">
                  Equipment Types
                </p>
              </div>

              <div className="rounded-3xl bg-white border border-slate-200 p-6">
                <p className="text-3xl font-black text-violet-600">
                  {availableCount}
                </p>
                <p className="mt-2 text-[9px] uppercase tracking-[.2em] text-slate-400 font-bold">
                  Available Items
                </p>
              </div>

              <div className="rounded-3xl bg-white border border-slate-200 p-6">
                <p className="text-3xl font-black text-slate-900">
                  {totalCount}
                </p>
                <p className="mt-2 text-[9px] uppercase tracking-[.2em] text-slate-400 font-bold">
                  Total Equipment
                </p>
              </div>

              <div className="rounded-3xl bg-violet-600 text-white p-6">
                <p className="text-3xl font-black">CITK</p>
                <p className="mt-2 text-[9px] uppercase tracking-[.2em] text-white/55 font-bold">
                  Play with pride
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* =========================
            FACILITIES / EQUIPMENT
        ========================== */}
        <section
          id="facilities"
          className="scroll-mt-28 bg-white py-20 md:py-28"
        >
          <div className="max-w-[1200px] mx-auto px-5 md:px-8">

            <div className="flex flex-col md:flex-row md:items-end justify-between gap-5">
              <div>
                <p className="text-[10px] uppercase tracking-[.3em] font-black text-violet-600">
                  Sports facilities
                </p>
                <h2 className="mt-4 text-4xl md:text-6xl font-black tracking-tight">
                  Ready to play?
                </h2>
              </div>

              <p className="max-w-md text-sm text-slate-500 leading-6">
                Explore the sports equipment available to students and keep
                track of what is currently in circulation.
              </p>
            </div>

            {sportsItems.length > 0 ? (
              <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {sportsItems.slice(0, 6).map((item) => {
                  const available = Number(item.available_quantity || 0);
                  const total = Number(item.total_quantity || 0);
                  const percentage =
                    total > 0 ? Math.round((available / total) * 100) : 0;

                  return (
                    <div
                      key={item.id}
                      className="rounded-3xl border border-slate-200 p-6 hover:border-violet-300 hover:shadow-lg hover:shadow-violet-100/60 transition-all"
                    >
                      <div className="flex items-start justify-between">
                        <div className="h-12 w-12 rounded-2xl bg-violet-50 flex items-center justify-center text-xl">
                          🏅
                        </div>

                        <span
                          className={`rounded-full px-3 py-1.5 text-[9px] font-black uppercase ${
                            available > 0
                              ? "bg-emerald-50 text-emerald-600"
                              : "bg-red-50 text-red-500"
                          }`}
                        >
                          {available > 0 ? "Available" : "Unavailable"}
                        </span>
                      </div>

                      <h3 className="mt-7 text-lg font-black">
                        {item.item_name}
                      </h3>

                      <div className="mt-6">
                        <div className="flex justify-between text-[9px] uppercase tracking-widest font-bold text-slate-400">
                          <span>Stock</span>
                          <span>
                            {available} / {total}
                          </span>
                        </div>

                        <div className="mt-2 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full bg-violet-600"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="mt-12 rounded-3xl border border-dashed border-slate-200 p-16 text-center text-slate-400">
                No equipment information available.
              </div>
            )}
          </div>
        </section>

        {/* =========================
            FOOTER — INSPIRED BY IMAGE
        ========================== */}
        <footer className="bg-[#202231] text-white">
          <div className="max-w-[1200px] mx-auto px-5 md:px-8 py-14 md:py-16">

            <div className="grid lg:grid-cols-[1.05fr_1fr_1fr_1fr] gap-10 lg:gap-0">

              {/* Institute identity */}
              <div className="lg:pr-10 lg:border-r lg:border-white/10">
                <div className="flex justify-center lg:justify-start">
                  <div className="w-32 h-36 bg-white rounded-[42%] flex items-center justify-center overflow-hidden p-3">
                    <Image
                      src="/images/logo.png"
                      alt="Central Institute of Technology Kokrajhar"
                      width={125}
                      height={140}
                      className="object-contain"
                    />
                  </div>
                </div>

                <div className="mt-7 text-center lg:text-left">
                  <h3 className="text-lg font-semibold">
                    Central Institute of Technology
                  </h3>
                  <p className="mt-2 text-lg font-semibold">
                    Kokrajhar - 783370, Assam, India
                  </p>

                  <a
                    href="mailto:webmaster@cit.ac.in"
                    className="mt-5 inline-flex items-center gap-2 text-white/45 hover:text-orange-300 transition"
                  >
                    <span className="text-orange-400">✉</span>
                    webmaster@cit.ac.in
                  </a>
                </div>

                <div className="mt-6 flex justify-center lg:justify-start gap-3">
                  <a
                    href="#"
                    aria-label="Facebook"
                    className="h-10 w-10 rounded-full border border-white/25 flex items-center justify-center font-bold hover:bg-white hover:text-slate-900 transition"
                  >
                    f
                  </a>
                  <a
                    href="#"
                    aria-label="Twitter"
                    className="h-10 w-10 rounded-full border border-white/25 flex items-center justify-center font-bold hover:bg-white hover:text-slate-900 transition"
                  >
                    𝕏
                  </a>
                </div>
              </div>

              {/* Institute links */}
              <div className="lg:px-5 lg:border-r lg:border-white/10">
                <FooterLink href="#">SBI Online Payment</FooterLink>
                <FooterLink href="#">About</FooterLink>
                <FooterLink href="#">SC/ST Cell</FooterLink>
                <FooterLink href="#">WC & GC</FooterLink>
                <FooterLink href="#">IWN Cell</FooterLink>
                <FooterLink href="#">ICC Cell</FooterLink>
                <FooterLink href="#">Student Grievance</FooterLink>
                <FooterLink href="#">Anti Ragging</FooterLink>
              </div>

              
              <div className="lg:pl-5">
                <FooterLink href="#">MHRD</FooterLink>
                <FooterLink href="#">AICTE</FooterLink>
                <FooterLink href="#">NKN</FooterLink>
                <FooterLink href="#">BOPTR</FooterLink>
                <FooterLink href="#">IIT Guwahati</FooterLink>
                <FooterLink href="#">Gauhati University</FooterLink>
                <FooterLink href="#">ASTU</FooterLink>
                <FooterLink href="#">RTI</FooterLink>
              </div>
            </div>

            {/* Disclaimer */}
            <div className="mt-10 pt-5 border-t border-white/40">
              <p className="text-xs md:text-sm text-white/90 leading-6">
                <strong>Disclaimer:</strong> Neither the website in-charge nor
                the developer is responsible for any inadvertent error that
                may have crept in the information being published on the
                Internet. Maintained by Institute Website and Networking (IWN)
                Cell, CIT Kokrajhar. In case of any discrepancy in the
                website, please report to{" "}
                <a
                  href="mailto:webmaster@cit.ac.in"
                  className="text-white/55 hover:text-orange-300"
                >
                  webmaster@cit.ac.in
                </a>
              </p>
            </div>

            <div className="mt-6 text-center text-xs text-white/45">
              © 2026{" "}
              <span className="text-white/65">
                Central Institute of Technology Kokrajhar
              </span>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}

function FooterLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      className="group flex items-center justify-between border-b border-white/[.07] py-2.5 text-sm md:text-base text-white/75 hover:text-white transition"
    >
      <span>{children}</span>
      <span className="text-white/25 group-hover:text-orange-300 transition">
        ›
      </span>
    </a>
  );
}
