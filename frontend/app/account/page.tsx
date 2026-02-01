"use client";

import { useSearchParams } from "next/navigation";
import AuthGuard from "@/app/components/auth/AuthGuard";
import AccountLayout from "@/app/components/account/AccountLayout";
import AccountProfile from "@/app/components/account/AccountProfile";
import AccountOrders from "@/app/components/account/AccountOrders";
import AccountAddress from "@/app/components/account/AccountAddress";
import { Suspense } from "react";

function AccountContent() {
  const searchParams = useSearchParams();
  const tab = searchParams.get("tab") || "profile";

  return (
    <AccountLayout activeTab={tab}>
      {tab === "profile" && <AccountProfile />}
      {tab === "orders" && <AccountOrders />}
      {tab === "addresses" && <AccountAddress />}
    </AccountLayout>
  );
}

export default function AccountPage() {
  return (
    <AuthGuard>
      <Suspense fallback={<div className="min-h-screen bg-[#FDFDFB] flex items-center justify-center"><div className="h-8 w-8 border-4 border-gray-200 border-t-black rounded-full animate-spin"></div></div>}>
        <AccountContent />
      </Suspense>
    </AuthGuard>
  );
}

