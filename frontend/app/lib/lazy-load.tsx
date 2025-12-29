"use client";

import React, { lazy, ComponentType, Suspense } from "react";

// Lazy loading utility with Suspense fallback
export function createLazyComponent<T extends ComponentType<any>>(
  importFunc: () => Promise<{ default: T }>,
  fallback: React.ReactNode = <div className="animate-pulse bg-gray-200 rounded-lg h-64 w-full"></div>
) {
  const LazyComponent = lazy(importFunc);

  return function LazyWrapper(props: React.ComponentProps<T>) {
    return (
      <Suspense fallback={fallback}>
        <LazyComponent {...props} />
      </Suspense>
    );
  };
}

// Preload component on demand
export function preloadComponent(importFunc: () => Promise<{ default: ComponentType<any> }>) {
  importFunc();
}

// Lazy loading for images with Intersection Observer
export function LazyImage({
  src,
  alt,
  className = "",
  placeholder = "blur",
  ...props
}: {
  src: string;
  alt: string;
  className?: string;
  placeholder?: "blur" | "empty";
  [key: string]: any;
}) {
  const [isLoaded, setIsLoaded] = React.useState(false);
  const [isInView, setIsInView] = React.useState(false);
  const [hasError, setHasError] = React.useState(false);
  const imgRef = React.useRef<HTMLImageElement>(null);

  // Set up Intersection Observer
  React.useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setIsInView(true);
          // Start loading the image when it's about to come into view
          if (imgRef.current && imgRef.current.src) {
            imgRef.current.src = src;
          }
        }
      },
      { threshold: 0.1 }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => {
      if (imgRef.current) {
        observer.unobserve(imgRef.current);
      }
    };
  }, [src]);

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {!isLoaded && isInView && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-200">
          <div className="animate-pulse bg-gray-300 rounded w-8 h-8"></div>
        </div>
      )}

      <img
        ref={imgRef}
        src={isInView ? src : undefined} // Only load when in view
        alt={alt}
        className={`w-full h-full object-cover transition-all duration-300 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
        onLoad={() => setIsLoaded(true)}
        onError={() => setHasError(true)}
        {...props}
      />

      {hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
          <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l4.586-4.586a2 2 0 012.828 0L16 4m-2 2l-4.586 4.586a2 2 0 01-2.828 0L8 4" />
          </svg>
        </div>
      )}
    </div>
  );
}
