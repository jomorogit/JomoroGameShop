"use server"
import { ISLoginData } from "@/lib/types";
import { prisma } from "@/lib/prisma";
import { generateVerificationToken } from "@/lib/token";
import { sendVerificationEmail } from "@/lib/mail";
import bcrypt from "bcryptjs";

export async function LoginValidation(formData: ISLoginData) {
    try {
        // 1. Ищем пользователя по email
        const existUser = await prisma.user.findFirst({
            where: {
                email: formData.email,
            }
        });

        if (!existUser || !existUser.password_hash) {
            console.log("❌ Email not found or user signed up via Google");
            return { error: "Incorrect login or password" };
        }

        const isPasswordCorrect = await bcrypt.compare(
            formData.password,
            existUser.password_hash
        );

        if (!isPasswordCorrect) {
            console.log("❌ Incorrect password");
            return { error: "Incorrect login or password" };
        }

        await prisma.verificationToken.deleteMany({
            where: { identifier: formData.email },
        });

        const verificationToken = await generateVerificationToken(formData.email);
        await sendVerificationEmail(verificationToken.identifier, verificationToken.token);

        console.log("✅ Password verified, OTP code sent success!");
        return { success: "Code sent!" };

    } catch (error) {
        console.log("Error in LoginValidation:", error); 
        return { error: "Something went wrong" }; 
    }
}

export async function CodeValidate(formData: ISLoginData) {
    try {
        const findUserWidthCode = await prisma.verificationToken.findUnique({
           where: {
                identifier_token: { 
                    identifier: formData.email,
                    token: formData.code 
                }
            }
        });

        if (!findUserWidthCode) {
           return { error: "code is not correct" }; 
        }
       
        return { success: "Wellcome" };

    } catch (error) {
        console.log("Error in CodeValidate:", error);
        return { error: "Something went wrong" };
    }
}