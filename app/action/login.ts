"use server"

import { ISLoginData } from "@/lib/types";
import { prisma } from "@/lib/prisma";
import { generateVerificationToken } from "@/lib/token";
import { sendVerificationEmail } from "@/lib/mail";
import bcrypt from "bcryptjs";


 // Проверка учетных данных и генерация/отправка OTP-кода
 
export async function LoginValidation(formData: ISLoginData) {
    try {
        const existUser = await prisma.user.findFirst({
            where: {
                email: formData.email,
            }
        });

        // Если пользователя нет или он авторизован через OAuth
        if (!existUser || !existUser.password_hash) {
            console.log("Email not found or user signed up via Google");
            return { error: "Incorrect login or password" };
        }

        // 3. Сверяем хэш введенного пароля с хэшем из базы данных
        const isPasswordCorrect = await bcrypt.compare(
            formData.password,
            existUser.password_hash
        );

        if (!isPasswordCorrect) {
            console.log("Incorrect password");
            return { error: "Incorrect login or password" };
        }

        // 4. Создаем безопасный токен
        const verificationToken = await generateVerificationToken(formData.email);
        
        // Отправляем сгенерированный код пользователю на почту
        await sendVerificationEmail(verificationToken.identifier, verificationToken.token);

        console.log("Password verified, OTP code sent successfully!");
        return { success: "Code sent!" };

    } catch (error) {
        console.error("Critical error in LoginValidation:", error); 
        return { error: "Something went wrong" }; 
    }
}


 // Валидация введенного кода, проверка лимита времени и удаление
 
export async function CodeValidate(formData: ISLoginData) {
    try {
        // 1. Ищем токен по составному уникальному ключу (email + код)
        const verificationRecord = await prisma.verificationToken.findUnique({
           where: {
                identifier_token: { 
                    identifier: formData.email,
                    token: formData.code || "" 
                }
            }
        });

        // Если связка из кода и email не найдена в системе
        if (!verificationRecord) {
           return { error: "Code is not correct" }; 
        }
       
        //  Проверяем, не вышло ли время жизни кода 
        const isExpired = new Date() > verificationRecord.expires;
        if (isExpired) {
            // Моментально стираем просроченный токен, чтобы освободить место 
            await prisma.verificationToken.delete({
                where: { id: verificationRecord.id }
            });
            return { error: "Code has expired. Please request a new one." };
        }

        // Уничтожаем код сразу после успешного совпадения (защита от повторного входа)
        await prisma.verificationToken.delete({
            where: { id: verificationRecord.id }
        });

        console.log(" OTP Code successfully verified! Access granted.");
        
       
        return { success: "Welcome" };

    } catch (error) {
        console.error(" Critical error in CodeValidate:", error);
        return { error: "Something went wrong" };
    }
}