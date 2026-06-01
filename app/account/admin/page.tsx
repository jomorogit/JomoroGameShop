import React from 'react'
import Link from 'next/link'
export default function Admin() {
  return (
    <div className='w-full h-auto rounded-2xl bg-[#23122E] mr-10 p-10'>
        <Link href="/account/admin/create-game" className='block bg-[#3D234D] w-60 p-5 rounded-2xl text-2xl hover:bg-[#72468e] mb-10'>Create New Game</Link>
        <Link href="/account/admin/delete-game" className='block bg-[#3D234D] w-60 p-5 rounded-2xl text-2xl hover:bg-[#72468e] mb-10'>Delete Game</Link>
        <Link href="/account/admin/edit-game" className='block bg-[#3D234D] w-60 p-5 rounded-2xl text-2xl hover:bg-[#72468e]'>Edit Game</Link>
    </div>
  )
}
