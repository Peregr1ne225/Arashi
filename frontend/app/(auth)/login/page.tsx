"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import LoginForm from "@/app/components/auth/LoginForm";

function LoginContent() {
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get("redirect") || "/";

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 bg-background relative overflow-hidden">
      {/* Background Texture */}
      <div className="absolute inset-0 bg-[url('/grid-pattern.png')] opacity-10 pointer-events-none"></div>
      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black pointer-events-none"></div>

      <div className="w-full max-w-md space-y-8 relative z-10">
        <div className="text-center">
          <h2 className="text-5xl font-black uppercase italic tracking-tighter text-white mb-2 drop-shadow-lg">
            Member <span className="text-accent text-outline">Login</span>
          </h2>
          <p className="text-gray-400 font-bold uppercase tracking-widest text-sm">
            Access your locker
          </p>
        </div>

        <div className="bg-neutral-900/80 backdrop-blur-md p-8 border border-white/10 skew-box">
          <LoginForm redirectTo={redirectUrl} />
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <LoginContent />
    </Suspense>
  );
}
