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
        <div className="animate-in fade-in duration-700 slide-in-from-bottom-4">
            <div className="flex justify-between items-end border-b border-gray-100 pb-6 mt-4">
                <div>
                    <h3 className="font-koulen text-[40px] text-[#0e4d80] leading-[0.85] uppercase tracking-tighter">
                        Address <span className="text-gray-300">Book.</span>
                    </h3>
                    <p className="font-body text-xs text-gray-400 uppercase tracking-widest mt-3 font-bold">
                        Manage your shipping address
                    </p>
                </div>
                {!isEditing && (
                    <button
                        onClick={() => setIsEditing(true)}
                        className="font-koulen text-sm uppercase tracking-widest text-[#0e4d80] hover:text-[#0b3d66] transition-colors border-2 border-transparent hover:border-[#0e4d80] px-6 py-2 rounded-full"
                    >
                        Edit
                    </button>
                )}
            </div>

            <div className="py-4">
                {isEditing ? (
                    <form onSubmit={handleSubmit} className="space-y-8">
                        <div className="relative group">
                            <label className="block font-koulen text-[11px] mb-2 text-gray-400 uppercase tracking-widest px-6">
                                Default Shipping Address
                            </label>
                            <textarea
                                rows={4}
                                value={address}
                                onChange={(e) => setAddress(e.target.value)}
                                className="block w-full rounded-[2.5rem] bg-gray-50 text-gray-900 border border-gray-100 focus:border-[#0e4d80] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#0e4d80]/5 font-body text-base font-normal p-8 min-h-40 resize-none placeholder-gray-300 shadow-sm transition-all"
                                placeholder="Enter your full shipping address..."
                            />
                        </div>
                        <div className="flex justify-center gap-4 pt-4">
                            <button
                                type="button"
                                onClick={() => setIsEditing(false)}
                                className="px-10 h-14 rounded-full border-2 border-gray-100 text-gray-400 font-koulen text-lg uppercase tracking-widest hover:bg-gray-50 hover:text-gray-600 transition-all duration-300"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="px-12 h-14 rounded-full bg-[#0e4d80] text-white font-koulen text-lg uppercase tracking-widest hover:bg-[#0b3d66] hover:shadow-2xl hover:shadow-blue-900/30 hover:-translate-y-1 transition-all duration-300 disabled:opacity-50 min-w-[200px] shadow-lg"
                            >
                                {isLoading ? "Saving..." : "Save Address"}
                            </button>
                        </div>
                    </form>
                ) : (
                    <div className="bg-white p-10 rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-xl hover:shadow-blue-900/5 transition-all duration-500 group">
                        <div className="flex items-start gap-8">
                            <div className="p-5 bg-blue-50/50 rounded-full text-[#0e4d80] shadow-inner group-hover:scale-110 transition-transform duration-500">
                                <MapPin className="w-8 h-8" />
                            </div>
                            <div className="flex-1">
                                <h4 className="font-koulen text-[11px] uppercase tracking-widest mb-3 text-gray-300">
                                    Default Address
                                    C</h4>
                                <p className="font-body text-xl font-bold text-gray-900 whitespace-pre-wrap leading-relaxed">
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
