"use client";

import { useState } from "react";
import { useAuth } from "@/app/hooks/useAuth";
import { api } from "@/app/lib/api";
import ChangePasswordForm from "./ChangePasswordForm";

export default function AccountProfile() {
    const { user, updateUser } = useAuth();
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        first_name: user?.first_name || "",
        last_name: user?.last_name || "",
        phone_number: user?.phone_number || "",
        email: user?.email || "",
    });
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState<{ type: "success" | "error", text: string } | null>(null);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setMessage(null);

        try {
            const response = await api.put("/auth/profile/update/", formData);
            if (response.ok) {
                const updatedUser = await response.json();
                updateUser(updatedUser);
                setMessage({ type: "success", text: "Profile updated successfully." });
                setIsEditing(false);
            } else {
                throw new Error("Failed to update profile");
            }
        } catch (error) {
            console.error(error);
            setMessage({ type: "error", text: "Failed to update profile. Please try again." });
        } finally {
            setIsLoading(false);
        }
    };

    const handleCancel = () => {
        setFormData({
            first_name: user?.first_name || "",
            last_name: user?.last_name || "",
            phone_number: user?.phone_number || "",
            email: user?.email || "",
        });
        setIsEditing(false);
    };

    return (
        <div className="space-y-8">
            <div className="bg-neutral-900 border border-white/10 skew-box overflow-hidden">
                <div className="px-6 py-5 border-b border-white/10 bg-black/20 flex justify-between items-center">
                    <div>
                        <h3 className="text-2xl font-black uppercase italic tracking-tighter text-white">Player Details</h3>
                        <p className="mt-1 text-xs font-bold uppercase tracking-widest text-gray-500">Update your roster information.</p>
                    </div>
                    {!isEditing && (
                        <button
                            onClick={() => setIsEditing(true)}
                            className="text-xs font-bold uppercase tracking-widest text-accent hover:text-white transition-colors skew-box border border-accent/20 px-4 py-2 hover:bg-accent hover:text-black"
                        >
                            Edit Stats //
                        </button>
                    )}
                </div>

                <div className="px-6 py-8">
                    {message && (
                        <div className={`mb-6 p-4 skew-box text-sm font-bold uppercase tracking-wider ${message.type === "success" ? "bg-accent/10 text-accent border border-accent/20" : "bg-red-900/20 text-red-500 border border-red-900/50"}`}>
                            {message.text}
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>
                        <div className="grid grid-cols-6 gap-6">
                            <div className="col-span-6 sm:col-span-3">
                                <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">First Name</label>
                                <input
                                    type="text"
                                    name="first_name"
                                    value={formData.first_name}
                                    onChange={handleChange}
                                    disabled={!isEditing}
                                    className={`w-full px-4 py-3 bg-black border ${isEditing ? "border-white/20 focus:border-accent" : "border-transparent bg-transparent pl-0 text-gray-400"} rounded-none text-white font-bold tracking-wide focus:outline-none skew-box transition-colors`}
                                />
                            </div>

                            <div className="col-span-6 sm:col-span-3">
                                <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">Last Name</label>
                                <input
                                    type="text"
                                    name="last_name"
                                    value={formData.last_name}
                                    onChange={handleChange}
                                    disabled={!isEditing}
                                    className={`w-full px-4 py-3 bg-black border ${isEditing ? "border-white/20 focus:border-accent" : "border-transparent bg-transparent pl-0 text-gray-400"} rounded-none text-white font-bold tracking-wide focus:outline-none skew-box transition-colors`}
                                />
                            </div>

                            <div className="col-span-6 sm:col-span-4">
                                <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">Email Address</label>
                                <div className="relative">
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        disabled
                                        className="w-full px-4 py-3 bg-white/5 border border-white/5 rounded-none text-gray-500 font-bold tracking-wide cursor-not-allowed skew-box"
                                    />
                                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold uppercase text-gray-600">Locked</span>
                                </div>
                                <p className="mt-2 text-[10px] font-bold uppercase tracking-widest text-gray-600">Contact Team Admin to change email.</p>
                            </div>

                            <div className="col-span-6 sm:col-span-3">
                                <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">Phone Number</label>
                                <input
                                    type="tel"
                                    name="phone_number"
                                    value={formData.phone_number}
                                    onChange={handleChange}
                                    disabled={!isEditing}
                                    className={`w-full px-4 py-3 bg-black border ${isEditing ? "border-white/20 focus:border-accent" : "border-transparent bg-transparent pl-0 text-gray-400"} rounded-none text-white font-bold tracking-wide focus:outline-none skew-box transition-colors`}
                                />
                            </div>
                        </div>

                        {isEditing && (
                            <div className="mt-8 flex justify-end gap-4 border-t border-white/10 pt-6">
                                <button
                                    type="button"
                                    onClick={handleCancel}
                                    className="px-6 py-2 border border-white/20 text-white font-bold uppercase tracking-wider hover:bg-white/10 skew-box transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="px-6 py-2 bg-accent text-black font-black uppercase italic tracking-wider hover:bg-white hover:text-black skew-box transition-colors"
                                >
                                    {isLoading ? "Saving..." : "Save Stats //"}
                                </button>
                            </div>
                        )}
                    </form>
                </div>
            </div>

            {/* Change Password Section */}
            <ChangePasswordForm />
        </div>
    );
}
