"use client";

import { useState } from "react";
import { useAuth } from "@/app/hooks/useAuth";
import { api } from "@/app/lib/api";
import { MapPin } from "lucide-react";

export default function AccountAddress() {
    const { user, updateUser } = useAuth();
    const [isEditing, setIsEditing] = useState(false);
    const [address, setAddress] = useState(user?.address || "");
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const response = await api.put("/auth/profile/update/", { address });
            if (response.ok) {
                const updatedUser = await response.json();
                updateUser(updatedUser);
                setIsEditing(false);
            }
        } catch (error) {
            console.error("Failed to update address", error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-8 animate-fadeIn">
            <div className="flex justify-between items-end border-b border-gray-100 pb-4">
                <div>
                    <h3 className="font-koulen text-3xl text-[#0e4d80] leading-none">
                        Address Book
                    </h3>
                    <p className="font-istok text-sm text-gray-400 uppercase tracking-widest mt-1">
                        Manage your shipping address
                    </p>
                </div>
                {!isEditing && (
                    <button
                        onClick={() => setIsEditing(true)}
                        className="font-istok text-xs font-bold uppercase tracking-[0.2em] text-[#0e4d80] hover:text-[#0b3d66] transition-colors border-b-2 border-transparent hover:border-[#0e4d80] pb-0.5"
                    >
                        Edit
                    </button>
                )}
            </div>

            <div className="py-2">
                {isEditing ? (
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block font-istok text-xs font-bold uppercase tracking-[0.15em] mb-2 text-gray-400 ml-2">
                                Default Shipping Address
                            </label>
                            <textarea
                                rows={4}
                                value={address}
                                onChange={(e) => setAddress(e.target.value)}
                                className="block w-full rounded-2xl bg-gray-50 text-gray-900 border border-transparent focus:border-[#0e4d80] focus:outline-none focus:ring-2 focus:ring-[#0e4d80]/10 font-istok text-base font-bold p-6 min-h-35 resize-none placeholder-gray-400 shadow-inner transition-all"
                                placeholder="Enter your full shipping address..."
                            />
                        </div>
                        <div className="flex justify-end gap-4">
                            <button
                                type="button"
                                onClick={() => setIsEditing(false)}
                                className="px-8 h-12 rounded-full border-2 border-gray-100 text-gray-500 font-istok text-sm font-bold uppercase tracking-[0.2em] hover:bg-gray-50 hover:text-gray-700 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="px-8 h-12 rounded-full bg-[#0e4d80] text-white font-istok text-sm font-bold uppercase tracking-[0.2em] hover:bg-[#0b3d66] hover:shadow-lg hover:shadow-blue-900/20 hover:-translate-y-0.5 transition-all disabled:opacity-50 min-w-37"
                            >
                                Save Address
                            </button>
                        </div>
                    </form>
                ) : (
                    <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-start gap-4">
                            <div className="p-3 bg-blue-50 rounded-full text-[#0e4d80]">
                                <MapPin className="w-6 h-6" />
                            </div>
                            <div>
                                <h4 className="font-istok font-bold uppercase tracking-[0.15em] mb-2 text-gray-400 text-xs">
                                    Default Address
                                </h4>
                                <p className="font-istok text-lg font-bold text-gray-900 whitespace-pre-wrap leading-relaxed">
                                    {user?.address || "No address saved yet."}
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
