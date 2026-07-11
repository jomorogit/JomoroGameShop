import { Suspense } from 'react';
import WishListSkeleton from "@/app/components/WishListSkeleton";
import WishListContent from "@/app/components/WishlistContent";
import ScrollToTop from "@/app/hooks/ScrollTop";

export default async function WishList() {
    
    return (
        <div className="mt-16 p-10 w-full pl-10">
            <ScrollToTop />
            <h1 className="text-3xl mb-6">WishList</h1>
            
            {/* Suspense оборачивает компонент, который делает запрос */}
            <Suspense fallback={<WishListSkeleton />}>
                <WishListContent/>
            </Suspense>
        </div>
    );
}