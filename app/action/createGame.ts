"use server"

import { prisma } from "@/lib/prisma"; 
import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import cloudinary from "@/lib/cloudinary";

/**
 * Преобразует строку в безопасный URL-slug.
 * Удаляет спецсимволы и заменяет пробелы на нижнее подчеркивание.
 */
const slugify = (text: string) => {
    return text
        .trim()
        .replace(/\s+/g, '_')           
        .replace(/[^a-zA-Z0-9а-яА-Я_]/g, '') 
};

/**
 * Загружает файл в облачное хранилище Cloudinary через потоковую передачу буфера.
 * Возвращает объект с URL и публичным идентификатором файла или null, если файл отсутствует.
 */
async function uploadToCloudinary(file: File | null, folderPath: string) {
    if (!file || file.size === 0) return null;

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    return new Promise<{ url: string; public_id: string }>((resolve, reject) => {
        // Инициализация потока загрузки в Cloudinary с оптимизацией формата и качества
        cloudinary.uploader.upload_stream(
            { 
                folder: folderPath, 
                transformation: [{ quality: "auto", fetch_format: "auto" }] 
            },
            (error, result) => {
                if (error || !result) reject(error);
                else resolve({ url: result.secure_url, public_id: result.public_id });
            }
        // Передача буфера и закрытие потока
        ).end(buffer);
    });
}

/**
 * Безопасно преобразует значение из FormDataEntryValue в объект Date или null при невалидных данных.
 */
const safeDate = (dateValue: FormDataEntryValue | null): Date | null => {
    if (!dateValue || typeof dateValue !== 'string' || dateValue === "" || dateValue === "null") return null;
    const timestamp = Date.parse(dateValue);
    return Number.isNaN(timestamp) ? null : new Date(timestamp);
};

/**
 * Серверное действие (Server Action) для создания новой записи игры в базе данных.
 * Обрабатывает FormData, выполняет загрузку медиаресурсов и сохраняет реляционную структуру.
 */
