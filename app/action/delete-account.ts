"use server";

import { prisma } from "@/lib/prisma"; 
import { getServerSession } from "next-auth"; 
import { authConfig } from "../configs/auth";
import { generateVerificationToken } from "@/lib/token";
import { sendDeletionConfirmationEmail , sendAccountDeletedEmail} from "@/lib/mail";

// 1. Генерация и отправка OTP на почту
export async function DeleteGameOTP() {
    const session = await getServerSession(authConfig);
    if (!session?.user?.email) {
        return { error: "User not authorized" };
    }
    
    try {
        const existUser = await prisma.user.findUnique({
            where: { email: session.user.email }
        });
        
        if (!existUser) {
            return { error: "Account not found" };
        }
        
        // Генерируем токен и отправляем письмо
        const verificationToken = await generateVerificationToken(session.user.email);
        await sendDeletionConfirmationEmail(verificationToken.identifier, verificationToken.token);

        return { success: "Code sent!" };
    } catch (error) {
        console.error("DeleteGameOTP error:", error);
        return { error: "Failed to send verification code" };
    }
}


// 
export async function Validation(OTP: string) {
    const session = await getServerSession(authConfig);

    if (!session?.user?.email) {
        return { error: "User not authorized" };
    }
    
    //Сохраняем email в константу в самом начале
    const userEmail = session.user.email; 

    if (!OTP || OTP.length !== 6) {
        return { error: "Code is not valid" };
    }

    try {
        const existingToken = await prisma.verificationToken.findUnique({
            where: {
                identifier_token: {
                    identifier: userEmail, 
                    token: OTP,
                },
            },
        });

        if (!existingToken) {
            return { error: "Invalid verification code" };
        }

        const hasExpired = new Date(existingToken.expires) < new Date();
        if (hasExpired) {
            return { error: "Verification code has expired" };
        }

        const existUser = await prisma.user.findUnique({
            where: { email: userEmail }
        });
        
        if (!existUser) {
            return { error: "Account not found" };
        }

        const deleteUser = await prisma.user.delete({
            where: { email: userEmail }
        });

        if (!deleteUser) {
            return { error: "User is not deleted" };
        }

        await sendAccountDeletedEmail(userEmail);

        await prisma.verificationToken.delete({
            where: { id: existingToken.id }
        });

        return { success: "User deleted" };
    } catch (error) {
        console.error("Validation and deletion error:", error);
        return { error: "An error occurred during account deletion" };
    }
}