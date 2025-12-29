import Link from "next/link";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-background border-t-8 border-accent text-white pt-20 pb-12 overflow-hidden relative">
      <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-accent to-transparent transform -skew-x-12"></div>

      <div className="container mx-auto px-6 flex flex-col items-center text-center relative z-10">

        {/* Section 1: Shop Links */}
        <div className="w-full pb-12 border-b border-white/20 mb-12">
          <div className="flex flex-wrap justify-center gap-12">
            <Link href="/sale" className="text-xl font-black uppercase italic tracking-tighter hover:text-accent transition-all duration-300 transform hover:-skew-x-12">Sale</Link>
            <Link href="/new" className="text-xl font-black uppercase italic tracking-tighter hover:text-accent transition-all duration-300 transform hover:-skew-x-12">New Arrivals</Link>
            <Link href="/products?sort=bestsellers" className="text-xl font-black uppercase italic tracking-tighter hover:text-accent transition-all duration-300 transform hover:-skew-x-12">Best Sellers</Link>
            <Link href="/products" className="text-xl font-black uppercase italic tracking-tighter hover:text-accent transition-all duration-300 transform hover:-skew-x-12">All Products</Link>
          </div>
        </div>

        {/* Section 2: Brand & Payment */}
        <div className="w-full pb-12 border-b border-white/20 mb-12">
          <div className="flex flex-col items-center max-w-4xl mx-auto space-y-8">
            {/* Brand */}
            <div className="space-y-4">
              <Link href="/" className="inline-block transform skew-x-[-10deg] border-4 border-white p-4 hover:border-accent hover:text-accent transition-colors duration-300">
                <span className="text-6xl font-black uppercase italic tracking-tighter">Ara<span className="text-accent">shi</span></span>
              </Link>
              <p className="text-lg text-gray-400 max-w-lg mx-auto font-medium uppercase tracking-wide">
                Elevating your everyday style with premium essentials.
              </p>
              <div className="flex justify-center space-x-8 text-sm font-bold uppercase tracking-widest text-gray-500 pt-6">
                <Link href="/about?tab=about" className="hover:text-white transition-colors">About Us</Link>
                <Link href="/about?tab=terms" className="hover:text-white transition-colors">Terms</Link>
                <Link href="/about?tab=policy" className="hover:text-white transition-colors">Privacy</Link>
              </div>
            </div>

            {/* Payment Methods */}
            <div className="flex flex-wrap gap-4 justify-center grayscale hover:grayscale-0 transition-all duration-500">
              {[
                "PromptPay",
                "Stripe",
                "VISA",
                "Mastercard",
                "PayPal",
                "Amex",
                "Apple Pay"
              ].map((method) => (
                <div key={method} className="bg-white text-black px-4 py-2 font-black uppercase italic transform -skew-x-12 hover:scale-110 transition-transform cursor-default">
                  <span className="text-xs">{method}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Section 3: Socials & Copyright */}
        <div className="w-full">
          <div className="flex flex-col items-center space-y-6">
            {/* Social Icons */}
            <div className="flex space-x-8">
              <a href="#" className="text-white hover:text-accent transition-colors transform hover:scale-125 duration-300" aria-label="TikTok">
                <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="currentColor" stroke="none">
                  <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.65-1.58-1.02v6.154c0 1.01.03 2.05-.07 3.07-.15 1.57-.79 3.08-1.87 4.25-1.15 1.25-2.83 2-4.52 1.95-3.37-.1-6.07-2.88-6.19-6.26-.06-1.72.63-3.4 1.86-4.66 1.21-1.24 2.91-1.92 4.65-1.93.59.01 1.17.07 1.75.2v3.86c-.57-.29-1.24-.38-1.87-.24-1.24.27-2.19 1.4-2.14 2.66.04 1.26 1.05 2.36 2.31 2.45 1.25.09 2.37-.9 2.5-2.16.03-.89.01-1.78.01-2.67V.02z" />
                </svg>
              </a>
              <a href="#" className="text-white hover:text-accent transition-colors transform hover:scale-125 duration-300" aria-label="Instagram">
                <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                </svg>
              </a>
              <a href="#" className="text-white hover:text-accent transition-colors transform hover:scale-125 duration-300" aria-label="Facebook">
                <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="currentColor" stroke="none">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
              </a>
            </div>

            {/* Copyright */}
            <div className="text-xs text-gray-600 font-bold uppercase tracking-widest mt-8">
              &copy; {currentYear} KAWJAW. All Rights Reserved.
            </div>
          </div>
        </div>

      </div>
    </footer>
  );
}
