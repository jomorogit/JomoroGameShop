import { Provider } from "../components/Provider";
import { ToastProvider } from "../components/Toast";
import TabBar from "../components/TabBar";
import Footer from "../components/Footer";
import LeftMenu from "../components/Sidebar";
import Search from "../components/Search";
import Account from "../components/AccountSummary";

export default function ShopLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <Provider>
      <ToastProvider>
        <div className="mainContainer relative flex min-h-screen w-full bg-[#1A0B22] overflow-x-hidden lg:pl-[17.5] [&:has([data-sidebar-open=true])]:lg:pl-[280px] transition-[padding] duration-300 ease-in-out">
          <LeftMenu />
          <div className="w-full flex-1 min-w-0 flex flex-col">
            <header className="flex items-center justify-between px-6 md:px-32 lg:px-10 py-1 md:py-5 w-full gap-4">
              <div className="mr-5">
                <Search />
              </div>
              <div>
                <Account />
              </div>
            </header>
            <main className="w-full flex-1">{children}</main>
          </div>
        </div>
        <div className="w-full h-auto min-h-20 bg-[#23122E]">
          <Footer />
        </div>

        <TabBar />
      </ToastProvider>
    </Provider>
  );
}