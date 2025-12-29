import Link from "next/link";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-neutral-950 text-white pt-16 pb-6 text-sm">
      <div className="container mx-auto px-6 flex flex-col items-center text-center">

        {/* Section 1: Shop Links */}
        <div className="w-full py-6 border-b border-neutral-900">
          <div className="flex flex-wrap justify-center gap-6">
            <Link href="#" className="hover:text-neutral-300 transition-colors duration-200 uppercase tracking-wider text-sm font-medium">New Arrivals</Link>
            <Link href="#" className="hover:text-neutral-300 transition-colors duration-200 uppercase tracking-wider text-sm font-medium">Best Sellers</Link>
            <Link href="#" className="hover:text-neutral-300 transition-colors duration-200 uppercase tracking-wider text-sm font-medium">Clothing</Link>
            <Link href="#" className="hover:text-neutral-300 transition-colors duration-200 uppercase tracking-wider text-sm font-medium">Accessories</Link>
          </div>
        </div>

        {/* Section 2: Brand & Payment */}
        <div className="w-full py-8 border-b border-neutral-900">
          <div className="flex flex-col items-center max-w-lg mx-auto space-y-6">
            {/* Brand */}
            <div className="space-y-3">
              <Link href="/" className="inline-block">
                <span className="text-3xl font-bold text-white tracking-tight">KawJaw</span>
              </Link>
              <p className="text-sm leading-relaxed text-neutral-300 max-w-sm mx-auto">
                Elevating your everyday style with premium essentials.
              </p>
              <div className="flex justify-center space-x-4 text-xs font-medium text-neutral-400 pt-2">
                <Link href="/about?tab=about" className="hover:text-white transition-colors">About Us</Link>
                <Link href="/about?tab=terms" className="hover:text-white transition-colors">Terms of Service</Link>
                <Link href="/about?tab=policy" className="hover:text-white transition-colors">Privacy Policy</Link>
              </div>
            </div>

            {/* Payment Methods */}
            <div className="flex flex-wrap gap-2 justify-center opacity-80 hover:opacity-100 transition-all duration-300">
              {[
                "PromptPay",
                "Stripe",
                "VISA",
                "Mastercard",
                "PayPal",
                "Amex",
                "Apple Pay"
              ].map((method) => (
                <div key={method} className="bg-white border border-gray-200 px-2.5 py-1 rounded-sm shadow-sm flex items-center">
                  <span className="text-[10px] font-bold text-gray-800 leading-none select-none">{method}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Section 3: Socials & Copyright */}
        <div className="w-full py-6">
          <div className="flex flex-col items-center space-y-4">
            {/* Social Icons */}
            <div className="flex space-x-8">
              <a href="#" className="text-white hover:text-neutral-300 transition-colors transform hover:scale-110" aria-label="TikTok">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor" stroke="none">
                  <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.65-1.58-1.02v6.154c0 1.01.03 2.05-.07 3.07-.15 1.57-.79 3.08-1.87 4.25-1.15 1.25-2.83 2-4.52 1.95-3.37-.1-6.07-2.88-6.19-6.26-.06-1.72.63-3.4 1.86-4.66 1.21-1.24 2.91-1.92 4.65-1.93.59.01 1.17.07 1.75.2v3.86c-.57-.29-1.24-.38-1.87-.24-1.24.27-2.19 1.4-2.14 2.66.04 1.26 1.05 2.36 2.31 2.45 1.25.09 2.37-.9 2.5-2.16.03-.89.01-1.78.01-2.67V.02z" />
                </svg>
              </a>
              <a href="#" className="text-white hover:text-neutral-300 transition-colors transform hover:scale-110" aria-label="Instagram">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                </svg>
              </a>
              <a href="#" className="text-white hover:text-neutral-300 transition-colors transform hover:scale-110" aria-label="Facebook">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor" stroke="none">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
              </a>
            </div>

            {/* Copyright */}
            <div className="text-xs text-neutral-400 font-medium">
              &copy; {currentYear} CREAM. All Rights Reserved.
            </div>
          </div>
        </div>

      </div>
    </footer>
  );
}
