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
        <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="px-4 py-5 border-b border-gray-200 sm:px-6 flex justify-between items-center">
                <div>
                    <h3 className="text-lg leading-6 font-medium text-gray-900">Address Book</h3>
                    <p className="mt-1 text-sm text-gray-500">Manage your shipping addresses.</p>
                </div>
                {!isEditing && (
                    <button
                        onClick={() => setIsEditing(true)}
                        className="px-3 py-1 bg-blue-50 text-blue-700 rounded-md text-sm font-medium hover:bg-blue-100"
                    >
                        Edit Address
                    </button>
                )}
            </div>

            <div className="p-6">
                {isEditing ? (
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Default Shipping Address</label>
                            <textarea
                                rows={4}
                                value={address}
                                onChange={(e) => setAddress(e.target.value)}
                                className="mt-1 block w-full shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm border-gray-300 rounded-md p-2 border"
                                placeholder="Enter your full address"
                            />
                        </div>
                        <div className="flex justify-end space-x-3">
                            <button
                                type="button"
                                onClick={() => setIsEditing(false)}
                                className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="bg-blue-600 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-blue-700"
                            >
                                Save Address
                            </button>
                        </div>
                    </form>
                ) : (
                    <div className="border rounded-md p-4 flex items-start space-x-4">
                        <MapPin className="w-6 h-6 text-gray-400 mt-1" />
                        <div>
                            <h4 className="text-sm font-medium text-gray-900">Default Address</h4>
                            <p className="mt-1 text-sm text-gray-500 whitespace-pre-wrap">
                                {user?.address || "No address saved."}
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
