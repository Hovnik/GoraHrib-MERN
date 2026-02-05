import React from "react";
import { Link } from "react-router";

const LandingPage = () => (
  <div className="min-h-screen bg-base-200 overflow-hidden">
    {/* Navigation */}
    <nav className="relative z-50 bg-green-800 shadow-lg">
      <div className="max-w-7xl mx-auto px-5 py-3 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <span className="text-3xl">🏔️</span>
          <span className="text-4xl font-bold text-white tracking-tight">
            GoraHrib
          </span>
        </div>
        <div className="flex gap-3">
          <Link
            to="/signin"
            className="inline-flex items-center h-9 px-4 text-white hover:text-gray-200 font-semibold transition-colors"
          >
            Prijava
          </Link>
          <Link
            to="/register"
            className="btn btn-primary btn-sm text-white h-9 flex items-center"
          >
            Registracija
          </Link>
        </div>
      </div>
    </nav>

    {/* Hero Section with Mountain Silhouette */}
    <section className="relative min-h-[600px] flex items-center justify-center overflow-hidden">
      {/* Mountain Silhouette Background - SVG */}
      <div className="absolute inset-0 flex items-end justify-center pointer-events-none">
        <svg
          className="w-full h-[400px]"
          viewBox="0 0 1440 400"
          preserveAspectRatio="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Left Mountain Range */}
          <path
            d="M0,400 L0,200 L150,80 L280,180 L380,120 L480,200 L550,400 Z"
            fill="url(#leftGrad)"
            opacity="0.3"
          />
          <path
            d="M0,400 L0,240 L100,140 L200,200 L320,160 L420,240 L500,400 Z"
            fill="url(#leftGrad)"
            opacity="0.5"
          />

          {/* Right Mountain Range */}
          <path
            d="M900,400 L900,200 L1020,100 L1140,180 L1240,140 L1340,200 L1440,250 L1440,400 Z"
            fill="url(#rightGrad)"
            opacity="0.3"
          />
          <path
            d="M950,400 L950,240 L1060,160 L1180,220 L1280,180 L1380,240 L1440,280 L1440,400 Z"
            fill="url(#rightGrad)"
            opacity="0.5"
          />

          <defs>
            <linearGradient id="leftGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop
                offset="0%"
                style={{ stopColor: "#166534", stopOpacity: 1 }}
              />
              <stop
                offset="100%"
                style={{ stopColor: "#22c55e", stopOpacity: 0.6 }}
              />
            </linearGradient>
            <linearGradient id="rightGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop
                offset="0%"
                style={{ stopColor: "#15803d", stopOpacity: 1 }}
              />
              <stop
                offset="100%"
                style={{ stopColor: "#166534", stopOpacity: 0.6 }}
              />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* Hero Content */}
      <div className="relative z-10 text-center max-w-3xl px-6 py-20">
        <h1 className="text-6xl md:text-7xl font-black text-green-800 mb-6 tracking-tight leading-tight">
          GoraHrib
        </h1>
        <p className="text-xl md:text-2xl text-green-700 mb-8 leading-relaxed max-w-2xl mx-auto">
          Vaš popoln gorski spremljevalec. Odkrijte skrite vrhove, beležite svoj
          napredek in proslavite s prijatelji.
        </p>
        <Link
          to="/register"
          className="btn btn-primary btn-lg text-white shadow-2xl hover:scale-105 transition-transform"
        >
          Začni svojo pot
        </Link>
      </div>
    </section>

    {/* Phone Mockups Section */}
    <section className="relative py-20 px-6">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-4xl font-bold text-center text-green-800 mb-16">
          Odkrijte Funkcionalnosti
        </h2>

        <div className="flex flex-wrap justify-center gap-12 lg:gap-16">
          {/* View 1: Map */}
          <div className="flex flex-col items-center gap-6 group">
            <div className="relative w-[280px] h-[580px] bg-slate-950 rounded-[3rem] p-3 shadow-2xl transition-all duration-500 hover:-translate-y-4 hover:scale-105">
              {/* Notch */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-slate-950 rounded-b-2xl z-20" />

              {/* Screen */}
              <div className="w-full h-full rounded-[2.2rem] overflow-hidden flex flex-col relative border border-slate-800">
                <img
                  src="/landing-page-screenshots/IMG_7634.PNG"
                  alt="Map view screenshot"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
            <p className="text-sm font-bold text-green-700 uppercase tracking-widest">
              Interaktivni Zemljevidi
            </p>
          </div>

          {/* View 2: Checklist */}
          <div className="flex flex-col items-center gap-6 group">
            <div className="relative w-[280px] h-[580px] bg-slate-950 rounded-[3rem] p-3 shadow-2xl transition-all duration-500 hover:-translate-y-4 hover:scale-105">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-slate-950 rounded-b-2xl z-20" />
              <div className="w-full h-full rounded-[2.2rem] overflow-hidden flex flex-col relative border border-slate-800">
                <img
                  src="/landing-page-screenshots/IMG_7637.PNG"
                  alt="Checklist view screenshot"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
            <p className="text-sm font-bold text-green-700 uppercase tracking-widest">
              Osebni Seznam Vrhov
            </p>
          </div>

          {/* View 3: Friends Leaderboard */}
          <div className="flex flex-col items-center gap-6 group">
            <div className="relative w-[280px] h-[580px] bg-slate-950 rounded-[3rem] p-3 shadow-2xl transition-all duration-500 hover:-translate-y-4 hover:scale-105">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-slate-950 rounded-b-2xl z-20" />
              <div className="w-full h-full rounded-[2.2rem] overflow-hidden flex flex-col relative border border-slate-800">
                <img
                  src="/landing-page-screenshots/IMG_7663.PNG"
                  alt="Friends leaderboard view screenshot"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
            <p className="text-sm font-bold text-green-700 uppercase tracking-widest">
              Lestvica Prijateljev
            </p>
          </div>
        </div>
      </div>
    </section>

    {/* Testimonials Section */}
    <section className="relative py-20 px-6 bg-white">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-4xl font-bold text-center text-green-800 mb-4">
          Kaj Pravijo Naši Uporabniki
        </h2>
        <p className="text-center text-green-700 mb-12 text-lg">
          Pridružite se skupnosti gorskih navdušencev
        </p>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Testimonial 1 */}
          <div className="bg-base-100 rounded-2xl p-8 shadow-lg border border-gray-200 hover:shadow-xl transition-shadow">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-green-700 rounded-full flex items-center justify-center text-white font-bold">
                AK
              </div>
              <div>
                <h4 className="font-bold text-slate-900">Ana Kovač</h4>
                <p className="text-xs text-slate-500">Gorski vodnik</p>
              </div>
            </div>
            <p className="text-slate-700 leading-relaxed">
              "GoraHrib mi je pomagal dokumentirati vse moje vzpone in deliti
              izkušnje s prijatelji. Aplikacija je enostavna in intuitivna!"
            </p>
            <div className="mt-4 text-yellow-500">★★★★★</div>
          </div>

          {/* Testimonial 2 */}
          <div className="bg-base-100 rounded-2xl p-8 shadow-lg border border-gray-200 hover:shadow-xl transition-shadow">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-green-700 rounded-full flex items-center justify-center text-white font-bold">
                MN
              </div>
              <div>
                <h4 className="font-bold text-slate-900">Marko Novak</h4>
                <p className="text-xs text-slate-500">Planinec</p>
              </div>
            </div>
            <p className="text-slate-700 leading-relaxed">
              "Končno aplikacija, ki razume slovenske gore! Popoln spremljevalec
              za odkrivanje novih vrhov in sledenje napredku."
            </p>
            <div className="mt-4 text-yellow-500">★★★★★</div>
          </div>

          {/* Testimonial 3 */}
          <div className="bg-base-100 rounded-2xl p-8 shadow-lg border border-gray-200 hover:shadow-xl transition-shadow">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-green-700 rounded-full flex items-center justify-center text-white font-bold">
                LJ
              </div>
              <div>
                <h4 className="font-bold text-slate-900">Lara Janež</h4>
                <p className="text-xs text-slate-500">Alpinistka</p>
              </div>
            </div>
            <p className="text-slate-700 leading-relaxed">
              "Motivacija, ki sem jo potrebovala! S GoraHrib lahko vidim svoj
              napredek in tekmovalnost z prijatelji me žene naprej."
            </p>
            <div className="mt-4 text-yellow-500">★★★★★</div>
          </div>
        </div>
      </div>
    </section>

    {/* Final CTA Section */}
    <section className="relative py-20 px-6 text-center bg-green-800 text-white">
      <div className="max-w-3xl mx-auto">
        <h2 className="text-4xl md:text-5xl font-bold mb-6">
          Pripravljeni na Avanturo?
        </h2>
        <p className="text-xl mb-8 text-green-100">
          Začnite slediti svojim vzponom še danes
        </p>
        <Link
          to="/register"
          className="btn btn-primary btn-lg text-white shadow-2xl hover:scale-105 transition-transform"
        >
          Začni svojo pot
        </Link>
      </div>
    </section>

    {/* Footer */}
    <footer className="bg-green-950 text-green-200 py-8 px-6">
      <div className="max-w-7xl mx-auto text-center">
        <p className="text-sm">
          © 2026 GoraHrib | Narejeno z <span className="text-error">♥</span> v
          Sloveniji
        </p>
      </div>
    </footer>
  </div>
);

export default LandingPage;
