"use client";

import Link from "next/link";

export default function HeaderMain() {
  return (
    <div className="h-full flex items-center gap-3">
      <Link href="/" className="flex flex-col items-center gap-0 group">
        <div className="w-8 h-8 md:w-10 md:h-10 text-[#0e4d80] group-hover:scale-110 transition-transform duration-300">
          <svg viewBox="0 0 595.28 401.65" xmlns="http://www.w3.org/2000/svg" className="w-full h-full fill-current">
            <path d="M117.07,103.05s227.92,44.7,361.13-60.98c0,0-1.18,88.21-193,142.67,0,0,98.67,3.55,153.53-41.05,0,0-36.7,125.51-136.16,118.01,0,0,6.71,56.83,33.15,97.88,0,0-69.86-82.49-89.2-133.01,0,0,54.07,9.47,82.88-14.21,0,0-70.25,9.47-128.66-30,0,0,87.53,5.47,154.71-50.52,0,0-143.27,37.89-238.38-28.81Z" />
          </svg>
        </div>
        <span className="font-display text-[12px] md:text-[16px] uppercase tracking-widest text-(--pastel-blue-dark) leading-none mt-1">
          Arashi
        </span>
      </Link>
    </div>
  );
}
