import Link from "next/link";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#74707f] text-white pt-24 pb-12 overflow-hidden relative">
      <div className="container mx-auto px-10 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16 lg:gap-8 pb-16 border-b border-white/10">

          {/* Column 1: Social Media */}
          <div className="space-y-8">
            <h3 className="text-xs font-istok font-bold uppercase tracking-[0.25em] text-white/50">Social Media</h3>
            <div className="flex gap-4">
              {/* Facebook */}
              <a href="#" className="group relative w-10 h-10 bg-white/10 backdrop-blur-md flex items-center justify-center rounded-full transition-all duration-300 hover:bg-white hover:scale-110" aria-label="Facebook">
                <svg className="w-4 h-4 fill-white group-hover:fill-black transition-colors" viewBox="-337 273 123.5 256">
                  <path d="M-260.9,327.8c0-10.3,9.2-14,19.5-14c10.3,0,21.3,3.2,21.3,3.2l6.6-39.2c0,0-14-4.8-47.4-4.8c-20.5,0-32.4,7.8-41.1,19.3 c-8.2,10.9-8.5,28.4-8.5,39.7v25.7H-337V396h26.5v133h49.6V396h39.3l2.9-38.3h-42.2V327.8z" />
                </svg>
              </a>
              {/* Instagram */}
              <a href="#" className="group relative w-10 h-10 bg-white/10 backdrop-blur-md flex items-center justify-center rounded-full transition-all duration-300 hover:bg-white hover:scale-110" aria-label="Instagram">
                <svg className="w-4 h-4 fill-white group-hover:fill-black transition-colors" viewBox="0 0 256 256">
                  <path d="M127.999746,23.06353 C162.177385,23.06353 166.225393,23.1936027 179.722476,23.8094161 C192.20235,24.3789926 198.979853,26.4642218 203.490736,28.2166477 C209.464938,30.5386501 213.729395,33.3128586 218.208268,37.7917319 C222.687141,42.2706052 225.46135,46.5350617 227.782844,52.5092638 C229.535778,57.0201472 231.621007,63.7976504 232.190584,76.277016 C232.806397,89.7746075 232.93647,93.8226147 232.93647,128.000254 C232.93647,162.177893 232.806397,166.225901 232.190584,179.722984 C231.621007,192.202858 229.535778,198.980361 227.782844,203.491244 C225.46135,209.465446 222.687141,213.729903 218.208268,218.208776 C213.729395,222.687649 209.464938,225.461858 203.490736,227.783352 C198.979853,222.687649 209.464938,225.461858 213.729395,222.687649 218.208268,220.261995 220.261995,227.400755 234.516143,234.516651 C241.632039,227.400755 246.008785,220.262503 249.279912,211.845372 C252.444339,203.703121 254.607815,194.398852 255.229725,180.774236 C255.852652,167.122183 256,162.763221 256,128.000254 C256,93.2372872 255.852652,88.8783247 255.229725,75.2262718 C254.607815,61.6016561 252.444339,52.2973875 249.279912,44.1551362 C246.008785,35.7380046 241.632039,28.5997527 234.516143,21.483857 C227.400247,14.3679613 220.261995,9.99121548 211.844864,6.72008828 C203.702613,3.55566141 194.398344,1.39218523 180.773728,0.770274749 C167.121675,0.147348072 162.762713,0 127.999746,0 Z M127.999746,62.2703115 C91.698262,62.2703115 62.2698034,91.69877 62.2698034,128.000254 C62.2698034,164.301738 91.698262,193.730197 127.999746,193.730197 C164.30123,193.730197 193.729689,164.301738 193.729689,128.000254 C193.729689,91.69877 164.30123,62.2703115 127.999746,62.2703115 Z M127.999746,170.667175 C104.435741,170.667175 85.3328252,151.564259 85.3328252,128.000254 C85.3328252,104.436249 104.435741,85.3333333 127.999746,85.3333333 C151.563751,85.3333333 170.666667,104.436249 170.666667,128.000254 C170.666667,151.564259 151.563751,170.667175 127.999746,170.667175 Z M211.686338,59.6734287 C211.686338,68.1566129 204.809755,75.0337031 196.326571,75.0337031 C187.843387,75.0337031 180.966297,68.1566129 180.966297,59.6734287 C180.966297,51.1902445 187.843387,44.3136624 196.326571,44.3136624 C204.809755,44.3136624 211.686338,51.1902445 211.686338,59.6734287 Z" />
                </svg>
              </a>
              {/* TikTok */}
              <a href="#" className="group relative w-10 h-10 bg-white/10 backdrop-blur-md flex items-center justify-center rounded-full transition-all duration-300 hover:bg-white hover:scale-110" aria-label="TikTok">
                <svg className="w-4 h-4 fill-white group-hover:fill-black transition-colors" viewBox="0 0 32 32">
                  <path d="M16.656 1.029c1.637-0.025 3.262-0.012 4.886-0.025 0.054 2.031 0.878 3.859 2.189 5.213l-0.002-0.002c1.411 1.271 3.247 2.095 5.271 2.235l0.028 0.002v5.036c-1.912-0.048-3.71-0.489-5.331-1.247l0.082 0.034c-0.784-0.377-1.447-0.764-2.077-1.196l0.052 0.034c-0.012 3.649 0.012 7.298-0.025 10.934-0.103 1.853-0.719 3.543-1.707 4.954l0.020-0.031c-1.652 2.366-4.328 3.919-7.371 4.011l-0.014 0c-0.123 0.006-0.268 0.009-0.414 0.009-1.73 0-3.347-0.482-4.725-1.319l0.040 0.023c-2.508-1.509-4.238-4.091-4.558-7.094l-0.004-0.041c-0.025-0.625-0.037-1.25-0.012-1.862 0.49-4.779 4.494-8.476 9.361-8.476 0.547 0 1.083 0.047 1.604 0.136l-0.056-0.008c0.025 1.849-0.050 3.699-0.050 5.548-0.423-0.153-0.911-0.242-1.42-0.242-1.868 0-3.457 1.194-4.045 2.861l-0.009 0.030c-0.133 0.427-0.21 0.918-0.21 1.426 0 0.206 0.013 0.41 0.037 0.61l-0.002-0.024c0.332 2.046 2.086 3.59 4.201 3.59 0.061 0 0.121-0.001 0.181-0.004l-0.009 0c1.463-0.044 2.733-0.831 3.451-1.994l0.010-0.018c0.267-0.372 0.45-0.822 0.511-1.311l0.001-0.014c0.125-2.237 0.075-4.461 0.087-6.698 0.012-5.036-0.012-10.060 0.025-15.083z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Column 2: SHOP */}
          <div className="space-y-6">
            <h3 className="text-xs font-istok font-bold uppercase tracking-[0.25em] text-white/50 border-b border-white/20 w-fit pb-1">Shop</h3>
            <ul className="space-y-3">
              <li><Link href="/products" className="text-base font-istok font-light text-gray-300 hover:text-white transition-colors uppercase tracking-wider">All Products</Link></li>
              <li><Link href="/new" className="text-base font-istok font-light text-gray-300 hover:text-white transition-colors uppercase tracking-wider">New Arrivals</Link></li>
              <li><Link href="/sale" className="text-base font-istok font-medium transition-colors uppercase tracking-wider text-accent hover:text-white">Sale</Link></li>
            </ul>
          </div>

          {/* Column 3: COMPANY */}
          <div className="space-y-6">
            <h3 className="text-xs font-istok font-bold uppercase tracking-[0.25em] text-white/50 border-b border-white/20 w-fit pb-1">Company</h3>
            <ul className="space-y-3">
              <li><Link href="/about?tab=about" className="text-base font-istok font-light text-gray-300 hover:text-white transition-colors uppercase tracking-wider">About Us</Link></li>
              <li><Link href="/about?tab=terms" className="text-base font-istok font-light text-gray-300 hover:text-white transition-colors uppercase tracking-wider">Terms</Link></li>
              <li><Link href="/about?tab=policy" className="text-base font-istok font-light text-gray-300 hover:text-white transition-colors uppercase tracking-wider">Privacy Policy</Link></li>
            </ul>
          </div>

          {/* Column 4: Stay Up To Date */}
          <div className="space-y-6">
            <h3 className="text-xs font-istok font-bold uppercase tracking-[0.25em] text-white/50">Keep in Touch</h3>
            <div className="space-y-2">
              <a href="mailto:user@example.com" className="block text-2xl font-istok font-light tracking-wide text-white hover:text-accent transition-all duration-300">
                user@example.com
              </a>
              <p className="text-xs font-istok font-light text-gray-400 uppercase tracking-widest leading-relaxed max-w-[200px]">
                Join our community for improved performance and exclusive drops.
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="hidden lg:flex gap-1 items-center">
            <span className="w-1.5 h-1.5 rounded-full bg-accent"></span>
            <div className="w-12 h-px bg-white/10"></div>
          </div>
          <div className="text-xs font-istok font-light uppercase tracking-[0.3em] text-white/30 text-right">
            &copy; {currentYear} Cream. Performance Essentials.
          </div>
        </div>
      </div>
    </footer>
  );
}
