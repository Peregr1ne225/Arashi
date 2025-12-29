"use client";

import Link from "next/link";


interface StickySummaryProps {
    subtotal: number;
    total: number;
    itemCount: number;
}

export default function StickySummary({ subtotal, total, itemCount }: StickySummaryProps) {
    return (
        <div className="lg:sticky lg:top-24 h-fit space-y-6">
            <div
                className="bg-neutral-900 border-2 border-dashed border-white/20 p-6 sm:p-8 skew-box relative overflow-hidden"
            >
                {/* Decorative Ticket Stub Effect */}
                <div className="absolute -left-3 top-1/2 w-6 h-6 bg-background rounded-full transform -translate-y-1/2"></div>
                <div className="absolute -right-3 top-1/2 w-6 h-6 bg-background rounded-full transform -translate-y-1/2"></div>

                <h2 className="text-3xl font-black uppercase italic tracking-tighter text-white mb-8 border-b border-white/10 pb-4">
                    Order Summary
                </h2>

                <div className="space-y-4 text-sm font-bold uppercase tracking-widest text-gray-400">
                    <div className="flex justify-between items-center">
                        <span>Subtotal ({itemCount})</span>
                        <span className="text-white">฿{subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span>Shipping</span>
                        <span className="text-accent">Free</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span>Tax</span>
                        <span className="text-xs">Calc at Checkout</span>
                    </div>

                    <div className="h-px bg-white/10 my-6 border-b border-dashed border-white/20 h-0" />

                    <div className="flex justify-between items-center text-2xl font-black italic tracking-tighter text-white">
                        <span>Total</span>
                        <span className="text-accent">฿{total.toFixed(2)}</span>
                    </div>
                </div>

                <div className="mt-8 space-y-6">
                    <Link
                        href="/checkout"
                        className="btn-primary w-full py-5 text-xl text-center block"
                    >
                        Checkout //
                    </Link>

                    <div className="flex justify-center gap-3 opacity-40">
                        {/* Simple visual indicator for secure payments */}
                        <span className="text-xs uppercase tracking-widest font-bold text-gray-500">Secure Payment Encrypted</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
