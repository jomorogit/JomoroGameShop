"use client";

import { useState} from "react";
import { useRouter } from "next/navigation";
import { deleteImage } from "@/app/action/upload";
import { useSession } from "next-auth/react";
import { DEFAULT_AVATAR } from "@/lib/constants";

export default function UploadModal() {
  const router = useRouter();
  const { data: session, update } = useSession();
  const [isUploading, setIsUploading] = useState(false);

 // --- ЛОГИКА УДАЛЕНИЯ ---
//  функция удаления аватара
const handleDelete = async () => {
  // если нет подтвержения от пользователя что он хочет удалить аватар , то ничего не делаем
  if (!confirm("Are you sure you want to delete your avatar? 🗑️")) return;
  // если пользователь нажал что хочет удалить, то ставим загрузку
  setIsUploading(true);
  try {
    // вызываем серверную функцию удаления аватарки
    const result = await deleteImage();

    // если резуотат прошел успешно , то меняем нашу сессию
    if (result.success) {
      await update({
        ...session,
        user: { 
          // оставляем всё как было за исключением аватрки, и ставим туда наш плейс холдер
          ...session?.user, 
          image: DEFAULT_AVATAR 
        },
      });

      // обновляем данные компонентов
      router.refresh();
      // возвращаем пользователя обратно на страницу (закрываем модалку)
      router.back(); 
      // ловим ошибки сервера, если result не success
    } else {
      alert(result.error || "Error deleting");
    }
    // ловии ошиьбки
  } catch (error) {
    console.error("Delete error:", error);
    alert("Something went wrong ⚠️");
  } finally {
    // в конце ставим загрузку на false чтобы кнопки снова работали
    setIsUploading(false);
  }
};

  return (
    <div 
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
      onClick={() => router.back()}
    >
      <div 
        className="bg-[#251642] p-8 rounded-3xl border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.5)] w-full max-w-[450px]"
        onClick={(e) => e.stopPropagation()} 
      >
        <h2 className="text-white text-2xl font-bold mb-6 text-center">Update Avatar 👤</h2>

        <div className="flex flex-col items-center gap-6 mb-8">
          <div className="relative w-40 h-40 rounded-full overflow-hidden border-4 border-purple-500/30 bg-white/5 flex items-center justify-center">
            {/* Показываем либо превью нового файла, либо текущий аватар из сессии */}
            {(session?.user?.image) ? (
              <img 
                src={session?.user?.image || ""} 
                alt="Preview" 
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-white/20 text-sm">No photo 📷</span>
            )}
          </div>

        

            {/* Кнопка удаления, показываем её только если у юзера есть аватар (не дефолтный) */}
            {session?.user?.image && (
                <button 
                  type="button"
                  onClick={handleDelete}
                  // кнопка не доступна во время загрузки
                  disabled={isUploading}
                  className="text-red-400 text-sm hover:text-red-300 transition-colors"
                >
                  Remove current photo
                </button>
            )}


              <button 
                  type="button"
                  onClick={() => router.back()}
                  disabled={isUploading}
                  className="flex-1 py-3 text-white/50 hover:text-white transition-colors disabled:opacity-30"
              >
                  Cancel
              </button>
          </div>
        </div>
      </div>
    
  );
}