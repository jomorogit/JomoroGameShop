import { prisma } from "@/lib/prisma";

export const generateVerificationToken = async (email: string) => {
  // Генерируем 6 цифр 
  const token = Math.floor(100000 + Math.random() * 900000).toString();
  // Код будет жить 15 минут
  const expires = new Date(new Date().getTime() + 15 * 60 * 1000);

  // Удаляем старый код для этого email, если он был
  const existingToken = await prisma.verificationToken.findFirst({
    where: { identifier: email }
  });

  if (existingToken) {
  await prisma.verificationToken.delete({
    where: {
      identifier_token: {
        identifier: email,
        token: existingToken.token,
      },
    },
  });
}

  // Создаем новый
  const verficationToken = await prisma.verificationToken.create({
    data: {
      identifier: email,
      token,
      expires,
    }
  });

  return verficationToken;
};