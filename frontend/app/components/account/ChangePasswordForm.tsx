"use client";

import { useState } from "react";
import { api } from "@/app/lib/api";

export default function ChangePasswordForm() {
    const [formData, setFormData] = useState({
        old_password: "",
        new_password: "",
        confirm_new_password: "",
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        if (message) setMessage(null);
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
            setFormData({ old_password: "", new_password: "", confirm_new_password: "" });
        } catch (error: any) {
            // Backend might return validation errors (e.g., wrong old password)
            const errorMsg = error.response?.data?.old_password?.[0] ||
                error.response?.data?.confirm_new_password?.[0] ||
                "Failed to update password. Please try again.";
            setMessage({ type: "error", text: errorMsg });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="bg-white shadow rounded-lg overflow-hidden mt-8">
            <div className="px-4 py-5 border-b border-gray-200 sm:px-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900">Security</h3>
                <p className="mt-1 text-sm text-gray-500">Update your password.</p>
            </div>

            <div className="p-6">
                {message && (
                    <div className={`mb-4 p-3 rounded-md text-sm ${message.type === "success" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
                        }`}>
                        {message.text}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Current Password</label>
                        <input
                            type="password"
                            name="old_password"
                            value={formData.old_password}
                            onChange={handleChange}
                            required
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">New Password</label>
                        <input
                            type="password"
                            name="new_password"
                            value={formData.new_password}
                            onChange={handleChange}
                            required
                            minLength={8}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Confirm New Password</label>
                        <input
                            type="password"
                            name="confirm_new_password"
                            value={formData.confirm_new_password}
                            onChange={handleChange}
                            required
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        />
                    </div>

                    <div>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-300"
                        >
                            {isSubmitting ? "Updating..." : "Change Password"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
