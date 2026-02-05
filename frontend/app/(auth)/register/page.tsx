"use client";

import RegisterForm from "@/app/components/auth/RegisterForm";

export default function RegisterPage() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center relative pb-10 bg-[#FDFDFB]">
      {/* Split Card Container */}
      <div className="relative w-full max-w-6xl min-h-[800px] bg-white rounded-4xl shadow-2xl flex flex-col lg:flex-row overflow-hidden border border-gray-100 mx-4">
        {/* Left Panel - Brand Side */}
        <div className="hidden lg:flex lg:w-1/2 bg-[#0e4d80] items-center justify-center relative p-12 overflow-hidden">
          {/* Decorative elements */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl" />
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full translate-x-1/2 translate-y-1/2 blur-3xl" />
          </div>

          {/* Content */}
          <div className="relative z-10 text-center">
            <div className="mb-8 flex justify-center">
              <div className="w-24 h-24 text-white">
                <svg viewBox="0 0 595.28 401.65" xmlns="http://www.w3.org/2000/svg" className="w-full h-full fill-current">
                  <path d="M117.07,103.05s227.92,44.7,361.13-60.98c0,0-1.18,88.21-193,142.67,0,0,98.67,3.55,153.53-41.05,0,0-36.7,125.51-136.16,118.01,0,0,6.71,56.83,33.15,97.88,0,0-69.86-82.49-89.2-133.01,0,0,54.07,9.47,82.88-14.21,0,0-70.25,9.47-128.66-30,0,0,87.53,5.47,154.71-50.52,0,0-143.27,37.89-238.38-28.81Z" />
                </svg>
              </div>
            </div>
            <h1 className="text-6xl font-koulen text-white mb-4 tracking-wider uppercase">
              Join Us
            </h1>
            <p className="text-xl text-blue-100 font-body font-light mb-12 max-w-sm mx-auto opacity-80">
              Create your account and start your high-speed journey with Arashi.
            </p>
            <div className="space-y-4 text-white text-left inline-block">
              <p className="text-sm font-body font-bold flex items-center gap-3 bg-white/10 px-6 py-3 rounded-full backdrop-blur-sm">
                <span>PREMIUM GEAR ACCESS</span>
              </p>
              <p className="text-sm font-body font-bold flex items-center gap-3 bg-white/10 px-6 py-3 rounded-full backdrop-blur-sm">
                <span>COMMUNITY REWARDS</span>
              </p>
              <p className="text-sm font-body font-bold flex items-center gap-3 bg-white/10 px-6 py-3 rounded-full backdrop-blur-sm">
                <span>FAST SHIPPING</span>
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
