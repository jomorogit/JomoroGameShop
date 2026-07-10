// app/layout.tsx
import { getServerSession } from "next-auth";
import { authConfig } from "../configs/auth";
import { prisma } from "@/lib/prisma";
import { Provider } from "../components/Provider";
import { ToastProvider } from "../components/Toast";
import TabBar from "../components/TabBar";
import Footer from "../components/Footer";
import LeftMenu from "../components/Sidebar";
import Search from "../components/Search";
import Account from "../components/AccountSummary";
import "../globals.css";

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const session = await getServerSession(authConfig);
  
  let userData = { balance: "0.00", cartCount: 0 };

  if (session?.user?.email) {
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { balance_eur: true, id: true }
    });
    
    if (user) {
      const cartCount = await prisma.cart.count({ where: { user_id: user.id } });
      userData = { 
        balance: Number(user.balance_eur || 0).toFixed(2), 
        cartCount 
      };
    }
  }

  return (
    <Provider>
      <ToastProvider>
        <div className="mainContainer relative flex min-h-screen w-full bg-[#1A0B22] overflow-x-hidden [&:has([data-sidebar-open=true])]:lg:pl-[280px] [&:has([data-sidebar-open=false])]:lg:pl-[70px] lg:pl-[280px] transition-[padding] duration-300 ease-in-out">
          <LeftMenu />
          <div className="w-full flex-1 min-w-0 flex flex-col">
            <header className="flex items-center justify-between px-6 md:px-30 lg:px-10 py-1 md:py-5 w-full gap-4">
              <div className="mr-5"><Search /></div>
              <div><Account /></div>
            </header>
            <main className="w-full flex-1">{children}</main>
          </div>
        </div>
        <div className="w-full h-auto min-h-20 bg-[#23122E]"><Footer /></div>
        
        {/* Передаем данные пропсами */}
        <TabBar initialBalance={userData.balance} initialCartCount={userData.cartCount} />
      </ToastProvider>
    </Provider>
  );
}