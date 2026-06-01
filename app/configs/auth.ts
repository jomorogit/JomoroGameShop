import { type AuthOptions, type User } from "next-auth";
import GoogleProvider, { type GoogleProfile } from 'next-auth/providers/google';
import CredentialsProvider from 'next-auth/providers/credentials';
import { prisma } from '@/lib/prisma'; 
import bcrypt from "bcryptjs";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { type Adapter } from "next-auth/adapters";

export const authConfig: AuthOptions = {
    adapter: PrismaAdapter(prisma) as Adapter,
    
    events: {
        async createUser({ user }) {
            await prisma.user.update({
                where: { id: Number(user.id) },
                data: {
                    is_verified: true,
                    emailVerified: new Date(),
                },
            });
        },
    },

    providers: [
        GoogleProvider({
            clientId: `${process.env.GOOGLE_CLIENT_ID}`.trim(),
            clientSecret: `${process.env.GOOGLE_SECRET}`.trim(),
            client: {
                token_endpoint_auth_method: "client_secret_post",
            },
        }),
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) return null;

                const user = await prisma.user.findUnique({
                    where: { email: credentials.email }
                });

                if (!user || !user.password_hash) return null;

                const isPasswordCorrect = await bcrypt.compare(
                    credentials.password,
                    user.password_hash
                );

                if (!isPasswordCorrect) return null;
                return {
                    id: String(user.id),
                    email: user.email,
                    name: user.name,
                    role: user.role,
                    image: user.image, 
                } as User; 
            }
        })
    ],

    session: {
        strategy: "jwt",
    },

    pages: {
        signIn: "/register/login",
    },

    callbacks: {
        async jwt({ token, user, trigger, session }) {
            if (user) {
                token.id = user.id;
                token.role = user.role;
                token.picture = user.image; 
            }

            if (trigger === "update" && session?.user?.image) {
                token.picture = session.user.image;
            }

            return token;
        },

        async session({ session, token }) {
            if (session.user) {
                session.user.id = token.id; 
                session.user.role = token.role;
                session.user.image = token.picture; 
            }
            return session;
        },

        async signIn({ account, profile }) {
            if (account?.provider === "google") {
                const googleProfile = profile as GoogleProfile;
                return googleProfile.email_verified ?? false;
            }
            return true;
        },
    },

    secret: process.env.NEXTAUTH_SECRET,
}