"use client";

import Image from "next/image";
import { useState } from "react";
import { getImageUrl } from "@/app/lib/utils/image";

interface PostImageProps {
    src: string;
    alt: string;
    className?: string;
}

export default function PostImage({ src, alt, className = "aspect-4/5" }: PostImageProps) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            <div
                className={`relative cursor-zoom-in group ${className}`}
                onClick={() => setIsOpen(true)}
            >
                <Image
                    src={getImageUrl(src)}
                    alt={alt}
                    fill
                    className="object-contain transition-transform duration-300 group-hover:scale-105"
                    priority
                />
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/20">
                    <span className="bg-white/90 text-gray-800 px-4 py-2 rounded-full text-sm font-medium shadow-lg">
                        Click to expand
                    </span>
                </div>
            </div>

            {/* Lightbox Modal */}
            {isOpen && (
                <div
                    className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center cursor-zoom-out p-4"
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
                            className="absolute top-4 right-4 text-white bg-black/50 p-2 rounded-full hover:bg-white/20 transition-colors"
                            onClick={(e) => {
                                e.stopPropagation();
                                setIsOpen(false);
                            }}
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>
            )}
        </>
    );
}
