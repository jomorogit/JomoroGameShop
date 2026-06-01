"use client" 
import { useSession, signOut } from "next-auth/react"
import Link from 'next/link'
import { usePathname } from 'next/navigation' // Импортируем хук для трекинга пути

export default function ProfilePhoneControl() {
  const pathname = usePathname();

  // Вспомогательная функция для проверки активности ссылки
  const isActive = (href: string) => pathname === href
    const { data: session} = useSession();
  // Общие стили для ссылок, чтобы не дублировать код
  const linkStyle = "transition-colors duration-200 hover:text-purple-400"
  
  // Стиль для активной ссылки (например, делаем текст белым, а неактивные — полупрозрачными)
  const activeStyle = "text-white font-semibold border-b-2 border-purple-500 pb-1"
  const inactiveStyle = "text-white/50"

  return (
    <div className='w-full mb-4 flex bg-[#23122E] pt-4 rounded-2xl text-base pb-4 justify-around md:hidden items-center'>
        {session?.user.role === 'admin' &&
        <Link 
          href="/account/admin" 
          className={`${linkStyle} ${isActive('/admin') ? activeStyle : inactiveStyle}`}
        >
          Admin Panel
        </Link>
        }
        
        
        <Link 
          href="/account/profile" 
          className={`${linkStyle} ${isActive('/account/profile') ? activeStyle : inactiveStyle}`}
        >
          Personal
        </Link>
        
        <Link 
          href="/account/transctions" 
          className={`${linkStyle} ${isActive('/account/transctions') ? activeStyle : inactiveStyle}`}
        >
          Transactions
        </Link>
        
        {/* Для Sign out обычно не нужно выделение активности, просто оставляем стили */}
        <Link 
        href="#" 
        className="flex items-center rounded-xl text-red-400 hover:bg-red-500/10 active:bg-red-500/10 transition-colors group" 
        onClick={() => {
        signOut({ callbackUrl: "/" });         
        }}
        >
          Sign out
        </Link>
        
    </div>
  )
}