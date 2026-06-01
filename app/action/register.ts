"use server"

import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { generateVerificationToken } from "@/lib/token";
import { sendVerificationEmail } from "@/lib/mail";
import { error } from "console";
import { ISignUpData } from "@/lib/types";

// 1. Проверка доступности емейла и пароля 
export async function checkUserAvailability(email?: string, username?: string) {
    try {
        const existingUser = await prisma.user.findFirst({
            where: {
                OR: [
                    email ? { email } : {},
                    username ? { name: username } : {}
                ].filter(condition => Object.keys(condition).length > 0)
            }
        });

        if (existingUser) {
            if (email && existingUser.email === email) return { error: "This Email is already taken! 📧" };
            if (username && existingUser.name === username) return { error: "Username is already taken! 🎮" };
        }
        return { success: true };
    } catch (error) {
        return { error: "Validation error ❌" };
    }
}




// 2. Отправка OTP 
export async function sendOTP(email: string) {
    try {
        // 1. Сразу удаляем все старые токены для этого пользователя (если они были)
        // Если их нет, Prisma просто ничего не удалит, ошибки не будет.
        await prisma.verificationToken.deleteMany({
            where: { identifier: email },
        });

        // 2. Генерируем новый токен
        const verificationToken = await generateVerificationToken(email);

        // 3. Отправляем письмо
        await sendVerificationEmail(verificationToken.identifier, verificationToken.token);

        return { success: "Code sent! 📧" };
    } catch (error) {
        console.error("SEND_OTP_ERROR:", error);
        return { error: "Failed to send code ❌" };
    }
}


export async function registerUser(formData: ISignUpData) {
    console.log("DEBUG: Received formData:", formData);
    try {
        const { email, username, password, code } = formData;

        if (!code) return { error: "Verification code is required! 🔑" };

        const existingToken = await prisma.verificationToken.findUnique({
            where: {
                identifier_token: { 
                    identifier: email, 
                    token: code 
                }
            }
        });

        if (!existingToken) {
            return { error: "Invalid code! ❌" };
        }

        // 2. Проверяем срок годности
        const hasExpired = new Date(existingToken.expires) < new Date();
        if (hasExpired) return { error: "Code expired! ⌛" };

        // 3. Хешируем пароль
        // Добавь проверку на существование пароля, так как в интерфейсе он может быть необязательным
        if (!password) return { error: "Password is required! 🛡️" };
        const hashPassword = await bcrypt.hash(password, 10);

        // 4. Создаем пользователя
        const newUser = await prisma.user.create({
            data: {
                email: email,
                name: username,
                password_hash: hashPassword,
                balance_eur: 0.00, 
                is_verified: true,
                emailVerified: new Date(),
                privacyAccepted: true,
            }
        });
        if(!newUser){
            return { error: "User is not created" };
        }
        // 5. Удаляем использованный токен
        await prisma.verificationToken.deleteMany({
            where: {
                identifier: email 
            }
        });

        return { success: "Welcome to GameShop! 🎮"};

    } catch (error) {
        console.error("REGISTRATION_ERROR:", error);
        return { error: "Registration failed. Please try again." };
    }
}