"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { getImageUrl } from "@/app/lib/utils/image";

interface ProductGalleryProps {
    images: string[];
    name: string;
    previewImage?: string | null;
}

export default function ProductGallery({
    images,
    name,
    previewImage,
}: ProductGalleryProps) {
    const [selectedImage, setSelectedImage] = useState(0);
    const [isZoomOpen, setIsZoomOpen] = useState(false);

    // Filter out empty/null images and fallback to placeholder
    const validImages = images?.filter((img) => img && img.trim() !== "") || [];
    const displayImages =
        validImages.length > 0 ? validImages : ["/placeholder-product.svg"];

    // Use preview image when hovering, otherwise use selected image
    const currentImage = previewImage || displayImages[selectedImage];

    const handlePrevious = (e: React.MouseEvent) => {
        e.stopPropagation();
        setSelectedImage((prev) =>
            prev === 0 ? displayImages.length - 1 : prev - 1,
        );
    };

    const handleNext = (e: React.MouseEvent) => {
        e.stopPropagation();
        setSelectedImage((prev) =>
            prev === displayImages.length - 1 ? 0 : prev + 1,
        );
    };

    return (
        <div className="flex flex-row gap-6 sticky top-4 w-[90%] mx-auto">
            {/* Main Image Container */}
            <div className="flex-1 flex flex-col gap-4">
                <div
                    className="relative aspect-3/4 w-full overflow-hidden rounded-4xl bg-white shadow-xl shadow-blue-900/5 cursor-zoom-in group border border-gray-100"
                    onClick={() => setIsZoomOpen(true)}
                >
                    <Image
                        src={getImageUrl(currentImage)}
                        alt={name}
                        fill
                        className="object-cover object-center transition-transform duration-500 group-hover:scale-105"
                        sizes="(max-width: 500px) 100vw, 50vw"
                        priority
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                        <div className="bg-white/90 backdrop-blur-sm p-3 rounded-full shadow-lg transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                            <svg
                                className="w-5 h-5 text-gray-900"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7"
                                />
                            </svg>
                        </div>
                    </div>
                </div>

                {/* Navigation Buttons */}
                {displayImages.length > 1 && (
                    <div className="flex items-center justify-center gap-4">
                        <button
                            onClick={handlePrevious}
                            className="flex items-center justify-center w-12 h-12 rounded-full bg-gray-900 text-white hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            aria-label="Previous image"
                        >
                            <svg
                                className="w-5 h-5"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M15 19l-7-7 7-7"
                                />
                            </svg>
                        </button>
                        <span className="text-gray-600 text-sm font-medium">
                            {selectedImage + 1} / {displayImages.length}
                        </span>
                        <button
                            onClick={handleNext}
                            className="flex items-center justify-center w-12 h-12 rounded-full bg-gray-900 text-white hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            aria-label="Next image"
                        >
                            <svg
                                className="w-5 h-5"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M9 5l7 7-7 7"
                                />
                            </svg>
                        </button>
                    </div>
                )}
            </div>

            {/* Thumbnails - Right Side */}
            {displayImages.length > 1 && (
                <div className="flex flex-col gap-1.5 w-14 md:w-16">
                    {displayImages.map((img, idx) => (
                        <button
                            key={idx}
                            onClick={() => setSelectedImage(idx)}
                            className={`relative aspect-3/4 overflow-hidden rounded-xl bg-gray-50 transition-all duration-300 ${selectedImage === idx
                                ? "ring-2 ring-black ring-offset-2 opacity-100 scale-95"
                                : "opacity-60 hover:opacity-100 hover:scale-100 border border-transparent"
                                }`}
                        >
                            <Image
                                src={getImageUrl(img)}
                                alt={`${name} view ${idx + 1}`}
                                fill
                                className="object-cover object-center"
                                sizes="80px"
                            />
                        </button>
                    ))}
                </div>
            )}

            {/* Zoom Modal */}
            {isZoomOpen &&
                typeof document !== "undefined" &&
                createPortal(
                    <div
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-md p-4 animate-in fade-in duration-200"
                        onClick={() => setIsZoomOpen(false)}
                    >
                        <button
                            className="absolute top-6 right-6 text-white/70 hover:text-white p-2 transition-colors z-50 bg-white/10 rounded-full"
                            onClick={() => setIsZoomOpen(false)}
                        >
                            <svg
                                className="w-6 h-6"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M6 18L18 6M6 6l12 12"
                                />
                            </svg>
                        </button>

                        {/* Zoom Navigation */}
                        {displayImages.length > 1 && (
                            <>
                                <button
                                    className="absolute left-6 top-1/2 -translate-y-1/2 text-white/70 hover:text-white p-2 transition-colors z-50 bg-white/10 rounded-full"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handlePrevious(e);
                                    }}
                                >
                                    <svg
                                        className="w-6 h-6"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M15 19l-7-7 7-7"
                                        />
                                    </svg>
                                </button>
                                <button
                                    className="absolute right-6 top-1/2 -translate-y-1/2 text-white/70 hover:text-white p-2 transition-colors z-50 bg-white/10 rounded-full"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleNext(e);
                                    }}
                                >
                                    <svg
                                        className="w-6 h-6"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M9 5l7 7-7 7"
                                        />
                                    </svg>
                                </button>
                            </>
                        )}

                        <div
                            className="relative w-full h-full max-w-7xl flex items-center justify-center"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <Image
                                src={getImageUrl(displayImages[selectedImage])}
                                alt={name}
                                fill
                                className="object-contain"
                                sizes="100vw"
                                priority
                            />
                        </div>
                    </div>,
                    document.body,
                )}
        </div>
    );
}
