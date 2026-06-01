import { withAuth, NextRequestWithAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";
import type { NextFetchEvent, NextRequest } from "next/server";

// 1. Строгая карта доступа с типизацией Record
const routePermissions: Record<string, string[]> = {
 "/account/admin": ["admin"],                // Сюда обычным юзерам вход закрыт ❌
  
  // На эти страницы пускаем И пользователей, И админов 🟢
  "/account/addmoney": ["user", "admin"],
  "/account/profile": ["user", "admin"],
  "/cart": ["user", "admin"],
  "/library": ["user", "admin"],
  "/wishlist": ["user", "admin"],
};

// 2. Обертка NextAuth автоматически типизирует `req` как NextRequestWithAuth внутри колбэка
const authHandler = withAuth(
  function middleware(req: NextRequestWithAuth) {
    const token = req.nextauth.token;
    const pathname = req.nextUrl.pathname;
    
    // Теперь TypeScript знает, что здесь строка (или undefined)
    const userRole = token?.role as string | undefined;

    const protectedRoute = Object.keys(routePermissions).find((route) =>
      pathname.startsWith(route)
    );

    if (protectedRoute && userRole) {
      const allowedRoles = routePermissions[protectedRoute];
      
      if (!allowedRoles.includes(userRole)) {
        return NextResponse.rewrite(new URL("/unauthorized", req.url));
      }
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      // token будет типа JWT | null автоматически
      authorized: ({ token }) => !!token,
    },
  }
);

// 3. Явные типы для экспортируемых функций Next.js 🚀

export function middleware(req: NextRequest, event: NextFetchEvent) {
  // Указываем TS, что authHandler сам разберется с расширением типа запроса
  return authHandler(req as NextRequestWithAuth, event);
}

export function proxy(req: NextRequest, event: NextFetchEvent) {
  return authHandler(req as NextRequestWithAuth, event);
}

export default middleware;

export const config = {
  matcher: [
    "/account/:path*", 
    "/cart/:path*",
    "/library/:path*",
    "/wishlist/:path*",
  ],
};