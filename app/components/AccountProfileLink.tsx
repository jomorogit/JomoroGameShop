'use client'
import { useState, useEffect } from 'react';
import Link from "next/link"
import { useSession } from "next-auth/react"
import Avatar from "../icons/avatar.webp" 
import Image from "next/image"

export default function AccountProfileLink() {
    const { data: session, status } = useSession();

    const [timestamp, setTimestamp] = useState("");

    useEffect(() => {
    if (session?.user?.image) {
        requestAnimationFrame(() => {
            setTimestamp(`?t=${Date.now()}`);
        });
    }
}, [session?.user?.image]);

    if (status === "loading") {
        return (
            <div className="flex items-center gap-3">
                <div className="w-[60px] h-[60px] bg-white/10 rounded-2xl animate-pulse" />
            </div>
        );
    }

    const imageSrc = session?.user?.image 
        ? `${session.user.image}${timestamp}` 
        : Avatar;

    return (
        // Аватарка
        <div className="flex items-center gap-3">
            {session ? (
                <Link href="/account/profile">
                    <Image
                        referrerPolicy="no-referrer"
                        src={imageSrc} 
                        alt="user avatar" 
                        width={60} 
                        height={60} 
                        // key заставит Image обновиться при смене картинки
                        key={session.user?.image} 
                        className="rounded-2xl object-cover hover:ring-2 ring-blue-500 transition-all"
                    />
                </Link>
            ) : (
                <Link href="/register/login" className="flex items-center gap-3">
                    <Image
                        src={Avatar} 
                        alt="default avatar" 
                        width={60} 
                        height={60} 
                        className="rounded-2xl grayscale opacity-50 hover:grayscale-0 hover:opacity-100 transition-all"
                    />
                </Link>
            )}
        </div>
    )
}