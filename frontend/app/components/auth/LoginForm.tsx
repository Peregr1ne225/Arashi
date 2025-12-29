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
                        <label htmlFor="username" className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-1">
                            Username
                        </label>
                        <div className="mt-1">
                            <input
                                id="username"
                                name="username"
                                type="text"
                                required
                                className="block w-full bg-black/50 border-2 border-transparent focus:border-accent text-white placeholder-gray-600 px-4 py-3 font-bold uppercase tracking-wider outline-none transition-all duration-300 skew-box"
                                placeholder="USERNAME"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                            />
                        </div>
                    </div>

                    <div>
                        <label htmlFor="password" className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-1">
                            Password
                        </label>
                        <div className="mt-1">
                            <input
                                id="password"
                                name="password"
                                type="password"
                                required
                                className="block w-full bg-black/50 border-2 border-transparent focus:border-accent text-white placeholder-gray-600 px-4 py-3 font-bold uppercase tracking-wider outline-none transition-all duration-300 skew-box"
                                placeholder="PASSWORD"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                    </div>
                </div>

                {error && (
                    <div className="bg-red-900/50 border-l-4 border-red-500 p-4 backdrop-blur-sm">
                        <div className="flex">
                            <div className="text-sm text-red-200 font-bold uppercase tracking-wide">{error}</div>
                        </div>
                    </div>
                )}

                <div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="btn-primary w-full py-4 text-xl"
                    >
                        {loading ? "AUTHENTICATING..." : "SIGN IN //"}
                    </button>
                </div>
            </form>

            <div className="mt-8">
                <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-white/10" />
                    </div>
                    <div className="relative flex justify-center text-sm">
                        <span className="bg-neutral-900 px-2 text-gray-500 font-bold uppercase tracking-widest text-xs">Or</span>
                    </div>
                </div>

                <div className="mt-6 text-center text-sm">
                    <span className="text-gray-400 uppercase tracking-wide font-medium">New Recruit? </span>
                    {onRegisterClick ? (
                        <button
                            onClick={onRegisterClick}
                            className="font-bold text-accent hover:text-white uppercase tracking-wider transition-colors ml-2"
                        >
                            Enlist Here
                        </button>
                    ) : (
                        <Link
                            href="/register"
                            className="font-bold text-accent hover:text-white uppercase tracking-wider transition-colors ml-2"
                        >
                            Enlist Here
                        </Link>
                    )}
                </div>
            </div>
        </div>
    );
}
