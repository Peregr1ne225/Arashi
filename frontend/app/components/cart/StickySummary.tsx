"use client";

import Link from "next/link";


interface StickySummaryProps {
    subtotal: number;
    total: number;
    itemCount: number;
    originalTotal?: number;
}

export default function StickySummary({ subtotal, total, itemCount, originalTotal }: StickySummaryProps) {
    const discount = originalTotal && originalTotal > total ? originalTotal - total : 0;

    return (
        <div className="h-fit">
            <div className="p-8 bg-white border border-gray-50 rounded-4xl shadow-xl h-full flex flex-col">
                <h2 className="font-koulen text-2xl uppercase tracking-wide text-black mb-8">Order Summary</h2>

                <div className="space-y-4 mb-8">
                    {discount > 0 ? (
                        <>
                            <div className="flex justify-between font-istok text-sm font-bold uppercase tracking-wider text-gray-500">
                                <span>Price ({itemCount} items)</span>
                                <span className="line-through">฿{originalTotal?.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between font-istok text-sm font-bold uppercase tracking-wider text-red-600">
                                <span>Discount</span>
                                <span>-฿{discount.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between font-istok text-sm font-bold uppercase tracking-wider text-black">
                                <span>Subtotal</span>
                                <span>฿{subtotal.toFixed(2)}</span>
                            </div>
                        </>
                    ) : (
                        <div className="flex justify-between font-istok text-sm font-bold uppercase tracking-wider text-black">
                            <span>Subtotal</span>
                            <span>฿{subtotal.toFixed(2)}</span>
                        </div>
                    )}

                    <div className="flex justify-between font-istok text-sm font-bold uppercase tracking-wider text-black">
                        <span>Shipping</span>
                        <span>฿0.00</span>
                    </div>
                </div>

                <div className="h-px bg-black/5 my-6" />

                <div className="flex justify-between items-center font-istok font-bold uppercase tracking-wider text-black text-xl mb-8">
                    <span>Total <span className="text-[10px] font-normal text-gray-400 normal-case ml-1">(TAX INCL.)</span></span>
                    <span>฿{total.toFixed(2)}</span>
                </div>

                <Link
                    href="/checkout"
                    className="w-full py-4 flex items-center justify-center bg-[#0e4d80] hover:bg-[#0a3a60] text-white rounded-full font-koulen uppercase tracking-wider text-lg shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all"
                >
                    Proceed to Checkout
                </Link>
            </div>
        </div>
    );
}
