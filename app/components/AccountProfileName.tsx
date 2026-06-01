'use client'
import React from 'react'
import Link from "next/link"
import { useSession } from "next-auth/react"
export default function AccountProfileName() {
      const { data: session, status } = useSession();
    
        const isLoading = status === "loading";
  return (
    <div>
        
    {session ? (
      <Link href="/account/profile" className="cursor-pointer font-inder text-lg text-white leading-tight">
        {session?.user?.name}
      </Link>
    ) : (
      <Link href="/register/login" className="cursor-pointer font-inder text-lg text-white leading-tight">
          Guest
      </Link>
    )}
    
    </div>
  )
}
