"use server"
import { ISLoginData } from "@/lib/types";
import { prisma } from "@/lib/prisma";
import { generateVerificationToken } from "@/lib/token";
import { sendVerificationEmail } from "@/lib/mail";
import bcrypt from "bcryptjs";

export async function LoginValidation(formData:ISLoginData) {
    try{
        //Ищем емейл который ввел пользователь в базе данных
        const existUser = await prisma.user.findFirst({
            where: {
                email: formData.email,
            }
        })
        //если не нашли выводим ошибку что емейла не существует
        if(!existUser){
            console.log("email not founded");
            return { error: "email not founded" };
        }
        if (!existUser || !existUser.password_hash) {
                return { error: "Неверный логин или пароль" }; 
            }

        //удаляем старый OTP если он до этого был
        await prisma.verificationToken.deleteMany({
            where: { identifier: formData.email },
        });

        const verificationToken = await generateVerificationToken(formData.email);
        await sendVerificationEmail(verificationToken.identifier, verificationToken.token);

        return { success: "Code sent!" };

    }catch(error){
        console.log(error); 
    return { error: "some error" }; 
    }
}

export async function CodeValidate(formData: ISLoginData) {
    try{
        const findUserWidthCode = await prisma.verificationToken.findUnique({
           where: {
                identifier_token: { 
                    identifier: formData.email,
                    token: formData.code 
                }
            }
        })
        if(!findUserWidthCode){
           return { error: "code is not correct" }; 
        }
       
        return { success: "Wellcome" };

    }catch(error){
        return {error: "some error"};

    }
    
}