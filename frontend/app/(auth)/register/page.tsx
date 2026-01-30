"use client";

import RegisterForm from "@/app/components/auth/RegisterForm";

export default function RegisterPage() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center relative pb-10 bg-[#FDFDFB]">
      {/* Split Card Container */}
      <div className="relative w-full max-w-6xl min-h-[800px] bg-white rounded-4xl shadow-2xl flex flex-col lg:flex-row overflow-hidden border border-gray-100 mx-4">
        {/* Left Panel - Original Content with Pastel Sport Twist */}
        <div className="hidden lg:flex lg:w-1/2 bg-[#0e4d80] items-center justify-center relative p-12 overflow-hidden">
          {/* Decorative elements */}
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl" />
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#ff6b6b] rounded-full translate-x-1/2 translate-y-1/2 blur-3xl" />
          </div>

          {/* Content */}
          <div className="relative z-10 text-center">
            <h1 className="text-6xl font-koulen text-white mb-4 tracking-wider uppercase">
              Welcome
            </h1>
            <p className="text-xl text-blue-100 font-istok font-light mb-12 max-w-sm mx-auto">
              Join the squad. Discover your perfect fit and train like a pro.
            </p>
            <div className="space-y-6 text-white text-left inline-block">
              <p className="text-lg font-istok font-bold flex items-center gap-3 bg-white/10 px-6 py-3 rounded-full backdrop-blur-sm">
                <span className="text-[#ff6b6b]">✓</span> PREMIUM QUALITY
              </p>
              <p className="text-lg font-istok font-bold flex items-center gap-3 bg-white/10 px-6 py-3 rounded-full backdrop-blur-sm">
                <span className="text-[#ff6b6b]">✓</span> EXCLUSIVE DROPS
              </p>
              <p className="text-lg font-istok font-bold flex items-center gap-3 bg-white/10 px-6 py-3 rounded-full backdrop-blur-sm">
                <span className="text-[#ff6b6b]">✓</span> SECURE CHECKOUT
              </p>
            </div>
          </div>
        </div>

        {/* Right Panel - Register Form */}
        <div className="w-full lg:w-1/2 flex items-center justify-center py-12 px-8 bg-white">
          <RegisterForm />
        </div>
      </div>
    </div>
  );
}
