"use client";

import RegisterForm from "@/app/components/auth/RegisterForm";

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-background text-white">
      <div className="flex flex-col lg:flex-row min-h-screen">
        {/* Left Panel - Desktop only */}
        <div className="hidden lg:flex lg:w-1/2 bg-neutral-900 items-center justify-center relative overflow-hidden border-r-4 border-accent">
          {/* Background Texture */}
          <div className="absolute inset-0 bg-[url('/grid-pattern.png')] opacity-5"></div>
          <div className="absolute inset-0 bg-black/50"></div>

          {/* Content */}
          <div className="relative z-10 text-center px-12 transform -skew-x-6">
            <h1 className="text-8xl font-black uppercase italic text-white mb-6 tracking-tighter drop-shadow-xl">
              Join <br /><span className="text-transparent text-outline">The Team</span>
            </h1>
            <p className="text-2xl text-accent font-bold uppercase tracking-widest mb-12 border-b-2 border-accent inline-block pb-2">
              Unlock Exclusive Gear
            </p>
            <div className="space-y-4 text-gray-300 font-bold uppercase tracking-wide text-left mx-auto max-w-md">
              <p className="flex items-center"><span className="text-accent mr-4 text-xl">⚡</span> Early Access to Drops</p>
              <p className="flex items-center"><span className="text-accent mr-4 text-xl">⚡</span> Member-Only Discounts</p>
              <p className="flex items-center"><span className="text-accent mr-4 text-xl">⚡</span> Global Community</p>
            </div>
          </div>
        </div>

        {/* Right Panel - Form */}
        <div className="w-full lg:w-1/2 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12 bg-black bg-[url('/grid-pattern.png')] bg-fixed relative">
          <div className="absolute inset-0 bg-black/80"></div>
          <div className="w-full max-w-md space-y-8 relative z-10 bg-neutral-900/90 p-8 border border-white/10 skew-box backdrop-blur-sm">
            {/* Header */}
            <div className="text-center mb-8">
              <h2 className="text-4xl lg:text-5xl font-black uppercase italic tracking-tighter text-white mb-2">
                Create <span className="text-accent">Account</span>
              </h2>
              <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">
                Start your journey
              </p>
            </div>

            {/* Register Form */}
            <RegisterForm />
          </div>
        </div>
      </div>
    </div>
  );
}
