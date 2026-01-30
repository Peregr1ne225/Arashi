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
        "block w-full h-[52px] px-6 rounded-2xl bg-gray-50 text-gray-900 border border-transparent focus:border-[#0e4d80] focus:outline-none focus:ring-2 focus:ring-[#0e4d80]/10 font-istok text-base font-bold transition-all disabled:opacity-60 disabled:cursor-not-allowed placeholder-gray-400 shadow-inner";
    const labelClasses =
        "block font-istok text-xs font-bold uppercase tracking-[0.15em] mb-2 text-gray-400 ml-2";

    return (
        <div className="mt-16 pt-16 border-t border-gray-100">
            <div className="flex justify-between items-end mb-8">
                <div>
                    <h3 className="font-koulen text-3xl text-[#0e4d80] leading-none">
                        Security
                    </h3>
                    <p className="font-istok text-sm text-gray-400 uppercase tracking-widest mt-1">
                        Update your password
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
                    className={`mb-6 p-4 rounded-2xl text-center font-istok uppercase tracking-wider text-sm font-bold ${message.type === "success"
                        ? "bg-green-50 text-green-700 border border-green-100"
                        : "bg-red-50 text-[#D2042D] border border-red-100"
                        }`}
                >
                    {message.text}
                </div>
            )}

            {isEditing ? (
                <form onSubmit={handleSubmit} className="space-y-6 w-full">
                    <div>
                        <label className={labelClasses}>Current Password</label>
                        <input
                            type="password"
                            name="old_password"
                            value={formData.old_password}
                            onChange={handleChange}
                            required
                            className={inputClasses}
                            placeholder="••••••••"
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className={labelClasses}>New Password</label>
                            <input
                                type="password"
                                name="new_password"
                                value={formData.new_password}
                                onChange={handleChange}
                                required
                                minLength={8}
                                className={inputClasses}
                                placeholder="••••••••"
                            />
                        </div>

                        <div>
                            <label className={labelClasses}>Confirm New Password</label>
                            <input
                                type="password"
                                name="confirm_new_password"
                                value={formData.confirm_new_password}
                                onChange={handleChange}
                                required
                                className={inputClasses}
                                placeholder="••••••••"
                            />
                        </div>
                    </div>

                    <div className="pt-6 flex justify-center gap-4">
                        <button
                            type="button"
                            onClick={handleCancel}
                            className="px-8 h-12 rounded-full border-2 border-gray-100 text-gray-500 font-istok text-sm font-bold uppercase tracking-[0.2em] hover:bg-gray-50 hover:text-gray-700 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full md:w-auto px-12 h-12 rounded-full bg-[#0e4d80] text-white font-istok text-sm font-bold uppercase tracking-[0.2em] hover:bg-[#0b3d66] hover:shadow-lg hover:shadow-blue-900/20 hover:-translate-y-0.5 active:scale-[0.98] transition-all duration-200 disabled:opacity-50 disabled:transform-none"
                        >
                            {isSubmitting ? "Updating..." : "Change Password"}
                        </button>
                    </div>
                </form>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 opacity-60">
                    <div className="md:col-span-2">
                        <label className={labelClasses}>Password</label>
                        <div
                            className={`${inputClasses} flex items-center justify-center cursor-default`}
                        >
                            ••••••••••••••••
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
