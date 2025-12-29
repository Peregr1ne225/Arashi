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
                className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8"
            >
                <h2 className="text-xl font-bold text-gray-900 mb-6">Order Summary</h2>

                <div className="space-y-4 text-sm text-gray-600">
                    <div className="flex justify-between items-center">
                        <span>Subtotal ({itemCount} items)</span>
                        <span className="font-semibold text-gray-900">฿{subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span>Shipping Estimate</span>
                        <span className="text-green-600 font-medium">Free</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span>Tax</span>
                        <span>Calculated at checkout</span>
                    </div>

                    <div className="h-px bg-gray-100 my-4" />

                    <div className="flex justify-between items-center text-lg md:text-xl font-bold text-gray-900">
                        <span>Total</span>
                        <span>฿{total.toFixed(2)}</span>
                    </div>
                </div>

                <div className="mt-8 space-y-4">
                    <Link
                        href="/checkout"
                        className="block w-full py-4 px-6 bg-black hover:bg-gray-800 text-white text-center font-bold rounded-xl transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
                    >
                        Proceed to Checkout
                    </Link>



                    <div className="flex justify-center gap-3 grayscale opacity-60">
                        {/* Stripe Icon */}
                        <svg viewBox="0 0 60 25" className="h-6 w-auto" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                            <path d="M59.64 14.28h-8.06c-1.9 0-2.88-1.3-2.88-3.3 0-2.15 1.5-3.35 3.55-3.35 1.15 0 2.25.35 3.3 1v-3.7c-1.1-.4-2.5-.6-3.7-.6-5.4 0-8.25 3-8.25 7.4 0 4.75 3.3 6.95 7.05 6.95 1.7 0 3.1-.3 4.25-.85l.15-.35v-1.6c-.1.2-.25.4-.55.6-.95.5-2.2.8-3.75.8-1.65 0-2.45-1-2.45-2.6h11.4c0-2.2-.6-5.3-4.55-5.3-3.95 0-5.7 3.35-5.7 6.6 0 3.3 1.8 6.7 5.75 6.7 1.8 0 3.4-.45 4.45-.95v-3.6c-.1 0-.15.05-.15.15zm-9.3-5.2c0-1.25.55-2.3 2.1-2.3 1.6 0 2.15 1.05 2.15 2.25v.05h-4.25zM27.2 24.8V9.3h-4.2v15.5h4.2zm-2.1-18c1.5 0 2.6-1.15 2.6-2.6S26.6 1.6 25.1 1.6s-2.6 1.15-2.6 2.6 1.15 2.6 2.6 2.6zm-17.55 0c-1.55 0-2.35 1.1-2.35 2.2 0 1.25.9 2.1 2.3 2.1h.05V6.8zm23.6 5.85h-4.2V24.8h4.2V16c0-2.55 1.6-3.8 3.9-3.4v-4.3c-1.95-.3-3.25.5-3.9 1.95v-1.6zm-11.4 0H14.1c1.05-1.1 1.8-1.75 3.5-2v-3.7c-1.3 0-2.5.4-3.5 1.1V.6h-4.2v24.2h4.2V15.7c0-2.5 1.35-3.6 3.05-3.6.85 0 1.5.15 1.95.4v3.5c.05 0 0 .1.05.15h.6V12.65ZM5.6 11.1c.15-2.1 1.65-3.5 4.15-3.5 1.05 0 1.95.2 2.7.5V4.3c-.6-.2-1.35-.35-2.2-.35-5.9 0-8.9 3.55-8.9 7.9 0 4.1 2.5 6.45 6.2 7.7L9 20c-1.5-.55-2.1-1.35-2.1-2.5 0-1.4 1.15-2.25 3.05-2.25.9 0 1.85.2 2.6.5v-3.8c-.8-.25-1.55-.4-2.35-.4-2.5 0-3.95.85-4.6 1.9-.35.5-.45.45-.45.05L4.5 9.3h-4.3v4.25c.1-1.6 2.85-1.55 5.4-2.45z" />
                        </svg>
                    </div>
                </div>
            </div>
        </div>
    );
}
