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
        <div className="space-y-6">
            <div className="bg-white shadow rounded-lg overflow-hidden">
                <div className="px-4 py-5 border-b border-gray-200 sm:px-6 flex justify-between items-center">
                    <div>
                        <h3 className="text-lg leading-6 font-medium text-gray-900">Personal Information</h3>
                        <p className="mt-1 text-sm text-gray-500">Update your personal details.</p>
                    </div>
                    {!isEditing && (
                        <button
                            onClick={() => setIsEditing(true)}
                            className="text-sm font-medium text-blue-600 hover:text-blue-500"
                        >
                            Edit
                        </button>
                    )}
                </div>

                <div className="px-4 py-5 sm:p-6">
                    {message && (
                        <div className={`mb-4 p-3 rounded-md text-sm ${message.type === "success" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
                            {message.text}
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>
                        <div className="grid grid-cols-6 gap-6">
                            <div className="col-span-6 sm:col-span-3">
                                <label className="block text-sm font-medium text-gray-700">First Name</label>
                                <input
                                    type="text"
                                    name="first_name"
                                    value={formData.first_name}
                                    onChange={handleChange}
                                    disabled={!isEditing}
                                    className={`mt-1 block w-full rounded-md shadow-sm sm:text-sm ${isEditing
                                            ? "border-gray-300 focus:ring-blue-500 focus:border-blue-500 border p-2"
                                            : "border-transparent bg-transparent p-0 text-gray-900"
                                        }`}
                                />
                            </div>

                            <div className="col-span-6 sm:col-span-3">
                                <label className="block text-sm font-medium text-gray-700">Last Name</label>
                                <input
                                    type="text"
                                    name="last_name"
                                    value={formData.last_name}
                                    onChange={handleChange}
                                    disabled={!isEditing}
                                    className={`mt-1 block w-full rounded-md shadow-sm sm:text-sm ${isEditing
                                            ? "border-gray-300 focus:ring-blue-500 focus:border-blue-500 border p-2"
                                            : "border-transparent bg-transparent p-0 text-gray-900"
                                        }`}
                                />
                            </div>

                            <div className="col-span-6 sm:col-span-4">
                                <label className="block text-sm font-medium text-gray-700">Email Address</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    disabled
                                    className="mt-1 block w-full rounded-md border-transparent bg-gray-50 text-gray-500 sm:text-sm p-2 cursor-not-allowed"
                                />
                                <p className="mt-1 text-xs text-gray-400">Email cannot be changed.</p>
                            </div>

                            <div className="col-span-6 sm:col-span-3">
                                <label className="block text-sm font-medium text-gray-700">Phone Number</label>
                                <input
                                    type="tel"
                                    name="phone_number"
                                    value={formData.phone_number}
                                    onChange={handleChange}
                                    disabled={!isEditing}
                                    className={`mt-1 block w-full rounded-md shadow-sm sm:text-sm ${isEditing
                                            ? "border-gray-300 focus:ring-blue-500 focus:border-blue-500 border p-2"
                                            : "border-transparent bg-transparent p-0 text-gray-900"
                                        }`}
                                />
                            </div>
                        </div>

                        {isEditing && (
                            <div className="mt-6 flex justify-end space-x-3">
                                <button
                                    type="button"
                                    onClick={handleCancel}
                                    className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="bg-blue-600 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-400"
                                >
                                    {isLoading ? "Saving..." : "Save Changes"}
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
