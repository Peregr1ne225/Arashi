"use client";

import Link from "next/link";

export default function HeaderMain() {
  return (
    <div className="h-full flex items-center">
      <Link
        href="/"
        className="font-mrs-sheppards text-[40px] text-(--header-logo)"
      >
        Arashi
      </Link>
    </div>
  );
}
