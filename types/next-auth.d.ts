// types/next-auth.d.ts

import "next-auth";
import { DefaultSession, DefaultUser } from "next-auth";
import "next-auth/jwt";
import { UserRole } from "@prisma/client"; 

declare module "next-auth" {

    interface Session {
        user: {
            id: string;
            role: UserRole | null; 
        } & DefaultSession["user"];
    }

    interface User extends DefaultUser {
        role: UserRole | null;
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        id: string;
        role: UserRole | null;
    }
}