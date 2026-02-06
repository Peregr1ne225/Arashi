"use client";

import { useState } from "react";
import { api } from "@/app/lib/api";

export default function ChangePasswordForm() {
    const [formData, setFormData] = useState({
        old_password: "",
        new_password: "",
        confirm_new_password: "",
    });
    const [isEditing, setIsEditing] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [message, setMessage] = useState<{
        type: "success" | "error";
        text: string;
    } | null>(null);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        if (message) setMessage(null);
    };

    const handleCancel = () => {
        setFormData({
            old_password: "",
            new_password: "",
            confirm_new_password: "",
        });
        setIsEditing(false);
        setMessage(null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (formData.new_password !== formData.confirm_new_password) {
            setMessage({ type: "error", text: "New passwords do not match." });
            return;
        }

        setIsSubmitting(true);
        try {
            await api.post("/auth/change-password/", formData);
            setMessage({ type: "success", text: "Password updated successfully." });
            setFormData({
                old_password: "",
                new_password: "",
                confirm_new_password: "",
            });
            setIsEditing(false);
        } catch (error: unknown) {
            // Backend might return validation errors (e.g., wrong old password)
            let errorMsg = "Failed to update password. Please try again.";

            if (
                error &&
                typeof error === "object" &&
                "response" in error &&
                error.response &&
                typeof error.response === "object" &&
                "data" in error.response &&
                error.response.data &&
                typeof error.response.data === "object"
            ) {
                const data = error.response.data as Record<string, unknown>;
                const oldPasswordErrors = data.old_password;
                const confirmNewPasswordErrors = data.confirm_new_password;

                if (
                    Array.isArray(oldPasswordErrors) &&
                    typeof oldPasswordErrors[0] === "string"
                ) {
                    errorMsg = oldPasswordErrors[0];
                } else if (
                    Array.isArray(confirmNewPasswordErrors) &&
                    typeof confirmNewPasswordErrors[0] === "string"
                ) {
                    errorMsg = confirmNewPasswordErrors[0];
                }
            }

            setMessage({ type: "error", text: errorMsg });
        } finally {
            setIsSubmitting(false);
        }
    };

    const inputClasses =
        "block w-full h-[56px] px-8 rounded-full bg-gray-50 text-gray-900 border border-gray-100 focus:border-[#0e4d80] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#0e4d80]/5 font-body text-base font-normal transition-all disabled:opacity-60 disabled:cursor-not-allowed placeholder-gray-300 shadow-sm";
    const labelClasses =
        "block font-koulen text-[11px] mb-2 text-gray-400 uppercase tracking-widest px-6";

    return (
        <div className="pt-4 border-t border-gray-100">
            <div className="flex justify-between items-end mb-10">
                <div>
                    <h3 className="font-koulen text-[40px] text-[#0e4d80] leading-[0.85] uppercase tracking-tighter">
                        Security <span className="text-gray-300">Settings.</span>
                    </h3>
                    <p className="font-body text-xs text-gray-400 uppercase tracking-widest mt-3 font-bold">
                        Update your password
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
                    className={`mb-8 p-5 rounded-3xl text-center font-koulen uppercase tracking-widest text-sm ${message.type === "success"
                        ? "bg-green-50 text-green-700 border border-green-100"
                        : "bg-blue-50 text-[#0e4d80] border border-blue-100"
                        }`}
                >
                    {message.text}
                </div>
            )}

            {isEditing ? (
                <form onSubmit={handleSubmit} className="space-y-8 w-full">
                    <div className="relative group">
                        <label className={labelClasses}>Current Password</label>
                        <input
                            type="password"
                            name="old_password"
                            value={formData.old_password}
                            onChange={handleChange}
                            required
                            disabled={isSubmitting}
                            className={inputClasses}
                            placeholder="Current Password"
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="relative group">
                            <label className={labelClasses}>New Password</label>
                            <input
                                type="password"
                                name="new_password"
                                value={formData.new_password}
                                onChange={handleChange}
                                required
                                minLength={8}
                                disabled={isSubmitting}
                                className={inputClasses}
                                placeholder="New Password"
                            />
                        </div>

                        <div className="relative group">
                            <label className={labelClasses}>Confirm New Password</label>
                            <input
                                type="password"
                                name="confirm_new_password"
                                value={formData.confirm_new_password}
                                onChange={handleChange}
                                required
                                disabled={isSubmitting}
                                className={inputClasses}
                                placeholder="Confirm New Password"
                            />
                        </div>
                    </div>

                    <div className="pt-8 flex justify-center gap-4">
                        <button
                            type="button"
                            onClick={handleCancel}
                            className="px-10 h-14 rounded-full border-2 border-gray-100 text-gray-400 font-koulen text-lg uppercase tracking-widest hover:bg-gray-50 hover:text-gray-600 transition-all duration-300"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full md:w-auto px-12 h-14 rounded-full bg-[#0e4d80] text-white font-koulen text-lg uppercase tracking-widest hover:bg-[#0b3d66] hover:shadow-2xl hover:shadow-blue-900/30 hover:-translate-y-1 transition-all duration-300 disabled:opacity-50 shadow-lg"
                        >
                            {isSubmitting ? "Updating..." : "Change Password"}
                        </button>
                    </div>
                </form>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 opacity-40">
                    <div className="md:col-span-2 relative group">
                        <label className={labelClasses}>Password</label>
                        <div
                            className={`${inputClasses} flex items-center justify-center cursor-not-allowed tracking-widest`}
                        >
                            ••••••••••••••••
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
