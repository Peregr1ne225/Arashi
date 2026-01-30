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
        "block w-full h-[52px] px-6 rounded-2xl bg-gray-50 text-gray-900 border border-transparent focus:border-[#0e4d80] focus:outline-none focus:ring-2 focus:ring-[#0e4d80]/10 font-istok text-base font-bold transition-all disabled:opacity-60 disabled:cursor-not-allowed placeholder-gray-400 shadow-inner";
    const labelClasses =
        "block font-istok text-xs font-bold uppercase tracking-[0.15em] mb-2 text-gray-400 ml-2";

    return (
        <div className="space-y-16 animate-fadeIn">
            {/* Personal Info Section */}
            <div>
                <div className="flex justify-between items-end mb-8 border-b border-gray-100 pb-4">
                    <div>
                        <h3 className="font-koulen text-3xl text-[#0e4d80] leading-none">
                            Personal Information
                        </h3>
                        <p className="font-istok text-sm text-gray-400 uppercase tracking-widest mt-1">
                            Update your personal details
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

                {message && (
                    <div
                        className={`mb-6 p-4 rounded-2xl text-center font-istok uppercase tracking-wider text-sm font-bold ${message.type === "success" ? "bg-green-50 text-green-700 border border-green-100" : "bg-red-50 text-[#D2042D] border border-red-100"}`}
                    >
                        {message.text}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div>
                            <label className={labelClasses}>First Name</label>
                            <input
                                type="text"
                                name="first_name"
                                value={formData.first_name}
                                onChange={handleChange}
                                disabled={!isEditing}
                                className={inputClasses}
                            />
                        </div>

                        <div>
                            <label className={labelClasses}>Last Name</label>
                            <input
                                type="text"
                                name="last_name"
                                value={formData.last_name}
                                onChange={handleChange}
                                disabled={!isEditing}
                                className={inputClasses}
                            />
                        </div>

                        <div className="md:col-span-2">
                            <label className={labelClasses}>Email Address</label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                disabled={!isEditing}
                                className={inputClasses}
                            />
                        </div>

                        <div className="md:col-span-2">
                            <label className={labelClasses}>Phone Number</label>
                            <input
                                type="tel"
                                name="phone_number"
                                value={formData.phone_number}
                                onChange={handleChange}
                                disabled={!isEditing}
                                className={inputClasses}
                            />
                        </div>
                    </div>

                    {isEditing && (
                        <div className="mt-10 flex justify-center gap-4">
                            <button
                                type="button"
                                onClick={handleCancel}
                                className="px-8 h-12 rounded-full border-2 border-gray-100 text-gray-500 font-istok text-sm font-bold uppercase tracking-[0.2em] hover:bg-gray-50 hover:text-gray-700 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="px-8 h-12 rounded-full bg-[#0e4d80] text-white font-istok text-sm font-bold uppercase tracking-[0.2em] hover:bg-[#0b3d66] hover:shadow-lg hover:shadow-blue-900/20 hover:-translate-y-0.5 transition-all disabled:opacity-50 min-w-37"
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
