
export default function CartSkeleton() {
  return (
    <div className="mt-30 p-10 w-full pl-10 animate-pulse">
      <h1 className="h-10 bg-white/10 w-48 mb-6 rounded-md"></h1>
      <div className="flex flex-col gap-4">

        {[...Array(5)].map((_, i) => (
          <div key={i} className="w-full h-32 bg-white/5 rounded-lg"></div>
        ))}
      </div>
    </div>
  );
}