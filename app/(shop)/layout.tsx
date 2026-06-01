import { Geist, Inder } from "next/font/google";
import "../globals.css";
import LeftMenu from "../components/Sidebar";
import Account from "../components/AccountSummary";
import Search from "../components/Search";
import { Provider } from "../components/Provider";
import { ToastProvider } from "../components/Toast";
import TabBar from "../components/TabBar";
import Footer from "../components/Footer";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <Provider>
      <ToastProvider>
        
        {/* Главный контейнер */}
        {/* Добавили хитрые стили: если внутри есть элемент с data-sidebar-open="true", то отступ контента становится 280px, иначе 70px */}
        <div className="mainContainer relative flex min-h-screen w-full bg-[#1A0B22] overflow-x-hidden
          [&:has([data-sidebar-open=true])]:lg:pl-[280px] 
          [&:has([data-sidebar-open=false])]:lg:pl-[70px] 
          lg:pl-[280px] /* Значение по умолчанию при первой загрузке SSR */
          transition-[padding] duration-300 ease-in-out"
        > 
          
          <LeftMenu />

          {/* Основной контент сайта */}
          <div className="w-full flex-1 min-w-0 flex flex-col"> 
            
            {/* Header с поиском и аккаунтом */}
            <header className="flex items-center justify-between px-6 md:px-30 lg:px-10 py-1 md:py-5 w-full gap-4">
              <div className="mr-5">
                 <Search />
              </div>

              <div className="">
                <Account />
             </div>
              
            </header>
            
            {/* Страницы сайта */}
            <main className="w-full flex-1">
              {children}
            </main>

          </div>
        </div>
        {/* Footer  */}

          <div className="w-full h-auto min-h-20 bg-[#23122E]">
             <Footer/>
          </div>
        <TabBar/>
      </ToastProvider>
    </Provider>
  );
}