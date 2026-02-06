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
    const [message, setMessage] = useState<{
        type: "success" | "error";
        text: string;
    } | null>(null);

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
            setMessage({
                type: "error",
                text: "Failed to update profile. Please try again.",
            });
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

    const inputClasses =
        "block w-full h-[56px] px-8 rounded-full bg-gray-50 text-gray-900 border border-gray-100 focus:border-[#0e4d80] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#0e4d80]/5 font-body text-base font-normal transition-all disabled:opacity-60 disabled:cursor-not-allowed placeholder-gray-300 shadow-sm";
    const labelClasses =
        "block font-koulen text-[11px] mb-2 text-gray-400 uppercase tracking-widest px-6";

    return (
        <div className="space-y-20 animate-in fade-in duration-700 slide-in-from-bottom-4">
            {/* Personal Info Section */}
            <div>
                <div className="flex justify-between items-end mb-10 border-b border-gray-100 pb-6">
                    <div>
                        <h3 className="font-koulen text-[40px] text-[#0e4d80] leading-[0.85] uppercase tracking-tighter">
                            Personal <span className="text-gray-300">Information.</span>
                        </h3>
                        <p className="font-body text-xs text-gray-400 uppercase tracking-widest mt-3 font-bold">
                            Update your personal details
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

                {message && (
                    <div
                        className={`mb-8 p-5 rounded-3xl text-center font-koulen uppercase tracking-widest text-sm ${message.type === "success" ? "bg-green-50 text-green-700 border border-green-100" : "bg-blue-50 text-[#0e4d80] border border-blue-100"}`}
                    >
                        {message.text}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                        <div className="relative group">
                            <label className={labelClasses}>First Name</label>
                            <input
                                type="text"
                                name="first_name"
                                placeholder="First Name"
                                value={formData.first_name}
                                onChange={handleChange}
                                disabled={!isEditing}
                                className={inputClasses}
                            />
                        </div>

                        <div className="relative group">
                            <label className={labelClasses}>Last Name</label>
                            <input
                                type="text"
                                name="last_name"
                                placeholder="Last Name"
                                value={formData.last_name}
                                onChange={handleChange}
                                disabled={!isEditing}
                                className={inputClasses}
                            />
                        </div>

                        <div className="md:col-span-2 relative group">
                            <label className={labelClasses}>Email Address</label>
                            <input
                                type="email"
                                name="email"
                                placeholder="Email Address"
                                value={formData.email}
                                onChange={handleChange}
                                disabled={!isEditing}
                                className={inputClasses}
                            />
                        </div>

                        <div className="md:col-span-2 relative group">
                            <label className={labelClasses}>Phone Number</label>
                            <input
                                type="tel"
                                name="phone_number"
                                placeholder="Phone Number"
                                value={formData.phone_number}
                                onChange={handleChange}
                                disabled={!isEditing}
                                className={inputClasses}
                            />
                        </div>
                    </div>

                    {isEditing && (
                        <div className="mt-12 flex justify-center gap-4">
                            <button
                                type="button"
                                onClick={handleCancel}
                                className="px-10 h-14 rounded-full border-2 border-gray-100 text-gray-400 font-koulen text-lg uppercase tracking-widest hover:bg-gray-50 hover:text-gray-600 transition-all duration-300"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="px-12 h-14 rounded-full bg-[#0e4d80] text-white font-koulen text-lg uppercase tracking-widest hover:bg-[#0b3d66] hover:shadow-2xl hover:shadow-blue-900/30 hover:-translate-y-1 transition-all duration-300 disabled:opacity-50 min-w-[200px] shadow-lg"
                            >
                                {isLoading ? "Saving..." : "Save Changes"}
                            </button>
                        </div>
                    )}
                </form>
            </div>

            {/* Change Password Section */}
            <ChangePasswordForm />
        </div>
    );
}
