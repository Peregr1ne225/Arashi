"use client";

import { useState } from "react";
import { useAuth } from "@/app/hooks/useAuth";
import { useRouter } from "next/navigation";

interface LoginFormProps {
    onSuccess?: () => void;
    redirectTo?: string;
    onRegisterClick?: () => void; // Optional handler for modal
}

export default function LoginForm({
    onSuccess,
    redirectTo,
    onRegisterClick,
}: LoginFormProps) {
    const { login } = useAuth();
    const router = useRouter();

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
            await login({ username, password }, redirectTo);

            if (onSuccess) {
                onSuccess();
            }
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : "Failed to login");
        } finally {
            setLoading(false);
        }
    };

    const handleRegisterClick = () => {
        if (onRegisterClick) {
            onRegisterClick();
        } else {
            router.push("/register");
        }
    };

    return (
        <div className="w-full flex flex-col items-center">
            {/* Shared Header */}
            <div className="text-center mb-12 px-8">
                <h1 className="font-mrs-sheppards text-[40px] md:text-[56px] leading-none text-[#0e4d80] mb-3">
                    Arashi
                </h1>
                <p className="font-istok text-sm md:text-base text-gray-500 max-w-md mx-auto">
                    Shop your styles, save top picks to your wishlist, track those orders
                    & train with us.
                </p>
            </div>

            <form
                className="w-full space-y-6 flex flex-col items-center px-4"
                onSubmit={handleSubmit}
            >
                <div className="space-y-4 w-full max-w-sm">
                    <div className="relative group">
                        <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                            <span className="text-gray-400 font-istok text-xs font-bold uppercase tracking-wider">User</span>
                        </div>
                        <input
                            id="username"
                            name="username"
                            type="text"
                            required
                            className="block w-full h-14 pl-16 pr-6 rounded-2xl bg-gray-50 border-2 border-transparent focus:border-[#0e4d80]/20 focus:bg-white text-base font-istok font-bold text-[#0e4d80] focus:outline-none placeholder-gray-300 transition-all tracking-wide shadow-inner"
                            placeholder="Username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                        />
                    </div>

                    <div className="relative group">
                        <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                            <span className="text-gray-400 font-istok text-xs font-bold uppercase tracking-wider">Pass</span>
                        </div>
                        <input
                            id="password"
                            name="password"
                            type="password"
                            required
                            className="block w-full h-14 pl-16 pr-6 rounded-2xl bg-gray-50 border-2 border-transparent focus:border-[#0e4d80]/20 focus:bg-white text-base font-istok font-bold text-[#0e4d80] focus:outline-none placeholder-gray-300 transition-all tracking-wide shadow-inner"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>
                </div>

                {error && (
                    <div className="rounded-2xl bg-red-50 p-4 w-full max-w-sm border border-red-100">
                        <div className="flex">
                            <div className="text-xs font-bold text-red-500 uppercase tracking-wider">{error}</div>
                        </div>
                    </div>
                )}

                <div className="mt-8">
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full md:w-64 h-14 rounded-full bg-[#0e4d80] text-white font-istok text-sm font-bold uppercase tracking-[0.2em] hover:bg-[#b90326] hover:shadow-lg hover:shadow-red-900/20 hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                    >
                        {loading ? "Logging in..." : "Sign In"}
                    </button>
                </div>
            </form>

            <div className="mt-8 text-center">
                <p className="font-istok text-xs text-gray-400 uppercase tracking-wider">
                    Don&apos;t have an account?&nbsp;
                    <button
                        onClick={handleRegisterClick}
                        className="font-bold text-[#0e4d80] hover:underline decoration-2 underline-offset-4 cursor-pointer hover:text-[#0b3d66] transition-colors ml-1"
                    >
                        Sign up
                    </button>
                </p>
            </div>
        </div>
    );
}
