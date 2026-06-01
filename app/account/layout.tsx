import Link from "next/link";
import { Provider } from "../components/Provider";
import LeftMenu from "../components/Sidebar";
import Account from "../components/AccountSummary";
import ProfileMenu from "../components/ProfileMenu";
import ScrollToTop from "../hooks/ScrollTop";
import TabBar from "../components/TabBar"; // Добавил таббар для мобилок
import ProfilePhoneControl from "../components/ProfilePhoneControl";
import { ToastProvider } from "../components/Toast";
export default function RegisterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    
    <Provider>
      <ToastProvider>
      <ScrollToTop />
      
      {/* Главный контейнер: использует ту же умную логику отступов, что и первый лейоут 🏎️💨 */}
      <div className="mainContainer relative flex min-h-screen w-full bg-[#1A0B22] overflow-x-hidden pb-16 md:pb-0
        [&:has([data-sidebar-open=true])]:lg:pl-[280px] 
        [&:has([data-sidebar-open=false])]:lg:pl-[70px] 
        lg:pl-[280px] 
        transition-[padding] duration-300 ease-in-out"
      > 
        
        {/* Левое меню (Сайдбар) */}
        <LeftMenu />

        {/* Основной контент страницы: гибкий flex-1 исключает поломку сетки*/}
        <div className="w-full flex-1 min-w-0 flex flex-col px-4 md:px-10 py-5">
          
          {/* Верхняя панель: Хлебные крошки и Аккаунт в одну линию */}
          <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between w-full gap-4 mb-10">
            
            {/* Хлебные крошки */}
            <div className="inline-flex h-14 md:ml-22 xl:ml-0 px-6 mt-4 bg-[#23122E] rounded-2xl items-center gap-3 shadow-lg border border-white/5">
              <Link href="/" className="font-inder text-[rgba(255,255,255,0.4)] hover:text-white transition-colors cursor-pointer">
                Home
              </Link>
              <span className="text-white/20 text-xs">/</span>
              <p className="font-inder text-white text-lg font-medium tracking-wide">
                My Profile
              </p>
            </div>

            {/* Блок аккаунта */}
            <div className="sm:ml-auto">
              <Account />
            </div>
          </header>

          {/* Нижняя часть: Меню профиля + контент */}
          <main className="flex flex-col md:flex-row w-full flex-1">
            {/* Левое меню профиля */}
            <div className="flex-shrink-0">
              <ProfileMenu />
            </div>
            
            <ProfilePhoneControl/>
            {/* Сама страница (children) */}
            <div className="flex-1 min-w-0">
              {children}
            </div>
          </main>

        </div>
      </div>

      {/* Нижний таббар для мобильных устройств 📱 */}
      <TabBar />
      </ToastProvider>
    </Provider>
   
  );
}