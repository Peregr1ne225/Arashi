interface ProductSkeletonProps {
  title?: string;
  variant?: "grid" | "scroll";
}

export default function ProductSkeleton({
  title,
  variant = "grid",
}: ProductSkeletonProps) {
  const CardSkeleton = () => (
    <div className="flex flex-col h-full bg-white rounded-4xl overflow-hidden shadow-lg border border-gray-100 animate-pulse">
      {/* Image Placeholder */}
      <div className="bg-[#f4f4f5] aspect-3/4 w-full relative overflow-hidden">
        <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/50 to-transparent shimmer opacity-50" />
      </div>

      {/* Info */}
      <div className="pt-4 px-5 pb-5 space-y-3">
        {/* Swatches Shim */}
        <div className="flex gap-1 mb-2">
          <div className="w-6 h-6 rounded-full bg-gray-100" />
          <div className="w-6 h-6 rounded-full bg-gray-100" />
        </div>

        {/* Title */}
        <div className="h-5 bg-gray-200 w-3/4 rounded-full" />

        {/* Price & Rating Row */}
        <div className="flex justify-between items-center mt-2">
          <div className="h-6 bg-gray-200 w-1/3 rounded-full" />
          <div className="h-4 bg-gray-100 w-1/4 rounded-full" />
        </div>
      </div>
    </div>
  );

  return (
    <div
      className={`container mx-auto px-4 ${variant === "grid" ? "py-8" : "py-16 bg-[#F9F9F9]"}`}
    >
      {/* Header matching New Arrivals design if scroll */}
      {title && (
        <div className="mb-8 flex items-center justify-between">
          {variant === "scroll" ? (
            <h2 className="font-koulen text-[32px] md:text-[42px] uppercase tracking-wide text-black leading-none">
              {title}
              {/* Simplified skeleton header */}
            </h2>
          ) : (
            <h2 className="text-2xl font-bold mb-6">{title}</h2>
          )}
        </div>
      )}

      {variant === "grid" ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-x-5 gap-y-10">
          {[...Array(10)].map((_, i) => (
            <div key={i} className="hover:-translate-y-1 transition-transform">
              <CardSkeleton />
            </div>
          ))}
        </div>
      ) : (
        /* Scroll Variant */
        <div className="w-full overflow-x-hidden py-8 px-4">
          <div className="flex gap-4 w-max px-1">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="w-[260px] md:w-[280px] shrink-0">
                <CardSkeleton />
              </div>
            ))}
          </div>
          {/* Controls Skeleton */}
          <div className="mt-8 flex items-center justify-center gap-2">
            <div className="w-12 h-12 rounded-full bg-white border border-gray-200 shadow-sm" />
            <div className="w-12 h-12 rounded-full bg-white border border-gray-200 shadow-sm" />
          </div>
        </div>
      )}
    </div>
  );
}
