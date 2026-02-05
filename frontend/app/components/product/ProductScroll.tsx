"use client";

import { useRef, useState, useEffect } from "react";
import ProductCard from "./ProductCard";
import { ProductCardData } from "@/app/types/product";

interface ProductScrollProps {
    products: ProductCardData[];
}

export default function ProductScroll({ products }: ProductScrollProps) {
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(true);

    const checkScroll = () => {
        if (scrollContainerRef.current) {
            const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
            setCanScrollLeft(scrollLeft > 0);
            // Allow a small buffer (1px) for calculation precision
            setCanScrollRight(Math.ceil(scrollLeft + clientWidth) < scrollWidth);
        }
    };

    useEffect(() => {
        checkScroll();
        window.addEventListener("resize", checkScroll);
        return () => window.removeEventListener("resize", checkScroll);
    }, [products]);

    const scroll = (direction: "left" | "right") => {
        if (scrollContainerRef.current) {
            const { current } = scrollContainerRef;
            const scrollAmount = 300; // card width + gap (approx)
            if (direction === "left") {
                current.scrollBy({ left: -scrollAmount, behavior: "smooth" });
            } else {
                current.scrollBy({ left: scrollAmount, behavior: "smooth" });
            }
            // Check scroll after animation (approx delay)
            setTimeout(checkScroll, 300);
        }
    };

    return (
        <div className="flex flex-col w-full">
            {/* Horizontal Scroll Product List */}
            <div
                ref={scrollContainerRef}
                onScroll={checkScroll}
                className="w-full overflow-x-auto py-8 px-4 no-scrollbar scroll-smooth"
            >
                <div className="flex gap-4 w-max px-1">
                    {products && products.length > 0
                        ? products.map((product) => (
                            <div key={product.id} className="w-[260px] md:w-[280px] shrink-0 transform transition-transform duration-300 hover:-translate-y-1">
                                <ProductCard product={product} />
                            </div>
                        ))
                        : // Loading/Empty State
                        Array.from({ length: 4 }).map((_, idx) => (
                            <div
                                key={idx}
                                className="w-[260px] md:w-[280px] shrink-0 aspect-3/4 bg-gray-100 animate-pulse rounded-4xl"
                            />
                        ))}
                </div>
            </div>

            {/* Controls */}
            <div className="flex items-center justify-center gap-2">
                <button
                    onClick={() => scroll("left")}
                    disabled={!canScrollLeft}
                    className="w-12 h-12 border border-gray-200 bg-white flex items-center justify-center hover:bg-[#0e4d80] hover:text-white hover:border-[#0e4d80] transition-all rounded-full shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:text-gray-400 disabled:hover:border-gray-200"
                    aria-label="Scroll left"
                >
                    <svg
                        width="16"
                        height="16"
                        viewBox="0 0 16 16"
                        fill="none"
                        stroke="currentColor"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <path
                            d="M10 12L6 8L10 4"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                    </svg>
                </button>
                <button
                    onClick={() => scroll("right")}
                    disabled={!canScrollRight}
                    className="w-12 h-12 border border-gray-200 bg-white flex items-center justify-center hover:bg-[#0e4d80] hover:text-white hover:border-[#0e4d80] transition-all rounded-full shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:text-gray-400 disabled:hover:border-gray-200"
                    aria-label="Scroll right"
                >
                    <svg
                        width="16"
                        height="16"
                        viewBox="0 0 16 16"
                        fill="none"
                        stroke="currentColor"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <path
                            d="M6 12L10 8L6 4"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                    </svg>
                </button>
            </div>
        </div>
    );
}
