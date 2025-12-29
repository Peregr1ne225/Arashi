"use client";

import { useState } from "react";
import Image from "next/image";
import { getImageUrl } from "@/app/lib/utils/image";

interface ProductGalleryProps {
    images: string[];
    name: string;
}

export default function ProductGallery({ images, name }: ProductGalleryProps) {
    const [selectedImage, setSelectedImage] = useState(0);
    const [isZoomOpen, setIsZoomOpen] = useState(false);

    // Filter out empty/null images and fallback to placeholder
    const validImages = images?.filter(img => img && img.trim() !== "") || [];
    const displayImages = validImages.length > 0 ? validImages : ["/placeholder-product.svg"];

    return (
        <div className="flex flex-col gap-4 sticky top-4">
            {/* Main Image */}
            <div
                className="relative aspect-[3/4] w-full overflow-hidden rounded-2xl bg-gray-100 cursor-zoom-in group border border-gray-100"
                onClick={() => setIsZoomOpen(true)}
            >
                <Image
                    src={getImageUrl(displayImages[selectedImage])}
                    alt={name}
                    fill
                    className="object-cover object-center transition-transform duration-500 group-hover:scale-105"
                    sizes="(max-width: 768px) 100vw, 50vw"
                    priority
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <div className="bg-white/90 backdrop-blur-sm p-3 rounded-full shadow-lg transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                        <svg className="w-5 h-5 text-gray-900" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                        </svg>
                    </div>
                </div>
            </div>

            {/* Thumbnails */}
            {displayImages.length > 1 && (
                <div className="grid grid-cols-5 gap-3">
                    {displayImages.map((img, idx) => (
                        <button
                            key={idx}
                            onClick={() => setSelectedImage(idx)}
                            className={`relative aspect-[3/4] overflow-hidden rounded-lg bg-gray-100 transition-all duration-200 border ${selectedImage === idx
                                ? "ring-2 ring-gray-900 ring-offset-2 border-transparent"
                                : "opacity-70 hover:opacity-100 border-gray-200"
                                }`}
                        >
                            <Image
                                src={getImageUrl(img)}
                                alt={`${name} view ${idx + 1}`}
                                fill
                                className="object-cover object-center"
                                sizes="100px"
                            />
                        </button>
                    ))}
                </div>
            )}

            {/* Zoom Modal */}
            {isZoomOpen && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-md p-4 animate-in fade-in duration-200"
                    onClick={() => setIsZoomOpen(false)}
                >
                    <button
                        className="absolute top-6 right-6 text-white/70 hover:text-white p-2 transition-colors z-50 bg-white/10 rounded-full"
                        onClick={() => setIsZoomOpen(false)}
                    >
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>

                    <div className="relative w-full h-full max-w-7xl flex items-center justify-center" onClick={e => e.stopPropagation()}>
                        <Image
                            src={getImageUrl(displayImages[selectedImage])}
                            alt={name}
                            fill
                            className="object-contain"
                            sizes="100vw"
                            priority
                        />
                    </div>
                </div>
            )}
        </div>
    );
}
