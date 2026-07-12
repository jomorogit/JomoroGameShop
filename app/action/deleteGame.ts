'use server'

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma"; 
import cloudinary from "@/lib/cloudinary"; 


const slugify = (text: string) => {
    return text
        .trim()
        .replace(/\s+/g, '_')
        .replace(/[^a-zA-Z0-9а-яА-Я_]/g, '')
};

export async function DeleteGame(id: number) {
    try {
        const game = await prisma.game.findUnique({
            where: { id: id },
            select: { title: true }
        });

        if (!game) return { success: false, error: "Игра не найдена в базе 👾" };

        // Генерируем путь к папке
        const folderSlug = slugify(game.title);
        const folderPath = `games/${folderSlug}`;

        // 2. Очищаем Cloudinary
        // Сначала удаляем все файлы внутри (по префиксу пути)
        await cloudinary.api.delete_resources_by_prefix(folderPath);
        
        // Затем удаляем саму пустую папку
        // Используем try/catch на случай, если папка уже пуста или не существует
        try {
            await cloudinary.api.delete_folder(folderPath);
        } catch (error) {
            console.warn("Cloudinary file not found");
        }

        // 3. удаляем из базы данных
        await prisma.game.delete({
            where: { id: id }
        });

        revalidatePath("/", "layout");
        return { success: true };

    } catch (error) {
        console.error("DELETE ERROR:", error);
        return { 
            success: false, 
            error: error || "DELETE ERROR" 
        };
    }
}