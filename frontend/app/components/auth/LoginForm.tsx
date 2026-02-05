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
            <div className="text-center mb-10">
                <h1 className="font-koulen text-[48px] md:text-[64px] leading-tight text-[#0e4d80] mb-2 uppercase tracking-tighter">
                    Login
                </h1>
                <p className="font-body text-sm text-gray-400 max-w-xs mx-auto">
                    Glad to have you back. Enter your credentials to access your squad profile.
                </p>
            </div>

            <form
                className="w-full space-y-6 flex flex-col items-center px-4"
                onSubmit={handleSubmit}
            >
                <div className="relative group">
                    <div className="absolute h-14 left-5 flex items-center pointer-events-none">
                        <span className="text-gray-300 font-koulen text-xs uppercase tracking-widest">User</span>
                    </div>
                    <input
                        id="username"
                        name="username"
                        type="text"
                        required
                        className="block w-full h-14 pl-16 pr-6 rounded-full bg-gray-50 border border-gray-100 focus:border-[#0e4d80] focus:bg-white text-base font-body font-normal text-black focus:outline-none placeholder-gray-300 transition-all shadow-sm"
                        placeholder="Username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                    />
                </div>

                <div className="relative group">
                    <div className="absolute h-14 left-5 flex items-center pointer-events-none">
                        <span className="text-gray-300 font-koulen text-xs uppercase tracking-widest">Pass</span>
                    </div>
                    <input
                        id="password"
                        name="password"
                        type="password"
                        required
                        className="block w-full h-14 pl-16 pr-6 rounded-full bg-gray-50 border border-gray-100 focus:border-[#0e4d80] focus:bg-white text-base font-body font-normal text-black focus:outline-none placeholder-gray-300 transition-all shadow-sm"
                        placeholder="********"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
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
                        className="w-full md:w-64 h-14 rounded-full bg-[#0e4d80] text-white font-koulen text-[18px] uppercase tracking-widest hover:bg-[#0a3a60] hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center shadow-lg"
                    >
                        {loading ? "Logging in..." : "Continue"}
                    </button>
                </div>
            </form>

            <div className="mt-8 text-center">
                <p className="font-body text-xs text-gray-400 uppercase tracking-widest">
                    Don&apos;t have an account?&nbsp;
                    <button
                        onClick={handleRegisterClick}
                        className="font-bold text-[#0e4d80] hover:text-[#0a3a60] transition-colors ml-1 underline decoration-1 underline-offset-4 cursor-pointer"
                    >
                        Register
                    </button>
                </p>
            </div>
        </div>
    );
}
