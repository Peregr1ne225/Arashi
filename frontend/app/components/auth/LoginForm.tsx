"use client";

import { useState } from "react";
import { useAuth } from "@/app/hooks/useAuth";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface LoginFormProps {
    onSuccess?: () => void;
    redirectTo?: string;
    onRegisterClick?: () => void; // Optional handler for modal
}

export default function LoginForm({ onSuccess, redirectTo, onRegisterClick }: LoginFormProps) {
    const { login } = useAuth();
    const router = useRouter(); // Use router for manual navigation if redirectTo is manual

    // State
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);
        try {
            // Login function in AuthContext handles redirection if a URL is typically passed,
            // but for Modals we might want to stay put or handle it differently.
            // Our plan says: "Callback when login is successful (e.g., to close modal)."

            // The existing login() function accepts (credentials, redirectUrl).
            // If we are in a Modal on the current page, we might pass current path or nothing.

            await login({ username, password }, redirectTo);

            // If we are here, login success (otherwise it throws)
            if (onSuccess) {
                onSuccess();
            }
        } catch (err: any) {
            setError(err.message || "Failed to login");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full">
            <form className="space-y-6" onSubmit={handleSubmit}>
                <div className="space-y-4">
                    <div>
                        <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                            Username
                        </label>
                        <div className="mt-1">
                            <input
                                id="username"
                                name="username"
                                type="text"
                                required
                                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-black focus:ring-black sm:text-sm px-3 py-2 border"
                                placeholder="Enter your username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                            />
                        </div>
                    </div>

                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                            Password
                        </label>
                        <div className="mt-1">
                            <input
                                id="password"
                                name="password"
                                type="password"
                                required
                                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-black focus:ring-black sm:text-sm px-3 py-2 border"
                                placeholder="Enter your password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                    </div>
                </div>

                {error && (
                    <div className="rounded-md bg-red-50 p-4">
                        <div className="flex">
                            <div className="text-sm text-red-700">{error}</div>
                        </div>
                    </div>
                )}

                <div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="flex w-full justify-center rounded-md border border-transparent bg-black py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? "Signing in..." : "Sign in"}
                    </button>
                </div>
            </form>

            <div className="mt-6">
                <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-300" />
                    </div>
                    <div className="relative flex justify-center text-sm">
                        <span className="bg-white px-2 text-gray-500">Or</span>
                    </div>
                </div>

                <div className="mt-6 text-center text-sm">
                    <span className="text-gray-600">Don't have an account? </span>
                    {onRegisterClick ? (
                        <button
                            onClick={onRegisterClick}
                            className="font-medium text-black hover:text-gray-800 underline"
                        >
                            Register here
                        </button>
                    ) : (
                        <Link
                            href="/register"
                            className="font-medium text-black hover:text-gray-800 underline"
                        >
                            Register here
                        </Link>
                    )}
                </div>
            </div>
        </div>
    );
}
