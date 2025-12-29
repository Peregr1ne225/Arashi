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
        <div className="bg-neutral-900 border border-white/10 skew-box overflow-hidden mt-8">
            <div className="px-6 py-5 border-b border-white/10 bg-black/20">
                <h3 className="text-2xl font-black uppercase italic tracking-tighter text-white">Locker Security</h3>
                <p className="mt-1 text-xs font-bold uppercase tracking-widest text-gray-500">Secure your account access.</p>
            </div>

            <div className="px-6 py-8">
                {message && (
                    <div className={`mb-6 p-4 skew-box text-sm font-bold uppercase tracking-wider ${message.type === "success" ? "bg-accent/10 text-accent border border-accent/20" : "bg-red-900/20 text-red-500 border border-red-900/50"
                        }`}>
                        {message.text}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6 max-w-lg">
                    <div>
                        <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">Current Password</label>
                        <input
                            type="password"
                            name="old_password"
                            value={formData.old_password}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-3 bg-black border border-white/20 rounded-none text-white font-bold tracking-wide focus:outline-none focus:border-accent skew-box transition-colors"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">New Password (8+ CHARS)</label>
                        <input
                            type="password"
                            name="new_password"
                            value={formData.new_password}
                            onChange={handleChange}
                            required
                            minLength={8}
                            className="w-full px-4 py-3 bg-black border border-white/20 rounded-none text-white font-bold tracking-wide focus:outline-none focus:border-accent skew-box transition-colors"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">Confirm New Password</label>
                        <input
                            type="password"
                            name="confirm_new_password"
                            value={formData.confirm_new_password}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-3 bg-black border border-white/20 rounded-none text-white font-bold tracking-wide focus:outline-none focus:border-accent skew-box transition-colors"
                        />
                    </div>

                    <div className="pt-4">
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="btn-primary w-full py-3 text-lg font-black uppercase italic tracking-wider skew-box"
                        >
                            {isSubmitting ? "Updating..." : "Update Security //"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
