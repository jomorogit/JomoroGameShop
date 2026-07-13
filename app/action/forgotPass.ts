"use server"

import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { generateVerificationToken } from "@/lib/token";
import { sendVerificationEmail } from "@/lib/mail";
import { ISFrorgotData } from "@/lib/types";

import { loginRateLimiter } from "@/lib/ratelimit";
import { headers } from "next/headers";

export async function emailValidate(formData:ISFrorgotData) {
    try{

    const headerList = await headers();
        const ip = headerList.get("x-forwarded-for")?.split(",")[0] ?? "127.0.0.1";
        
        const { success: isEmailAllowed } = await loginRateLimiter.limit(`forgot_email_attempt_${ip}`);
        if (!isEmailAllowed) {
            return { error: "Too many verification attempts. Please try again later." };
        }
    
      const existUser = await prisma.user.findUnique({
        where: {
            email: formData.email,
        }
        })
    if(!existUser){
        return {error : "Account not found"}
    }
    await prisma.verificationToken.deleteMany({
            where: { identifier: formData.email },
        });
    
    
    const verificationToken = await generateVerificationToken(formData.email);
    await sendVerificationEmail(verificationToken.identifier, verificationToken.token);

    return { success: "Code sent!" };
    
    }catch(error){
        return {error : "Some error"}
    }
    
}

export async function codeValidate(formData:ISFrorgotData) {
    try{

        const headerList = await headers();
        const ip = headerList.get("x-forwarded-for")?.split(",")[0] ?? "127.0.0.1";
        
       
        const { success: isCodeAllowed } = await loginRateLimiter.limit(`forgot_code_attempt_${ip}`);
        if (!isCodeAllowed) {
            return { error: "Too many verification attempts. Please try again later." };
        }

        const existCode = await prisma.verificationToken.findUnique({
            where: {
                identifier_token: { 
                    identifier: formData.email,
                    token: formData.code 
                }
            }
        })
        if(!existCode){
            return {error: "code is not valid"}
        }
        return { success: "Code is valide" };
    }catch(error){
        return {error: "error"}
    }
}

       
export async function NewPassword(formData:ISFrorgotData) {
    try {
        if (!formData.password) {
            return { error: "Password is required!" }; 
        } 

        const verificationRecord = await prisma.verificationToken.findUnique({
            where: {
                identifier_token: { 
                    identifier: formData.email,
                    token: formData.code || "" 
                }
            }
        });

        if (!verificationRecord || new Date() > verificationRecord.expires) {
            return { error: "Unauthorised operation. Code is missing or expired." };
        }

        const hashPassword = await bcrypt.hash(formData.password, 10);
        const updatePassword = await prisma.user.update({
            where: {
                 email: formData.email, 
            },
            data: {
                password_hash: hashPassword,
            },
        });

        if(!updatePassword){
           return {error: "Update error"}; 
        }

        await prisma.verificationToken.delete({
            where: { id: verificationRecord.id }
        });

        return { success: "Password changed" };
    } catch(error){
        return {error: "server error"};
    }
}