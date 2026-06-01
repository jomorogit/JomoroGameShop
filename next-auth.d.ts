import NextAuth, { DefaultSession } from "next-auth"
import { JWT } from "next-auth/jwt"

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: string; // 👈 Добавляем роль в сессию
    } & DefaultSession["user"]
  }

  interface User {
    role: string; // 👈 Добавляем роль в объект юзера
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: string; // 👈 Добавляем роль в JWT токен
  }
}