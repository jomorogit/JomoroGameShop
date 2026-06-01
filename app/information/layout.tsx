import { Provider } from "../components/Provider";
import LeftMenu from "../components/Sidebar";
import Account from "../components/AccountSummary";
import ScrollToTop from "../hooks/ScrollTop";
import TabBar from "../components/TabBar"; 
import ProfilePhoneControl from "../components/ProfilePhoneControl";
import { ToastProvider } from "../components/Toast";
import Footer from "../components/Footer";
export default function RegisterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    
    <Provider>
      <ToastProvider>
      <ScrollToTop />
      
      <div className="mainContainer relative flex min-h-[calc(100vh)] w-full bg-[#1A0B22] overflow-x-hidden pb-16 md:pb-0
        [&:has([data-sidebar-open=true])]:lg:pl-[280px] 
        [&:has([data-sidebar-open=false])]:lg:pl-[70px] 
        lg:pl-[280px] 
        transition-[padding] duration-300 ease-in-out"
      > 
        
        {/* Левое меню (Сайдбар) */}
        <LeftMenu />

        {/* Основной контент страницы: гибкий flex-1 исключает поломку сетки  */}
        <div className="w-full flex-1 min-w-0 flex flex-col px-4 md:px-10 py-5">
          
          <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between w-full gap-4 mb-10">

            {/* Блок аккаунта */}
            <div className="sm:ml-auto">
              <Account />
            </div>
          </header>

          {/* Нижняя часть: Меню профиля + контент*/}
          <main className="flex flex-col md:flex-row w-full flex-1">
            {/* Левое меню профиля */}
            
            <ProfilePhoneControl/>
            {/* Сама страница (children) */}
            <div className="flex items-center justify-center w-full">
              {children}
            </div>
          </main>

        </div>
      </div>
         {/* Footer  */}
          <div className="w-full h-auto min-h-20 bg-[#23122E]">
             <Footer/>
          </div>
      {/* Нижний таббар для мобильных устройств */}
      <TabBar />
      </ToastProvider>
    </Provider>
   
  );
}