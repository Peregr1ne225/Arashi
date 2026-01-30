"use client";

import nextDynamic from "next/dynamic";

// Dynamic imports for non-critical UI components (reduces initial bundle)
// Moving these to a client component resolves the "ssr: false is not allowed in Server Components" error
const CartSheet = nextDynamic(() => import("../cart/CartSheet"), {
    ssr: false,
});

const CookieConsent = nextDynamic(() => import("../common/CookieConsent"), {
    ssr: false,
});

export default function ClientLayout() {
    return (
        <>
            <CartSheet />
            <CookieConsent />
        </>
    );
}
