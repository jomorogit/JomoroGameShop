import { prisma } from "@/lib/prisma";
import crypto from "crypto"; // Встроенный модуль Node.js

export const generateVerificationToken = async (email: string) => {
  const token = crypto.randomInt(100000, 999999).toString();
  const expires = new Date(Date.now() + 3 * 60 * 1000);

  await prisma.verificationToken.deleteMany({
    where: { identifier: email }
  });

  const verificationToken = await prisma.verificationToken.create({
    data: {
      identifier: email,
      token,
      expires,
    }
  });

  return verificationToken;
};