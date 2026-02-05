"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import Link from "next/link";
import Image from "next/image";

function AboutContent() {
    const searchParams = useSearchParams();
    const tab = searchParams.get("tab") || "about";

    const tabs = [
        { id: "about", label: "About Us" },
        { id: "terms", label: "Terms & Conditions" },
        { id: "policy", label: "Privacy Policy" },
    ];

    return (
        <div className="min-h-screen bg-white pb-32 animate-in fade-in duration-700">
            {/* Hero Header */}
            <div className="w-full pt-24 pb-12 px-4 relative overflow-hidden">
                {/* Background Accent */}
                <div className="absolute top-0 right-0 w-1/3 h-full bg-blue-50/30 skew-x-[-20deg] translate-x-1/2 pointer-events-none" />

                <div className="container mx-auto text-center relative z-10">
                    <div className="inline-block mb-6 animate-in slide-in-from-bottom-4 duration-700">
                        <div className="px-6 py-2 rounded-full border border-gray-100 bg-white/80 backdrop-blur-sm shadow-sm flex items-center gap-3">
                            <div className="w-2.5 h-2.5 rounded-full bg-[#0e4d80] animate-pulse"></div>
                            <span className="font-koulen text-[14px] text-[#0e4d80] uppercase tracking-[0.2em]">Arashi / Essentials</span>
                        </div>
                    </div>
                    <h1 className="font-koulen text-[64px] md:text-[96px] leading-[0.9] text-[#0e4d80] mb-6 uppercase tracking-tighter animate-in zoom-in-95 duration-700">
                        {tab === "terms" ? "Legal" : tab === "policy" ? "Privacy" : "About Us"}
                    </h1>
                    <p className="font-body text-gray-400 uppercase tracking-[0.4em] text-xs md:text-sm font-bold animate-in slide-in-from-bottom-5 duration-1000 delay-100">
                        Performance / Speed / Culture
                    </p>
                </div>
            </div>

            {/* Tab Navigation */}
            <div className="sticky top-[72px] z-20 bg-white/90 backdrop-blur-xl border-b border-gray-100 shadow-sm transition-all duration-300">
                <div className="container mx-auto px-4">
                    <div className="flex overflow-x-auto no-scrollbar justify-center space-x-2 md:space-x-8 py-5">
                        {tabs.map((t) => (
                            <Link
                                key={t.id}
                                href={`/about?tab=${t.id}`}
                                className={`whitespace-nowrap font-koulen text-sm md:text-base uppercase tracking-widest px-8 py-3 rounded-full transition-all duration-300 relative group ${tab === t.id
                                    ? "text-[#0e4d80]"
                                    : "text-gray-400 hover:text-[#0e4d80]"
                                    }`}
                            >
                                {t.label}
                                {tab === t.id && (
                                    <div className="absolute inset-0 bg-[#0e4d80]/5 rounded-full -z-10 animate-in fade-in zoom-in-90" />
                                )}
                                <div className={`absolute bottom-0 left-1/2 -translate-x-1/2 w-10 h-0.5 bg-[#0e4d80] transition-all duration-300 ${tab === t.id ? "opacity-100 scale-100" : "opacity-0 scale-0 group-hover:opacity-40 group-hover:scale-100"}`} />
                            </Link>
                        ))}
                    </div>
                </div>
            </div>

            {/* Main Content Card Container */}
            <div className="container mx-auto px-4 py-8 max-w-6xl">
                <div className="bg-white rounded-[3rem] md:rounded-[4rem] shadow-2xl shadow-blue-900/5 p-8 md:p-16 border border-gray-100 relative overflow-hidden">

                    {/* Decorative Blobs */}
                    <div className="absolute -top-40 -right-40 w-[500px] h-[500px] bg-blue-50/40 rounded-full blur-[100px] pointer-events-none animate-pulse"></div>
                    <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] bg-[#0e4d80]/5 rounded-full blur-[100px] pointer-events-none"></div>

                    <div className="relative z-10">
                        {tab === "about" && (
                            <div className="space-y-24 animate-in fade-in duration-500 slide-in-from-bottom-4">
                                {/* Section 1: Brand Story */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
                                    <div className="space-y-8">
                                        <div className="inline-flex items-center gap-4">
                                            <span className="font-koulen text-[#0e4d80] text-3xl">01</span>
                                            <span className="h-px w-16 bg-blue-100"></span>
                                            <span className="font-koulen text-xs text-gray-400 uppercase tracking-[0.2em]">The Mission</span>
                                        </div>
                                        <h2 className="font-koulen text-[48px] md:text-[56px] text-[#0e4d80] leading-[0.95] uppercase tracking-tighter">
                                            The New <br /><span className="text-gray-300">Standard.</span>
                                        </h2>
                                        <p className="text-gray-500 leading-relaxed font-body text-lg">
                                            Arashi is an intersection of kinetics and aesthetics. We engineer gear that moves at the speed of your life, blending high-utility performance with minimal street design.
                                        </p>
                                        <div className="grid grid-cols-2 gap-6 pt-4">
                                            <div className="p-6 bg-gray-50/50 rounded-3xl border border-gray-100 shadow-sm transition-hover hover:shadow-md duration-300">
                                                <h4 className="font-koulen text-3xl text-[#0e4d80]">2024</h4>
                                                <p className="font-body text-[11px] text-gray-400 uppercase tracking-widest font-bold">Inception</p>
                                            </div>
                                            <div className="p-6 bg-[#0e4d80] rounded-3xl border border-[#0e4d80] shadow-lg shadow-blue-900/10">
                                                <h4 className="font-koulen text-3xl text-white">Global</h4>
                                                <p className="font-body text-[11px] text-blue-100/60 uppercase tracking-widest font-bold">Network</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="relative aspect-4/5 bg-gray-100 rounded-[3rem] overflow-hidden shadow-2xl border border-white group">
                                        <Image
                                            src="/About1.png"
                                            alt="Arashi Essentials Brand Image"
                                            fill
                                            className="object-cover group-hover:scale-105 transition-transform duration-1000 grayscale-[0.2] group-hover:grayscale-0"
                                            priority
                                        />
                                        <div className="absolute inset-0 bg-linear-to-t from-black/20 to-transparent" />
                                    </div>
                                </div>

                                {/* Section 2: Features */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                    {[
                                        { title: "Kinetic Fabrics", desc: "Four-way stretch textiles engineered for ultimate freedom of motion." },
                                        { title: "Precision Cut", desc: "Silhouettes drafted specifically for the athletic frame, providing a sharp look." },
                                        { title: "Future Ethics", desc: "A commitment to transparent manufacturing and circular materials." }
                                    ].map((item, i) => (
                                        <div key={i} className="group p-10 bg-white rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-500">
                                            <div className="flex flex-col h-full justify-between gap-8">
                                                <span className="font-koulen text-5xl text-gray-100 group-hover:text-[#0e4d80]/10 transition-colors">0{i + 1}</span>
                                                <div>
                                                    <h3 className="font-koulen text-2xl text-[#0e4d80] mb-3 uppercase tracking-tight">{item.title}</h3>
                                                    <p className="font-body text-sm text-gray-500 leading-relaxed font-normal">{item.desc}</p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Section 3: Visual Showcase */}
                                <div className="rounded-[4rem] overflow-hidden bg-black text-white relative shadow-2xl">
                                    <div className="absolute inset-0 opacity-40 bg-[radial-gradient(ellipse_at_top_right,var(--tw-gradient-stops))] from-blue-600 via-transparent to-transparent"></div>
                                    <div className="relative z-10 grid grid-cols-1 md:grid-cols-2">
                                        <div className="p-16 md:p-20 flex flex-col justify-center">
                                            <h3 className="font-koulen text-[56px] md:text-[72px] mb-8 leading-[0.85] uppercase tracking-tighter">
                                                Built for <br /><span className="text-blue-500">Momentum.</span>
                                            </h3>
                                            <p className="font-body text-gray-400 text-lg mb-10 max-w-sm">
                                                Experience the fusion of high-grade engineering and urban spirit.
                                            </p>
                                            <Link href="/products" className="inline-flex items-center justify-center px-10 py-5 bg-white text-black font-koulen text-xl rounded-full w-fit hover:bg-blue-400 hover:text-white transition-all duration-300 hover:scale-110 shadow-lg">
                                                Explore Now
                                            </Link>
                                        </div>

                                        <div className="min-h-[400px] md:min-h-full relative overflow-hidden group">
                                            <Image
                                                src="/About2.png"
                                                alt="Arashi Lifestyle"
                                                fill
                                                className="object-cover group-hover:scale-110 transition-all duration-1000 opacity-90 group-hover:opacity-100"
                                            />
                                            <div className="absolute inset-0 bg-linear-to-r from-black to-transparent" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {tab === "terms" && (
                            <div className="space-y-16 animate-in fade-in duration-500 slide-in-from-bottom-4">
                                <div className="text-center max-w-2xl mx-auto space-y-6">
                                    <div className="inline-flex items-center gap-3 px-6 py-2 bg-gray-50 rounded-full border border-gray-100 shadow-sm">
                                        <span className="w-2 h-2 bg-green-500 rounded-full shadow-[0_0_10px_rgba(34,197,94,0.5)] animate-pulse"></span>
                                        <span className="font-koulen text-xs text-gray-500 uppercase tracking-widest font-bold">Updated: DEC 2025</span>
                                    </div>
                                    <p className="font-body text-gray-500 text-lg">
                                        Clarity and trust are at our core. These terms govern your experience with the Arashi ecosystem.
                                    </p>
                                </div>

                                <div className="space-y-6">
                                    {[
                                        { title: "User License", content: "You are granted a limited, non-exclusive license to access Arashi's digital services for personal use only." },
                                        { title: "Service Accuracy", content: "We strive for precision, but tech and inventory can shift. We reserve the right to adjust details without notice." },
                                        { title: "Global Shipping", content: "Speed is our name. We work with premium carriers to ensure your gear arrives at terminal velocity." }
                                    ].map((section, idx) => (
                                        <div key={idx} className="flex gap-8 items-start p-10 rounded-[2rem] bg-gray-50/50 border border-gray-100 hover:bg-white hover:shadow-xl transition-all duration-300">
                                            <span className="font-koulen text-4xl text-[#0e4d80]/20 shrink-0">0{idx + 1}</span>
                                            <div>
                                                <h3 className="font-koulen text-2xl text-[#0e4d80] mb-3 uppercase tracking-tight">{section.title}</h3>
                                                <p className="font-body text-gray-600 leading-relaxed">{section.content}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {tab === "policy" && (
                            <div className="space-y-16 animate-in fade-in duration-500 slide-in-from-bottom-4">
                                <div className="text-center max-w-2xl mx-auto space-y-6">
                                    <h2 className="font-koulen text-[48px] md:text-[56px] text-[#0e4d80] leading-none uppercase tracking-tighter">Secure By Design.</h2>
                                    <p className="font-body text-gray-500 text-lg">
                                        Your kinetic data and profile details are encrypted within our high-speed secure network.
                                    </p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="bg-blue-50/30 p-12 rounded-[3rem] border border-blue-100/50 shadow-sm group hover:shadow-lg transition-all duration-300">
                                        <h3 className="font-koulen text-2xl text-[#0e4d80] mb-6 uppercase tracking-tight">Encrypted Collection</h3>
                                        <ul className="space-y-4">
                                            {['Authentication Tokens', 'Payment Vaulting', 'Activity Streams'].map((item, i) => (
                                                <li key={i} className="flex items-center gap-4 font-body text-sm text-gray-600 font-bold uppercase tracking-widest">
                                                    <div className="w-2 h-2 bg-blue-400 rounded-full shadow-sm"></div>
                                                    {item}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                    <div className="bg-gray-50/50 p-12 rounded-[3rem] border border-gray-100 shadow-sm group hover:shadow-lg transition-all duration-300">
                                        <h3 className="font-koulen text-2xl text-[#0e4d80] mb-6 uppercase tracking-tight">Flow & Function</h3>
                                        <ul className="space-y-4">
                                            {['Order Streamlining', 'Personalized Drops', 'System Performance'].map((item, i) => (
                                                <li key={i} className="flex items-center gap-4 font-body text-sm text-gray-600 font-bold uppercase tracking-widest">
                                                    <div className="w-2 h-2 bg-gray-400 rounded-full shadow-sm"></div>
                                                    {item}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                    <div className="col-span-1 md:col-span-2 bg-[#0e4d80] p-16 rounded-[4rem] text-white shadow-2xl relative overflow-hidden group">
                                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl group-hover:bg-white/20 transition-all duration-700" />
                                        <h3 className="font-koulen text-3xl mb-4 uppercase tracking-wider">Absolute Privacy</h3>
                                        <p className="font-body text-blue-100/80 text-lg leading-relaxed max-w-2xl">
                                            We operate on a zero-share policy. Your information remains within the Arashi perimeter. No third-party access, no compromises on your speed.
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