export async function createGame(formData: FormData) {
    try {
        // 1. Валидация обязательного поля заголовка и генерация путей для медиафайлов
        const title = formData.get('title') as string;
        if (!title) throw new Error("Title is required");
        
        const folderSlug = slugify(title);
        const baseFolder = `games/${folderSlug}`; // Корневой каталог игры в облачном хранилище

        // 2. Извлечение и десериализация JSON-строк из FormData
        const rawLanguages = formData.get('languages') as string;
        const rawGengres = formData.get('genres') as string;
        const rawRequirements = formData.get('system_requirements') as string; // Извлечение системных требований

        // Парсинг JSON-строк обратно в структурированные массивы данных
        const languages = rawLanguages ? JSON.parse(rawLanguages) as { name: string; has_audio: boolean; has_interface: boolean; has_subtitles: boolean; }[] : [];
        const gengres = rawGengres ? JSON.parse(rawGengres): []; 
        const systemRequirements = rawRequirements ? JSON.parse(rawRequirements) : []; // Парсинг системных требований

        // 3. Параллельная загрузка основных статических изображений в целевые каталоги Cloudinary
        const [cardRes, mainRes, aboutRes] = await Promise.all([
            uploadToCloudinary(formData.get('card_img') as File, `${baseFolder}/card`),
            uploadToCloudinary(formData.get('main_img') as File, `${baseFolder}/banner`),
            uploadToCloudinary(formData.get('about_game_img') as File, `${baseFolder}/about`)
        ]);

        // Фильтрация и загрузка дополнительных скриншотов медиагалереи
        const galleryFiles = formData.getAll('game_images') as File[];
        const galleryUploads = await Promise.all(
            galleryFiles
                .filter(f => f.size > 0)
                .map(f => uploadToCloudinary(f, `${baseFolder}/screenshots`))
        );
        
        // Маппинг успешно загруженных URL-адресов скриншотов
        const galleryUrls = galleryUploads
            .filter((res): res is { url: string; public_id: string } => res !== null)
            .map(res => res.url);

           
        // 4. Транзакционная запись сущности игры и связанных реляционных таблиц в базу данных посредством Prisma
        const newGame = await prisma.game.create({
            data: {
                title: title,
                price_eur: new Prisma.Decimal(Number(formData.get('price_eur')) || 0),
                release_date: safeDate(formData.get('release_date')),
                developer: (formData.get('developer') as string) || null,
                publisher: (formData.get('publisher') as string) || null,
                game_description: (formData.get('game_description') as string) || null,
                features: (formData.get('features') as string) || null,
                discount_percent: Number(formData.get('discount_percent')) || 0,
                about_game: (formData.get('about_game') as string) || null,
                rating_summary: (formData.get('rating_summary') as string) || null,

                // Присвоение URL-ссылок, полученных от API Cloudinary
                main_img: mainRes?.url || null,
                about_game_img: aboutRes?.url || null,
                card_img: cardRes?.url || null,

                // Инсерт связанных записей медиагалереи
                game_media: {
                    create: galleryUrls.map((url) => ({ img_url: url })),
                },

                // Инсерт языковых параметров с условным связыванием или созданием справочника языков
                game_languages: {
                    create: languages.map((lang) => ({
                        has_audio: lang.has_audio,
                        has_interface: lang.has_interface,
                        has_subtitles: lang.has_subtitles,
                        language: {
                            connectOrCreate: {
                                where: { lan_name: lang.name },
                                create: { lan_name: lang.name }
                            }
                        }
                    })),
                },

                // Связывание игры с существующими идентификаторами жанров
                game_genres: {
                    create: gengres.map((id: number) => ({
                        genre_id: id 
                    }))
                },
                
                // Создание записей минимальных и рекомендуемых системных требований для целевых платформ
                system_requirements: { 
                    create: [ {
                    is_recommended: false,
                    os_type: "Windows",
                    cpu: (formData.get("Windows_cpu_minimum")as string) || null,
                    gpu: (formData.get("Windows_gpu_minimum")as string) || null,
                    ram: (formData.get("Windows_ram_minimum")as string) || null,
                    storage: (formData.get("Windows_storage_minimum")as string) || null,
                    },
                    {
                    is_recommended: true,
                    os_type: "Windows",
                    cpu: (formData.get("Windows_cpu_recommended")as string) || null,
                    gpu: (formData.get("Windows_gpu_recommended")as string) || null,
                    ram: (formData.get("Windows_ram_recommended")as string) || null,
                    storage: (formData.get("Windows_storage_recommended")as string) || null,
                    },
                    {
                    is_recommended: false,
                    os_type: "macOS",
                    cpu: (formData.get("Mac_cpu_minimum")as string) || null,
                    gpu: (formData.get("Mac_gpu_minimum")as string) || null,
                    ram: (formData.get("Mac_ram_minimum")as string) || null,
                    storage: (formData.get("Mac_storage_minimum")as string) || null,   
                    },
                    {
                    is_recommended: true,
                    os_type: "macOS",
                    cpu: (formData.get("Mac_cpu_recommended")as string) || null,
                    gpu: (formData.get("Mac_gpu_recommended")as string) || null,
                    ram: (formData.get("Mac_ram_recommended")as string) || null,
                    storage: (formData.get("Mac_storage_recommended")as string) || null,    
                    },
                    {
                    is_recommended: false,
                    os_type: "Linux",
                    cpu: (formData.get("Linux_cpu_minimum")as string) || null,
                    gpu: (formData.get("Linux_gpu_minimum")as string) || null,
                    ram: (formData.get("Linux_ram_minimum")as string) || null,
                    storage: (formData.get("Linux_storage_minimum")as string) || null,
                    },
                    {
                    is_recommended: true,
                    os_type: "Linux",
                    cpu: (formData.get("Linux_cpu_recommended")as string) || null,
                    gpu: (formData.get("Linux_gpu_recommended")as string) || null,
                    ram: (formData.get("Linux_ram_recommended")as string) || null,
                    storage: (formData.get("Linux_storage_recommended")as string) || null,
                    }
                 ]
                }
            },
        });

        revalidatePath("/", "layout"); // Сброс кэша Next.js для обновления данных на клиенте
        return { success: true, id: newGame.id };

    } catch (error) {
        console.error("SERVER ERROR:", error);
        return { success: false, error: error || "Server error" };
    }
}

/**
 * Возвращает массив всех доступных жанров из базы данных (только поля id и name).
 */
export async function GetGangres(){
    const gengres = await prisma.genre.findMany({
        select:{
            name: true,
            id: true
        }        
    });
    return gengres;
}