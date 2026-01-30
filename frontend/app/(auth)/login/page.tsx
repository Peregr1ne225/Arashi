"use client";

import { Suspense } from "react";
import LoginForm from "@/app/components/auth/LoginForm";

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          Loading...
        </div>
      }
    >
      <div
        className="min-h-screen w-full flex items-center justify-center relative bg-[#FDFDFB]"
      >
        <div className="relative w-full max-w-lg min-h-[600px] bg-white rounded-4xl shadow-2xl flex flex-col items-center pb-10 border border-gray-100 mx-4">
          <LoginForm />
        </div>
      </div>
    </Suspense>
  );
}
