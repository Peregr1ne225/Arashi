"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useMemo } from "react";

function AboutContent() {
    const searchParams = useSearchParams();
    const tab = searchParams.get("tab") || "about";
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        // eslint-disable-next-line
        setMounted(true);
    }, []);

    // Dynamic Title based on tab
    const title = useMemo(() => {
        switch (tab) {
            case "terms": return "Terms & Conditions";
            case "policy": return "Privacy Policy";
            default: return "About Us";
        }
    }, [tab]);

    const tabs = [
        { id: "about", label: "About Us" },
        { id: "terms", label: "Terms & Conditions" },
        { id: "policy", label: "Privacy Policy" },
    ];

    if (!mounted) {
        return <div className="min-h-screen bg-white" />; // Return empty or skeleton on server/initial render to match
    }

    return (
        <div className="min-h-screen bg-white mb-20 animate-in fade-in duration-500">
            {/* Hero Header */}
            <div className="w-full bg-linear-to-b from-blue-50/50 to-white py-24 px-4 relative overflow-hidden">
                {/* Decor elements */}
                <div className="absolute top-10 right-10 w-64 h-64 bg-purple-100 rounded-full blur-3xl opacity-30 animate-pulse"></div>
                <div className="absolute bottom-10 left-10 w-96 h-96 bg-blue-100 rounded-full blur-3xl opacity-30"></div>

                <div className="container mx-auto text-center relative z-10">
                    <div className="inline-block mb-6 animate-in slide-in-from-bottom-4 duration-700">
                        <div className="px-5 py-2 rounded-full border border-blue-100 bg-white/80 backdrop-blur-sm shadow-sm flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-[#0e4d80]"></div>
                            <span className="font-istok text-xs font-bold text-[#0e4d80] uppercase tracking-widest">Arashi Essentials</span>
                        </div>
                    </div>
                    <h1 className="font-koulen text-[56px] md:text-[80px] leading-none text-[#0e4d80] mb-6 drop-shadow-sm animate-in zoom-in-95 duration-700">
                        {title}
                    </h1>
                    <p className="font-istok text-gray-400 uppercase tracking-[0.3em] text-sm md:text-base animate-in slide-in-from-bottom-5 duration-1000 delay-100">
                        Performance / Style / Culture
                    </p>
                </div>
            </div>

            {/* Tab Navigation */}
            <div className="sticky top-0 z-20 bg-white/80 backdrop-blur-md border-b border-gray-100">
                <div className="container mx-auto px-4">
                    <div className="flex overflow-x-auto no-scrollbar justify-center py-6">
                        <div className="flex p-1.5 bg-gray-100/80 rounded-full backdrop-blur-sm shadow-inner group transition-all hover:bg-gray-100">
                            {tabs.map((t) => (
                                <Link
                                    key={t.id}
                                    href={`/about?tab=${t.id}`}
                                    className={`whitespace-nowrap font-istok text-[11px] md:text-[12px] uppercase tracking-widest font-bold px-8 py-3 rounded-full transition-all duration-300 ${tab === t.id
                                        ? "bg-[#0e4d80] text-white shadow-lg shadow-[#0e4d80]/20 scale-105"
                                        : "text-gray-500 hover:text-[#0e4d80] hover:bg-white/50"
                                        }`}
                                >
                                    {t.label}
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="container mx-auto px-4 py-16 max-w-5xl">
                {tab === "about" && (
                    <div className="space-y-16 animate-in fade-in duration-500 slide-in-from-bottom-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-20 items-center">
                            <div className="relative h-[500px] bg-gray-100 rounded-[2.5rem] overflow-hidden shadow-2xl shadow-blue-900/10 group">
                                {/* Placeholder for an About image */}
                                <div className="absolute inset-0 bg-linear-to-br from-gray-100 to-gray-200 flex items-center justify-center group-hover:scale-105 transition-transform duration-700">
                                    <div className="text-center">
                                        <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                                            <span className="font-koulen text-2xl text-gray-300">Img</span>
                                        </div>
                                        <span className="text-gray-400 font-istok uppercase tracking-widest text-xs">Visual Narrative</span>
                                    </div>
                                </div>
                                {/* Overlay gradient */}
                                <div className="absolute inset-0 bg-linear-to-t from-[#0e4d80]/10 to-transparent"></div>
                            </div>

                            <div className="space-y-8">
                                <div className="inline-flex items-center gap-3 px-4 py-2 bg-blue-50 rounded-full w-fit">
                                    <span className="font-koulen text-blue-600 text-lg">01</span>
                                    <span className="h-4 w-px bg-blue-200"></span>
                                    <span className="font-istok text-[10px] font-bold text-blue-800 uppercase tracking-widest">Heritage & Quality</span>
                                </div>

                                <h2 className="font-koulen text-5xl md:text-6xl text-[#0e4d80] leading-none">
                                    Crafted for <span className="text-[#D2042D]">Motion.</span><br />
                                    Designed for <span className="text-gray-400">Life.</span>
                                </h2>

                                <p className="text-gray-500 leading-loose font-istok text-lg font-light">
                                    Welcome to Arashi, where style meets enhanced comfort. We are dedicated to providing
                                    premium essentials that elevate your everyday wardrobe. Our journey began with a simple
                                    idea: to create clothing that looks good and feels even better.
                                </p>

                                <div className="grid grid-cols-2 gap-4 pt-4">
                                    <div className="p-6 bg-gray-50 rounded-3xl border border-gray-100 hover:border-blue-100 transition-colors">
                                        <h4 className="font-koulen text-3xl text-[#0e4d80] mb-2">100%</h4>
                                        <p className="font-istok text-xs text-gray-400 uppercase tracking-wider">Premium Cotton</p>
                                    </div>
                                    <div className="p-6 bg-gray-50 rounded-3xl border border-gray-100 hover:border-blue-100 transition-colors">
                                        <h4 className="font-koulen text-3xl text-[#D2042D] mb-2">24/7</h4>
                                        <p className="font-istok text-xs text-gray-400 uppercase tracking-wider">Comfort Guaranteed</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-[#0e4d80] rounded-[3rem] p-12 md:p-20 text-center relative overflow-hidden">
                            {/* Background Pattern */}
                            <div className="absolute top-0 left-0 w-full h-full opacity-10">
                                <div className="absolute top-10 left-10 w-64 h-64 bg-white rounded-full blur-3xl"></div>
                                <div className="absolute bottom-10 right-10 w-96 h-96 bg-white rounded-full blur-3xl"></div>
                            </div>

                            <div className="relative z-10 max-w-3xl mx-auto space-y-8">
                                <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/10 backdrop-blur-md rounded-full border border-white/20 mx-auto">
                                    <span className="font-istok text-[10px] font-bold text-white uppercase tracking-widest">Our Mission</span>
                                </div>
                                <h3 className="font-koulen text-4xl md:text-5xl text-white leading-tight">
                                    &quot;We believe in quality craftsmanship, sustainable practices, and designs that stand the test of time.&quot;
                                </h3>
                                <p className="text-blue-100/80 leading-relaxed font-istok font-light text-lg">
                                    Every piece in our collection is thoughtfully curated to ensure it meets
                                    our high standards of excellence. Thank you for being part of our story.
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {tab === "terms" && (
                    <div className="max-w-3xl mx-auto space-y-12 animate-in fade-in duration-500 slide-in-from-bottom-4">
                        <div className="text-center space-y-4 mb-12">
                            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-gray-100 rounded-full mx-auto">
                                <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                                <span className="font-istok text-[10px] font-bold text-gray-500 uppercase tracking-widest">Effective Date: December 2025</span>
                            </div>
                            <h2 className="font-koulen text-4xl text-[#0e4d80]">Legal & Conditions</h2>
                            <p className="font-istok text-lg text-gray-500 font-light">
                                Welcome to Arashi. Please read these terms carefully before using our services.
                            </p>
                        </div>

                        <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-xl shadow-gray-200/50 overflow-hidden">
                            <div className="p-8 md:p-12 space-y-10">
                                <section>
                                    <div className="flex items-start gap-4">
                                        <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
                                            <span className="font-koulen text-blue-600 text-xl">01</span>
                                        </div>
                                        <div>
                                            <h3 className="font-koulen text-2xl text-[#0e4d80] mb-4 mt-1">Use License</h3>
                                            <p className="text-gray-600 mb-6 font-istok leading-relaxed">
                                                Permission is granted to temporarily download one copy of the materials on Arashi&apos;s website for personal, non-commercial transitory viewing only. Under this license you may not:
                                            </p>
                                            <ul className="bg-gray-50 rounded-2xl p-6 space-y-3">
                                                {['Modify or copy the materials', 'Use the materials for any commercial purpose', 'Attempt to decompile or reverse engineer software', 'Remove any copyright notations'].map((item, i) => (
                                                    <li key={i} className="flex items-center gap-3 text-sm text-gray-600 font-istok font-medium">
                                                        <div className="w-1.5 h-1.5 bg-[#D2042D] rounded-full"></div>
                                                        {item}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>
                                </section>

                                <div className="h-px bg-gray-100 w-full"></div>

                                <section>
                                    <div className="flex items-start gap-4">
                                        <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center shrink-0">
                                            <span className="font-koulen text-[#D2042D] text-xl">02</span>
                                        </div>
                                        <div>
                                            <h3 className="font-koulen text-2xl text-[#0e4d80] mb-4 mt-1">Disclaimer</h3>
                                            <p className="text-gray-600 font-istok leading-relaxed">
                                                The materials on Arashi&apos;s website are provided on an &apos;as is&apos; basis. Arashi makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement.
                                            </p>
                                        </div>
                                    </div>
                                </section>

                                <div className="h-px bg-gray-100 w-full"></div>

                                <section>
                                    <div className="flex items-start gap-4">
                                        <div className="w-10 h-10 rounded-full bg-purple-50 flex items-center justify-center shrink-0">
                                            <span className="font-koulen text-purple-600 text-xl">03</span>
                                        </div>
                                        <div>
                                            <h3 className="font-koulen text-2xl text-[#0e4d80] mb-4 mt-1">Limitations</h3>
                                            <p className="text-gray-600 font-istok leading-relaxed">
                                                In no event shall Arashi or its suppliers be liable for any damages arising out of the use or inability to use the materials on Arashi&apos;s website.
                                            </p>
                                        </div>
                                    </div>
                                </section>
                            </div>
                        </div>
                    </div>
                )}

                {tab === "policy" && (
                    <div className="max-w-3xl mx-auto space-y-12 animate-in fade-in duration-500 slide-in-from-bottom-4">
                        <div className="text-center space-y-4 mb-12">
                            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-gray-100 rounded-full mx-auto">
                                <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse"></span>
                                <span className="font-istok text-[10px] font-bold text-gray-500 uppercase tracking-widest">Privacy First</span>
                            </div>
                            <h2 className="font-koulen text-4xl text-[#0e4d80]">Privacy Policy</h2>
                            <p className="font-istok text-lg text-gray-500 font-light">
                                Your privacy is important to us. We respect your personal information.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="bg-white p-8 rounded-4xl border border-gray-100 shadow-sm hover:shadow-md transition-all group">
                                <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                    <span className="font-koulen text-blue-600 text-xl">01</span>
                                </div>
                                <h3 className="font-koulen text-xl text-[#0e4d80] mb-3">Information Collection</h3>
                                <p className="text-gray-500 text-sm leading-relaxed mb-4">
                                    We collect information by fair and lawful means, with your knowledge and consent.
                                </p>
                                <ul className="space-y-2">
                                    <li className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-400">
                                        <div className="w-1 h-1 bg-blue-400 rounded-full"></div> Personal Info
                                    </li>
                                    <li className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-400">
                                        <div className="w-1 h-1 bg-blue-400 rounded-full"></div> Payment Details
                                    </li>
                                    <li className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-400">
                                        <div className="w-1 h-1 bg-blue-400 rounded-full"></div> Usage Stats
                                    </li>
                                </ul>
                            </div>

                            <div className="bg-white p-8 rounded-4xl border border-gray-100 shadow-sm hover:shadow-md transition-all group">
                                <div className="w-12 h-12 rounded-2xl bg-teal-50 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                    <span className="font-koulen text-teal-600 text-xl">02</span>
                                </div>
                                <h3 className="font-koulen text-xl text-[#0e4d80] mb-3">Data Usage</h3>
                                <p className="text-gray-500 text-sm leading-relaxed mb-4">
                                    We use your data to provide, operate, and maintain our website.
                                </p>
                                <ul className="space-y-2">
                                    <li className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-400">
                                        <div className="w-1 h-1 bg-teal-400 rounded-full"></div> Process Orders
                                    </li>
                                    <li className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-400">
                                        <div className="w-1 h-1 bg-teal-400 rounded-full"></div> Personalization
                                    </li>
                                    <li className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-400">
                                        <div className="w-1 h-1 bg-teal-400 rounded-full"></div> Updates & Offers
                                    </li>
                                </ul>
                            </div>

                            <div className="col-span-1 md:col-span-2 bg-[#0e4d80] p-8 rounded-4xl shadow-xl text-white relative overflow-hidden group">
                                <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2 group-hover:bg-white/10 transition-colors"></div>
                                <div className="relative z-10 flex flex-col md:flex-row gap-6 items-start md:items-center justify-between">
                                    <div>
                                        <div className="flex items-center gap-3 mb-2">
                                            <div className="px-3 py-1 bg-white/20 rounded-full text-[10px] font-bold uppercase tracking-widest backdrop-blur-sm">Strict Policy</div>
                                        </div>
                                        <h3 className="font-koulen text-2xl mb-2">Information Sharing</h3>
                                        <p className="text-blue-100 text-sm font-light max-w-lg">
                                            We do not share your personal information publicly or with third-parties, except when required to by law.
                                        </p>
                                    </div>
                                    <div className="w-12 h-12 rounded-full bg-white text-[#0e4d80] flex items-center justify-center shrink-0 shadow-lg">
                                        <span className="font-koulen text-xl">03</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default function AboutPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-[#FDFDFB] flex items-center justify-center"><div className="h-8 w-8 border-4 border-gray-200 border-t-black rounded-full animate-spin"></div></div>}>
            <AboutContent />
        </Suspense>
    );
}
