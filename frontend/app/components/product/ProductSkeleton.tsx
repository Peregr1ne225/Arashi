interface ProductSkeletonProps {
  title?: string;
}

export default function ProductSkeleton({ title }: ProductSkeletonProps) {
  return (
    <div className="container mx-auto px-4 py-8">
      {title && <h2 className="text-4xl font-black uppercase italic tracking-tighter text-white mb-8 border-b border-white/10 pb-4">{title}</h2>}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {[...Array(10)].map((_, i) => (
          <div key={i} className="animate-pulse flex flex-col h-full bg-neutral-900 border border-white/5 skew-box">
            <div className="bg-white/5 aspect-[3/4] w-full mb-4"></div>
            <div className="p-4 space-y-3">
              <div className="h-6 bg-white/10 w-3/4 skew-box"></div>
              <div className="h-4 bg-white/5 w-1/2 skew-box"></div>
              <div className="flex justify-between mt-4">
                <div className="h-6 bg-accent/20 w-1/3 skew-box"></div>
                <div className="h-8 bg-white/10 w-8 skew-box"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
