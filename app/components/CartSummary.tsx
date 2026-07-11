'use client'
import React, { useState, useEffect } from 'react'
import useSWR from 'swr'; 

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function CartSummary() {
    const [dots, setDots] = useState("");
    const { data, error, isLoading } = useSWR('/api/cart-summary', fetcher);

    useEffect(() => {
        if (!isLoading) return; 

        const interval = setInterval(() => {
            setDots(prev => (prev.length >= 3 ? "" : prev + "."));
        }, 500);

        return () => clearInterval(interval);
    }, [isLoading]);

    if (error) return <div className="text-white">summary error</div>;

    return (
        <span>
            {isLoading ? (
                `Loading${dots}`
            ) : (
                `${(data?.summary || 0).toFixed(2)} €`
            )}
        </span>
    );
}