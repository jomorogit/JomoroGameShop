"use server"
import { getServerSession } from "next-auth"  
import { authConfig } from "../configs/auth";  
import { prisma } from "@/lib/prisma"; 
import cloudinary from "@/lib/cloudinary"; 
import { UploadApiResponse } from "cloudinary"; 
import { revalidatePath } from "next/cache"; 
import { DEFAULT_AVATAR } from "@/lib/constants"; 

export async function uploadImage(formData: FormData) {
  //получаем сессию пользователя
  const session = await getServerSession(authConfig);
  // если нету сессии или нету пользователя , то выдаем ошибку что пользователь не авторизован
  if (!session?.user?.email) return { error: "Unauthorized" };

  // получаем нашу форм дату из фронтенда, с картинкой внутри
  const file = formData.get("image") as File;
  // проверяем что если картинки нету или если её размер равен нулю , то выдаем ошибку что файл не выбран или пуст
  if (!file || file.size === 0) {
    return { success: false, error: "The file is not selected or is empty." };
  }

  // потом делаем проверку типа файла, он должен быть image, чтобы пользователь не мог загрузить нам например свои скрипты на бекенд
  if (!file.type.startsWith("image/")) {
    return { success: false, error: "Only images are allowed " };
  }

  // после прохождения проверок вызываем нашу основную функцию
  try {
    
    // находим юзера в базе данных и выбираем cloudinary_id со старой аватаркой если она есть
    const currentUser = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { cloudinary_id: true }
    });

    // если не находим пользователя где емейл такой же как в сессии , то отправляем ошибку что пользователь не найден
    if (!currentUser) return { error: "User not found" };

    // создаем буфер так как наш сервер node.js не умеет работать с файлами на прямую, так как для него это двоичный код
    // бефер это временный контейнер куда мы скаладываем эту информацию
    // создаем арейбуфер и передаем туда наш файл чтобы была возможность с ним работать
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // записываем в резульата ответ который мы получим от cloudinary, создаем ему промис в котором передаем информацию
    const result = await new Promise<UploadApiResponse>((resolve, reject) => {
      // загружаем на сервера cloudinary наш файл
      cloudinary.uploader.upload_stream(
        { 
          // Выбираем путь загрузки данных , именно папку
          folder: "avatars", 
          // потом обрабатываем нашу картинку чтобы у неё был размер 500 на 500, crop fill нужен чтобы полностью заполнить нашу область
          // а гравити фейс помогает нам отслеживать лицо и делать фокус на нем
          transformation: [{ width: 500, height: 500, crop: "fill", gravity: "face" }] 
         
        },
        // обработка результата и ошибок
        (error, result) => {
          // если нет результата или есть ошибка вызываем error
          if (error || !result) reject(error); 
          // если ошибок нет , то передаем результат 
          else resolve(result);
        }
        // закрываем буфер чтобы отдать его на обработку , закрывает поток
      ).end(buffer);
    });

    // переходим к оптимизации
    // если у пользователя есть id аватарки , значит что у него была загружена аватарка, а не плейсхолдер
    if (currentUser.cloudinary_id) {
      // то на сервере cloudinary удаляем эту картинку и её id , мы больше не имеем к ней доступ
      cloudinary.uploader.destroy(currentUser.cloudinary_id).catch(err => 
        console.error("Ошибка удаления старого аватара:", err)
      );
    }
  
    // теперь тоже самое делаем с базой данных, вызываем update в котором меняем картинку пользователя и текущий cloudinary_id
    // который помогает отслеживать картинку в базе данных cloudinary
    await prisma.user.update({
      where: { email: session.user.email },
      data: {
        image: result.secure_url,
        cloudinary_id: result.public_id 
      },
    });

    //делаем обновление кеша приложения, чтобы не пришлось перезапускать страницу
    revalidatePath("/", "layout");

  //  возвращаем данные после обработки результата
    return { 
      success: true, 
      url: result.secure_url,
      public_id: result.public_id 
    };
  // ловим ошибки
  } catch (error) {
    console.error("Global upload error:", error);
    return { success: false, error: "Processing error" };
  }
}


//ещё не готово
export async function deleteImage(){
    const session = await getServerSession(authConfig);

  if (!session?.user?.email) return { error: "Unauthorized" };

  try {
    // 1. Сначала находим пользователя, чтобы узнать его старый cloudinary_id
    const currentUser = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { cloudinary_id: true }
    });

    if (!currentUser) return { error: "User not found" };

   // 4. ЕСЛИ ЗАГРУЗКА УСПЕШНА — удаляем старую картинку из облака
    if (currentUser.cloudinary_id) {
      // Мы не ждем (await) удаления, чтобы не тормозить ответ пользователю
      cloudinary.uploader.destroy(currentUser.cloudinary_id).catch(err => 
        console.error("Ошибка удаления старого аватара:", err)
      );
    }

    // 5. Обновляем базу данных, добавляем заготовленный placeHolder
    await prisma.user.update({
      where: { email: session.user.email },
      data: {
        cloudinary_id: null,
        image: DEFAULT_AVATAR,
      },
    });
   
    revalidatePath("/", "layout");

    return { 
      success: true, 
    
    };

  } catch (error) {
    console.error("Global upload error:", error);
    return { success: false, error: "Processing error" };
  }
}
