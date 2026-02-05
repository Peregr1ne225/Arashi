"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { cmsApi } from "@/app/lib/api/client";

interface HeroSectionProps {
    heroImages?: string[];
}

const DEFAULT_HERO_IMAGES = [
    "https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=2070&auto=format&fit=crop", // Fashion 1
    "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=2070&auto=format&fit=crop", // Fashion 2
    "https://images.unsplash.com/photo-1445205170230-053b83016050?q=80&w=2071&auto=format&fit=crop", // Fashion 3
];

const DEFAULT_CONTENT = {
    smallText: "NEW COLLECTION 2026",
    headingLine1: "CHASE THE",
    headingHighlight: "UNSEEN",
    button1Text: "Go To Shop",
    button1Link: "/products",
    button2Text: "View New",
    button2Link: "/new",
};

export default function HeroSection({ heroImages = DEFAULT_HERO_IMAGES }: HeroSectionProps) {
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [content, setContent] = useState(DEFAULT_CONTENT);

    useEffect(() => {
        const fetchContent = async () => {
            try {
                const data = await cmsApi.getSiteContent("homepage_hero");
                if (data && data.content) {
                    setContent({ ...DEFAULT_CONTENT, ...data.content });
                }
            } catch (error) {
                console.error("Failed to fetch hero content:", error);
            }
        };
        fetchContent();
    }, []);

    // Auto-rotate images
    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentImageIndex((prev) => (prev + 1) % heroImages.length);
        }, 5000);
        return () => clearInterval(interval);
    }, [heroImages.length]);

    return (
        <section className="relative w-full h-[80vh] min-h-[600px] overflow-hidden bg-linear-to-b from-(--pastel-blue) to-white">
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
                    {/* Light Overlay for pastel feel */}
                    <div className="absolute inset-0 bg-white/20" />
                </div>
            ))}

            {/* Content Overlay - Left Aligned */}
            <div className="absolute inset-0 z-20 flex items-center">
                <div className="container mx-auto px-10">
                    <div className="max-w-2xl space-y-8">
                        <h2 className="font-body text-xs md:text-sm tracking-[0.4em] uppercase text-gray-900 font-bold pl-1 animate-in fade-in slide-in-from-left-4 duration-700 delay-100">
                            {content.smallText}
                        </h2>

                        <h1 className="font-display text-[48px] md:text-[86px] lg:text-[100px] leading-[0.9] text-pastel-blue-dark uppercase font-black tracking-tight animate-in fade-in slide-in-from-left-4 duration-700 delay-200">
                            {content.headingLine1} <br />
                            <span className="text-transparent bg-clip-text bg-linear-to-r from-black via-[#0e4d80] to-[#0ea5e9] italic pr-4">{content.headingHighlight}</span>
                        </h1>

                        <div className="pt-4 flex flex-col sm:flex-row items-center gap-4 animate-in fade-in slide-in-from-left-4 duration-700 delay-300">
                            <Link
                                href={content.button1Link}
                                className="group btn-primary"
                            >
                                <span className="text-sm font-bold uppercase tracking-widest">
                                    {content.button1Text}
                                </span>
                            </Link>

                            <Link
                                href={content.button2Link}
                                className="group btn-secondary"
                            >
                                <span className="text-sm font-bold uppercase tracking-widest">
                                    {content.button2Text}
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
                            ? "w-12 bg-pastel-blue-dark shadow-sm"
                            : "w-3 bg-gray-300 hover:bg-pastel-blue-dark/50 hover:w-6"}`}
                        aria-label={`Go to slide ${index + 1}`}
                    />
                ))}
            </div>
        </section>
    );
}

// Optional: Add global vertical text utility if not present
// .vertical-text { writing-mode: vertical-rl; transform: rotate(180deg); }
