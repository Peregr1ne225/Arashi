"use client";

interface ClientWrapperProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * ClientWrapper - A thin client component to wrap interactive elements
 * This helps minimize the client-side JavaScript bundle size
 */
export default function ClientWrapper({
  children,
  className,
}: ClientWrapperProps) {
  return <div className={className}>{children}</div>;
}
