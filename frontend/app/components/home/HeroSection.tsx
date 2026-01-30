"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";

interface HeroSectionProps {
    heroImages?: string[];
}

const DEFAULT_HERO_IMAGES = [
    "https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=2070&auto=format&fit=crop", // Fashion 1
    "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=2070&auto=format&fit=crop", // Fashion 2
    "https://images.unsplash.com/photo-1445205170230-053b83016050?q=80&w=2071&auto=format&fit=crop", // Fashion 3
];

export default function HeroSection({ heroImages = DEFAULT_HERO_IMAGES }: HeroSectionProps) {
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    // Auto-rotate images
    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentImageIndex((prev) => (prev + 1) % heroImages.length);
        }, 5000);
        return () => clearInterval(interval);
    }, [heroImages.length]);

    return (
        <section className="relative w-full h-[80vh] min-h-[600px] overflow-hidden bg-[#E5E5E5]">
            {/* Full Width Image Slider */}
            {heroImages.map((src, index) => (
                <div
                    key={src}
                    className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${index === currentImageIndex ? "opacity-100 z-10" : "opacity-0 z-0"
                        }`}
                >
                    <Image
                        src={src}
                        alt={`Hero Lifestyle ${index + 1}`}
                        fill
                        className="object-cover"
                        priority={index === 0}
                    />
                    {/* Darker Overlay for better text contrast */}
                    <div className="absolute inset-0 bg-black/30" />
                </div>
            ))}

            {/* Content Overlay - Left Aligned */}
            <div className="absolute inset-0 z-20 flex items-center">
                <div className="container mx-auto px-10">
                    <div className="max-w-2xl space-y-8">
                        <h2 className="font-istok text-xs md:text-sm tracking-[0.4em] uppercase text-white/90 font-bold pl-1 animate-in fade-in slide-in-from-left-4 duration-700 delay-100">
                            NEW COLLECTION 2026
                        </h2>

                        <h1 className="font-istok text-[48px] md:text-[86px] lg:text-[100px] leading-[0.9] text-white uppercase font-black tracking-tight animate-in fade-in slide-in-from-left-4 duration-700 delay-200">
                            CHASE THE <br />
                            <span className="text-transparent bg-clip-text bg-linear-to-r from-accent to-white italic pr-4">UNSEEN</span>
                        </h1>

                        <div className="pt-4 flex flex-col sm:flex-row items-center gap-4 animate-in fade-in slide-in-from-left-4 duration-700 delay-300">
                            <Link
                                href="/products"
                                className="group flex items-center justify-center px-10 py-4 bg-white rounded-full hover:bg-black hover:text-white transition-all duration-300 transform hover:scale-105"
                            >
                                <span className="font-istok text-sm text-black group-hover:text-white font-bold uppercase tracking-widest">
                                    Go To Shop
                                </span>
                            </Link>

                            <Link
                                href="/new"
                                className="group flex items-center justify-center px-10 py-4 border border-white rounded-full hover:bg-white hover:text-black transition-all duration-300 transform hover:scale-105"
                            >
                                <span className="font-istok text-sm text-white group-hover:text-black font-bold uppercase tracking-widest">
                                    View New
                                </span>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            {/* Slider Indicators - Agile Rounded */}
            <div className="absolute bottom-12 left-10 md:left-1/2 md:-translate-x-1/2 z-30 flex items-center gap-3">
                {heroImages.map((_, index) => (
                    <button
                        key={index}
                        onClick={() => setCurrentImageIndex(index)}
                        className={`h-1.5 rounded-full transition-all duration-300 ${index === currentImageIndex
                            ? "w-12 bg-accent shadow-[0_0_10px_rgba(255,255,255,0.5)]"
                            : "w-3 bg-white/40 hover:bg-white/80 hover:w-6"}`}
                        aria-label={`Go to slide ${index + 1}`}
                    />
                ))}
            </div>
        </section>
    );
}

// Optional: Add global vertical text utility if not present
// .vertical-text { writing-mode: vertical-rl; transform: rotate(180deg); }
