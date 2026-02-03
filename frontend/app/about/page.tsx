"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import Link from "next/link";

function AboutContent() {
    const searchParams = useSearchParams();
    const tab = searchParams.get("tab") || "about";

    const tabs = [
        { id: "about", label: "About Us" },
        { id: "terms", label: "Terms & Conditions" },
        { id: "policy", label: "Privacy Policy" },
    ];

    return (
        <div className="min-h-screen bg-[#FDFDFB] pb-20 animate-in fade-in duration-500">
            {/* Hero Header */}
            <div className="w-full pt-20 pb-10 px-4">
                <div className="container mx-auto text-center relative z-10">
                    <div className="inline-block mb-4 animate-in slide-in-from-bottom-4 duration-700">
                        <div className="px-5 py-2 rounded-full border border-blue-100 bg-white/50 backdrop-blur-sm shadow-sm flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-[#0e4d80]"></div>
                            <span className="font-istok text-xs font-bold text-[#0e4d80] uppercase tracking-widest">Arashi Essentials</span>
                        </div>
                    </div>
                    <h1 className="font-koulen text-[56px] md:text-[80px] leading-none text-[#0e4d80] mb-4 drop-shadow-sm animate-in zoom-in-95 duration-700">
                        {tab === "terms" ? "Legal" : tab === "policy" ? "Privacy" : "Who We Are"}
                    </h1>
                    <p className="font-istok text-gray-400 uppercase tracking-[0.25em] text-sm md:text-base font-bold animate-in slide-in-from-bottom-5 duration-1000 delay-100">
                        Performance / Style / Culture
                    </p>
                </div>
            </div>

            {/* Tab Navigation */}
            <div className="sticky top-0 z-20 bg-[#FDFDFB]/90 backdrop-blur-md border-b border-gray-100">
                <div className="container mx-auto px-4">
                    <div className="flex overflow-x-auto no-scrollbar justify-center space-x-2 md:space-x-4 py-6">
                        {tabs.map((t) => (
                            <Link
                                key={t.id}
                                href={`/about?tab=${t.id}`}
                                className={`whitespace-nowrap font-istok text-xs md:text-sm uppercase tracking-widest font-bold px-6 md:px-8 py-3 rounded-full transition-all duration-300 ${tab === t.id
                                    ? "bg-[#e0f2fe] text-[#0e4d80] shadow-sm transform scale-105"
                                    : "bg-transparent text-gray-400 hover:text-[#0e4d80] hover:bg-gray-50"
                                    }`}
                            >
                                {t.label}
                            </Link>
                        ))}
                    </div>
                </div>
            </div>

            {/* Main Content Card Container */}
            <div className="container mx-auto px-4 py-8 max-w-5xl">
                <div className="bg-white rounded-[2.5rem] md:rounded-4xl shadow-xl shadow-blue-900/5 p-8 md:p-12 border border-gray-100 relative overflow-hidden">

                    {/* Decorative Blob */}
                    <div className="absolute -top-20 -right-20 w-96 h-96 bg-blue-50/50 rounded-full blur-3xl pointer-events-none"></div>
                    <div className="absolute -bottom-20 -left-20 w-96 h-96 bg-red-50/30 rounded-full blur-3xl pointer-events-none"></div>

                    <div className="relative z-10">
                        {tab === "about" && (
                            <div className="space-y-16 animate-in fade-in duration-500 slide-in-from-bottom-4">
                                {/* Section 1: Brand Story */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                                    <div className="space-y-6">
                                        <div className="inline-flex items-center gap-3">
                                            <span className="font-koulen text-blue-600 text-2xl">01</span>
                                            <span className="h-px w-12 bg-blue-200"></span>
                                            <span className="font-istok text-xs font-bold text-blue-800 uppercase tracking-widest">The Mission</span>
                                        </div>
                                        <h2 className="font-koulen text-4xl md:text-5xl text-[#0e4d80] leading-tight">
                                            Defining the <span className="text-[#D2042D]">New Standard.</span>
                                        </h2>
                                        <p className="text-gray-500 leading-relaxed font-istok text-lg font-light">
                                            Arashi isn&apos;t just about clothing; it&apos;s about movement. We merge high-performance engineering with contemporary street aesthetics to create gear that transitions seamlessly from the gym to the street.
                                        </p>
                                        <div className="grid grid-cols-2 gap-4 pt-2">
                                            <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                                                <h4 className="font-koulen text-2xl text-[#0e4d80]">Est. 2024</h4>
                                                <p className="font-istok text-[10px] text-gray-400 uppercase tracking-wider">Tokyo Roots</p>
                                            </div>
                                            <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                                                <h4 className="font-koulen text-2xl text-[#D2042D]">Global</h4>
                                                <p className="font-istok text-[10px] text-gray-400 uppercase tracking-wider">Vision</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* IMAGE PLACEHOLDER 1 */}
                                    <div className="relative aspect-square bg-gray-100 rounded-3xl overflow-hidden border-2 border-dashed border-gray-300 flex items-center justify-center group">
                                        <div className="text-center p-6">
                                            <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
                                                </svg>
                                            </div>
                                            <p className="font-koulen text-xl text-gray-400 uppercase">Brand Image Here</p>
                                            <p className="font-istok text-xs text-gray-400 mt-2">Recommended: Action shot or fabric detail</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Section 2: Features */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    {[
                                        { title: "Technical Fabrics", desc: "Breathable, moisture-wicking materials designed for endurance." },
                                        { title: "Precision Fit", desc: "Engineered silhouettes that move with your body, never against it." },
                                        { title: "Sustainable Future", desc: "Committed to eco-conscious production and lasting quality." }
                                    ].map((item, i) => (
                                        <div key={i} className="p-8 bg-gray-50 rounded-3xl hover:bg-[#e0f2fe]/30 transition-colors duration-300">
                                            <div className="flex flex-col h-full justify-between gap-4">
                                                <span className="font-koulen text-4xl text-gray-200">0{i + 1}</span>
                                                <div>
                                                    <h3 className="font-koulen text-xl text-[#0e4d80] mb-2">{item.title}</h3>
                                                    <p className="font-istok text-sm text-gray-500 leading-relaxed">{item.desc}</p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Section 3: Visual Showcase */}
                                <div className="rounded-[3rem] overflow-hidden bg-[#0e4d80] text-white relative">
                                    <div className="absolute inset-0 opacity-20 bg-[radial-gradient(ellipse_at_top_right,var(--tw-gradient-stops))] from-blue-400 via-[#0e4d80] to-[#0e4d80]"></div>
                                    <div className="relative z-10 grid grid-cols-1 md:grid-cols-2">
                                        <div className="p-12 md:p-16 flex flex-col justify-center">
                                            <h3 className="font-koulen text-4xl md:text-5xl mb-6 leading-none">
                                                Crafted for <br /><span className="text-blue-300">Unstoppable</span> Energy.
                                            </h3>
                                            <p className="font-istok text-blue-100/80 text-lg font-light mb-8">
                                                Every stitch is a promise of quality. Put it on and push your limits.
                                            </p>
                                            <Link href="/products" className="inline-flex items-center justify-center px-8 py-3 bg-white text-[#0e4d80] font-koulen text-lg rounded-full w-fit hover:bg-blue-50 transition-colors">
                                                Shop Collection
                                            </Link>
                                        </div>

                                        {/* IMAGE PLACEHOLDER 2 */}
                                        <div className="min-h-[300px] md:min-h-full bg-gray-800/50 border-l border-white/10 flex items-center justify-center relative overflow-hidden">
                                            <div className="text-center p-8 opacity-50">
                                                <p className="font-koulen text-2xl text-white uppercase tracking-widest">Lifestyle Image</p>
                                                <p className="font-istok text-sm text-blue-200 mt-2">Gym or Outdoor setting</p>
                                            </div>
                                            {/* Placeholder pattern */}
                                            <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle, #ffffff 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {tab === "terms" && (
                            <div className="space-y-12 animate-in fade-in duration-500 slide-in-from-bottom-4">
                                <div className="text-center max-w-2xl mx-auto space-y-4">
                                    <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-gray-50 rounded-full border border-gray-100">
                                        <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                                        <span className="font-istok text-[10px] font-bold text-gray-500 uppercase tracking-widest">Last Updated: Dec 2025</span>
                                    </div>
                                    <p className="font-istok text-gray-500 font-light">
                                        Please read these terms carefully before exploring our services. By using Arashi, you agree to these conditions.
                                    </p>
                                </div>

                                <div className="space-y-8">
                                    {[
                                        { title: "Use License", content: "Permission is granted to temporarily download one copy of the materials on Arashi's website for personal, non-commercial transitory viewing only." },
                                        { title: "Disclaimer", content: "The materials on Arashi's website are provided on an 'as is' basis. Arashi makes no warranties, expressed or implied." },
                                        { title: "Limitations", content: "In no event shall Arashi or its suppliers be liable for any damages arising out of the use or inability to use the materials." }
                                    ].map((section, idx) => (
                                        <div key={idx} className="flex gap-6 items-start p-6 rounded-3xl hover:bg-gray-50 transition-colors">
                                            <span className="font-koulen text-3xl text-gray-200 shrink-0">0{idx + 1}</span>
                                            <div>
                                                <h3 className="font-koulen text-2xl text-[#0e4d80] mb-2">{section.title}</h3>
                                                <p className="font-istok text-gray-600 leading-relaxed font-light">{section.content}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {tab === "policy" && (
                            <div className="space-y-12 animate-in fade-in duration-500 slide-in-from-bottom-4">
                                <div className="text-center max-w-2xl mx-auto space-y-4">
                                    <h2 className="font-koulen text-3xl text-[#0e4d80]">We Value Your Privacy</h2>
                                    <p className="font-istok text-gray-500 font-light">
                                        Your personal information is safe with us. We only collect what is necessary to provide you with the best experience.
                                    </p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="bg-blue-50/50 p-8 rounded-3xl border border-blue-100/50">
                                        <h3 className="font-koulen text-xl text-[#0e4d80] mb-4">What We Collect</h3>
                                        <ul className="space-y-3">
                                            {['Personal Identification', 'Payment Details', 'Browsing Data'].map((item, i) => (
                                                <li key={i} className="flex items-center gap-3 font-istok text-sm text-gray-600">
                                                    <div className="w-1.5 h-1.5 bg-blue-400 rounded-full"></div>
                                                    {item}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                    <div className="bg-gray-50 p-8 rounded-3xl border border-gray-100">
                                        <h3 className="font-koulen text-xl text-[#0e4d80] mb-4">How We Use It</h3>
                                        <ul className="space-y-3">
                                            {['Order Processing', 'Personalized Experience', 'Service Improvements'].map((item, i) => (
                                                <li key={i} className="flex items-center gap-3 font-istok text-sm text-gray-600">
                                                    <div className="w-1.5 h-1.5 bg-gray-400 rounded-full"></div>
                                                    {item}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                    <div className="col-span-1 md:col-span-2 bg-[#0e4d80] p-8 rounded-3xl text-white mt-4">
                                        <h3 className="font-koulen text-xl mb-2">Zero Tolerance</h3>
                                        <p className="font-istok text-blue-100 text-sm font-light">
                                            We do not sell, trade, or rent your personal identification information to others. Ever.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function AboutPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-[#FDFDFB] flex items-center justify-center"><div className="h-8 w-8 border-4 border-gray-200 border-t-[#0e4d80] rounded-full animate-spin"></div></div>}>
            <AboutContent />
        </Suspense>
    );
}
