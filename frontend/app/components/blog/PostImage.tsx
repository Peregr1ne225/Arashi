"use client";

import Image from "next/image";
import { useState } from "react";
import { getImageUrl } from "@/app/lib/utils/image";

interface PostImageProps {
    src: string;
    alt: string;
}

export default function PostImage({ src, alt }: PostImageProps) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            <div
                className="relative aspect-video cursor-zoom-in group skew-box-sm border border-white/10 overflow-hidden"
                onClick={() => setIsOpen(true)}
            >
                <Image
                    src={getImageUrl(src)}
                    alt={alt}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                    priority
                />
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/60 backdrop-blur-[2px]">
                    <span className="bg-accent text-black px-6 py-2 skew-box-sm text-xs font-black uppercase italic tracking-widest shadow-[0_0_15px_rgba(204,255,0,0.5)] transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                        Expand View //
                    </span>
                </div>
            </div>

            {/* Lightbox Modal */}
            {isOpen && (
                <div
                    className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center cursor-zoom-out p-4 backdrop-blur-md animate-in fade-in duration-200"
                    onClick={() => setIsOpen(false)}
                >
                    <div className="relative w-full h-full max-w-7xl max-h-[90vh]">
                        <Image
                            src={src}
                            alt={alt}
                            fill
                            className="object-contain"
                            quality={100}
                            priority
                        />
                        <button
                            className="absolute top-4 right-4 text-white bg-black/50 p-2 hover:bg-accent hover:text-black transition-colors skew-box-sm border border-white/20 hover:border-transparent"
                            onClick={(e) => {
                                e.stopPropagation();
                                setIsOpen(false);
                            }}
                        >
                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>
            )}
        </>
    );
}
