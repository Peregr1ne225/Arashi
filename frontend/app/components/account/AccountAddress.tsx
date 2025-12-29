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
            // Assuming address is updated via profile endpoint
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
        <div className="bg-neutral-900 border border-white/10 skew-box overflow-hidden">
            <div className="px-6 py-5 border-b border-white/10 bg-black/20 flex justify-between items-center">
                <div>
                    <h3 className="text-2xl font-black uppercase italic tracking-tighter text-white">Shipping Coordinates</h3>
                    <p className="mt-1 text-xs font-bold uppercase tracking-widest text-gray-500">Manage your delivery zone.</p>
                </div>
                {!isEditing && (
                    <button
                        onClick={() => setIsEditing(true)}
                        className="text-xs font-bold uppercase tracking-widest text-accent hover:text-white transition-colors skew-box border border-accent/20 px-4 py-2 hover:bg-accent hover:text-black"
                    >
                        Edit Zone //
                    </button>
                )}
            </div>

            <div className="p-6">
                {isEditing ? (
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">Default Shipping Address</label>
                            <textarea
                                rows={4}
                                value={address}
                                onChange={(e) => setAddress(e.target.value)}
                                className="w-full px-4 py-3 bg-black border border-white/20 rounded-none text-white font-bold tracking-wide focus:outline-none focus:border-accent skew-box transition-colors resize-none placeholder-gray-600"
                                placeholder="ENTER YOUR FULL ADDRESS HERE..."
                            />
                        </div>
                        <div className="flex justify-end gap-4 border-t border-white/10 pt-6">
                            <button
                                type="button"
                                onClick={() => setIsEditing(false)}
                                className="px-6 py-2 border border-white/20 text-white font-bold uppercase tracking-wider hover:bg-white/10 skew-box transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="px-6 py-2 bg-accent text-black font-black uppercase italic tracking-wider hover:bg-white hover:text-black skew-box transition-colors"
                            >
                                {isLoading ? "Saving..." : "Save Coordinates //"}
                            </button>
                        </div>
                    </form>
                ) : (
                    <div className="bg-black border border-white/10 p-6 flex items-start space-x-4 skew-box relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity">
                            <MapPin className="w-24 h-24 text-white" />
                        </div>
                        <div className="p-3 bg-neutral-900 border border-white/10 skew-box-sm">
                            <MapPin className="w-6 h-6 text-accent" />
                        </div>
                        <div className="relative z-10">
                            <h4 className="text-sm font-black uppercase italic tracking-wide text-white mb-2">Default Zone</h4>
                            <p className="text-sm font-bold text-gray-400 whitespace-pre-wrap uppercase tracking-wide leading-relaxed">
                                {user?.address || "NO ADDRESS ASSIGNED TO THIS LOCKER."}
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
