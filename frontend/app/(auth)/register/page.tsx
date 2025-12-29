"use client";

import RegisterForm from "@/app/components/auth/RegisterForm";

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="flex flex-col lg:flex-row min-h-screen">
        {/* Left Panel - Desktop only */}
        <div className="hidden lg:flex lg:w-1/2 bg-linear-to-br from-gray-900 via-gray-800 to-black items-center justify-center relative overflow-hidden">
          {/* Decorative elements */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl" />
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full translate-x-1/2 translate-y-1/2 blur-3xl" />
          </div>

          {/* Content */}
          <div className="relative z-10 text-center px-12">
            <h1 className="text-5xl font-bold text-white mb-4 tracking-tight">
              Welcome
            </h1>
            <p className="text-xl text-gray-300 font-light">
              Join us and discover the perfect style for you
            </p>
            <div className="mt-8 space-y-2 text-gray-400">
              <p className="text-sm">✓ Premium quality products</p>
              <p className="text-sm">✓ Exclusive collections</p>
              <p className="text-sm">✓ Fast & secure checkout</p>
            </div>
          </div>
        </div>

        {/* Right Panel - Form */}
        <div className="w-full lg:w-1/2 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12 bg-white">
          <div className="w-full max-w-md space-y-8">
            {/* Mobile Header - Only visible on mobile/tablet */}
            <div className="lg:hidden text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Create Account
              </h1>
              <p className="text-gray-600">Join us and start shopping today</p>
            </div>

            {/* Desktop Header - Only visible on desktop */}
            <div className="hidden lg:block mb-8">
              <h2 className="text-4xl font-bold text-gray-900 tracking-tight">
                Create Account
              </h2>
              <p className="mt-2 text-gray-600">
                Enter your details to get started
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
