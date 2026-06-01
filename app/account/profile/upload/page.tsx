"use client";
import { useState, ChangeEvent, useEffect } from "react";
import { useRouter } from "next/navigation";
import { uploadImage } from "@/app/action/upload"; 
import { useSession } from "next-auth/react";


export default function RemoveModal() {
  // создаем роутер для управлением модальным окном
  const router = useRouter();
  // получаем данные сессии и так же передаем туда метод update
  const { data: session, update } = useSession();

  //useState для проверки того есть ли файл
  const [file, setFile] = useState<File | null>(null);
  //храним временную ссылку на картинку загруженую пользователем
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  //делаем useState загрузки
  const [isUploading, setIsUploading] = useState(false);

  //создаем useEffect для очистки от муссора
  useEffect(() => {
    return () => {
      // если уже есть previewUrl, то удаляем его
      if (previewUrl){
        URL.revokeObjectURL(previewUrl);
      } 
    };
    //заменяем на новый
  }, [previewUrl]);

  //это нужно чтобы сделать замену файла, точнее когда выбираем аватарку, то можем сразу видеть какой она будет 
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    //выбираем первый файл из списка загруженых
    const selectedFile = e.target.files?.[0];
    
    //если файл есть, то удаляем старую ссылку на картинку 
    if (selectedFile) {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      //потом ставим файл selectedFile в useState
      setFile(selectedFile);
      //и меняем ссылку на картинку на новую
      setPreviewUrl(URL.createObjectURL(selectedFile));
    }
  };

  //функция обработки сохранения новой иконки на сервер
  const handleSave = async () => {
    //Делаем проверку того что если нету файла, то ничего не возвращаем
    if (!file) return;
    //забираем у пользователя возможность нажимать на кнопку , ставим загрузку
    setIsUploading(true);

    try {
      //создаем формдату которая нужна для отправки данных на сервер
      const formData = new FormData();
      //прикрипляем туда нашу аватарку (файл)
      formData.append("image", file);
      // потом создаем переменную результат которя нужна чтобы получить фид бек от сервера
      // и вызываем серверную функцию uploadImage с данными из formData
      const result = await uploadImage(formData);

      // если сервер вернул success или ссылку url
      if (result.success && result.url) {
        // то вызываем метод update от сюда const { data: session, update } = useSession();
        await update({
          // обновляет сессию, копирует всё что было в сессии
          ...session,
          // копируем полностью сессию в user , но заменяем у него картинку на result.url, при этом все остальные значения остануться преждними
          user: { ...session?.user, image: result.url },
        });
        //перезапускаем страницу с новыми данными от сервера, меняет аватарку на всех страницах
        //он не делает F5, а просто обновляет данные компонентов 
        router.refresh(); 
        //закрываем модалку и возвращаемся обратно
        router.back();    
      } else {
        //если сервер вернул ошибу , то выводим алерт с ошибкой
        alert(result.error || "Ошибка загрузки ❌");
      }
      //ловим ошибки загрузки на фронтенде
    } catch (error) {
      //если случилась какая-то ошибка загрузки на фронте , то выводим её
      console.error("Upload error:", error);
      alert("Непредвиденная ошибка ⚠️");
      //в конце ставим нашу загрузку на false , что значит что можем опять использовать кнопки
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
      //При клике на пустую область вне модалки перекидывает нас обратно на прошлую страницу
      onClick={() => router.back()}
    >
      <div 
        className="bg-[#251642] p-8 rounded-3xl border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.5)] w-full max-w-[450px]"
        //при клике на модалку нас не должно перекидывать обратно
        onClick={(e) => e.stopPropagation()} 
      >
        <h2 className="text-white text-2xl font-bold mb-6 text-center">Update Avatar</h2>

        <div className="flex flex-col items-center gap-6 mb-8">
          <div className="relative w-40 h-40 rounded-full overflow-hidden border-4 border-purple-500/30 bg-white/5 flex items-center justify-center">

            {/* Выводим показной вариант аватарки , если она загружена, а если нет , то просто аватарку пользователя */}
            {(previewUrl || session?.user?.image) ? (
              <img 
                src={previewUrl || session?.user?.image || ""} 
                alt="Preview" 
                className="w-full h-full object-cover"
              />
              //если аватарки нету, то пишем что её нету 
            ) : (
              <span className="text-white/20 text-sm">No photo</span>
            )}
          </div>

          <div className="flex flex-col gap-3 w-full items-center">
            <label className="cursor-pointer group">
              <span className="bg-white/5 border border-white/10 px-6 py-2 rounded-xl text-white group-hover:bg-white/10 transition-all inline-block">
                Choose New File
              </span>
              {/* создаем инпут куда пользователь сможет загрузить файл */}
              <input 
              //тип делаем по стандарту файл
                type="file" 
                // принимаем только файлы и ничего больше
                accept="image/*" 
                // скрываем стандартный интерфейс ссылки которую дает браузер
                className="hidden" 
                // эта функция говорит браузеру чтобы он следил за этим полем и как только что-то случится чтобы он вызвал функцию handleFileChange
                // эта функция потом удаляет старый url картинки и меняет его на новый
                onChange={handleFileChange} 
                // Если загрузка = true , то ставим disabled, чтобы нельзя было взаимодействовать с кнопкой загрузки нового файла
                disabled={isUploading}
              />
            </label>

           
          </div>
        </div>

        {/* Кнопка назад которая нужна чтобы вызвать router.back и вернуть нас обратно */}
        <div className="flex gap-3">
          <button 
            type="button"
            onClick={() => router.back()}
            // во время загрузки не можем нажать отмена , нужна дождаться когда сервер вернет ответ
            disabled={isUploading}
            className="flex-1 py-3 text-white/50 hover:text-white transition-colors disabled:opacity-30"
          >
            Cancel
          </button>
          
          {/* Кнопка сохранения , вызывает нащу функцию которая обрабатывает файл и делает запрос на сервер */}
          <button 
            type="button"
            //вызываем функцию сохранения
            onClick={handleSave}
            //кнопка не доступна пока нету файла или идёт загрузка
            disabled={!file || isUploading}
            className="flex-1 py-3 bg-purple-600 hover:bg-purple-500 disabled:bg-gray-700 disabled:cursor-not-allowed text-white rounded-xl transition-all shadow-lg shadow-purple-500/20"
          >
            {/* Это текст нашей кнопки который зависит от того происходит ли загрузка или нет */}
            {isUploading ? "Processing..." : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}