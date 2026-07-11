import React from 'react'
import LibraryList from '@/app/components/LibraryList';
import { Suspense } from 'react';
import LibrarySkeleton from '@/app/components/LibrarySkeleton';

export default function page() {
    return (
        <div className="w-full mt-27 pl-2 pr-2 lg:pl-10 lg:pr-10"> 
            <h1 className="font-inder text-3xl mb-8">My Games</h1>
                <Suspense fallback={<LibrarySkeleton />}>
                    <LibraryList></LibraryList>
                </Suspense>
            {/* Phone */}
            <div className='lg:hidden w-full h-20'></div>
        </div>
    );
}