"use client";

import { useState, useEffect } from "react";
import Cookies from "js-cookie";
import { X } from "lucide-react";

export default function CookieConsent() {
    const [showConsent, setShowConsent] = useState(false);

    useEffect(() => {
        // Check if consent cookie exists
        const consent = Cookies.get("cookie_consent");
        if (!consent) {
            setShowConsent(true);
        }
    }, []);

    const handleAccept = () => {
        Cookies.set("cookie_consent", "true", { expires: 365, sameSite: "Strict" });
        setShowConsent(false);
    };

    const handleDecline = () => {
        Cookies.set("cookie_consent", "false", { expires: 365, sameSite: "Strict" });
        setShowConsent(false);
    };

    if (!showConsent) return null;

    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-gray-900 border-t border-gray-800 shadow-lg animate-in slide-in-from-bottom-2">
            <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-gray-300 text-sm">
                    <p>
                        We use cookies to enhance your experience. By continuing to visit this site you agree to our use of cookies.
                        <a href="/about?tab=policy" className="text-white hover:underline ml-1">
                            Learn more
                        </a>
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={handleDecline}
                        className="px-4 py-2 text-sm font-medium text-gray-300 bg-transparent hover:text-white transition-colors"
                    >
                        Decline
                    </button>
                    <button
                        onClick={handleAccept}
                        className="px-4 py-2 text-sm font-medium text-black bg-white rounded-md hover:bg-gray-100 transition-colors"
                    >
                        Accept All
                    </button>
                    <button
                        onClick={() => setShowConsent(false)}
                        className="ml-2 sm:ml-0 p-1 text-gray-400 hover:text-white"
                        aria-label="Close"
                    >
                        <X size={20} />
                    </button>
                </div>
            </div>
        </div>
    );
}
