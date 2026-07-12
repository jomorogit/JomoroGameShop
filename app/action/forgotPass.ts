"use server"

import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { generateVerificationToken } from "@/lib/token";
import { sendVerificationEmail } from "@/lib/mail";
import { ISFrorgotData } from "@/lib/types";

export async function emailValidate(formData:ISFrorgotData) {
    try{
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
    
    try{
        if (!formData.password)
            {
               return { error: "Password is required!" }; 
            } 
         const hashPassword = await bcrypt.hash(formData.password, 10);
        const updatePassword = await prisma.user.update({
            where: {
                 email: formData.email, 
            },
            data: {
                password_hash: hashPassword,
            },
        })
        if(!updatePassword){
           return {error: "Update error"}; 
        }
        return { success: "Passwoed changed" };
    }catch(error){
        return {error: "server error"};
    }
}