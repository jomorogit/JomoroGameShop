"use client"; 
import React, { useState, useEffect } from 'react';
import { useRouter } from "next/navigation"; 
import { createGame, GetGangres } from '@/app/action/createGame'; 
import { generateFullGameData } from '@/lib/gemini'; 
import { GeminiIcon } from '@/app/components/GeminiIcon'; 

interface Genre {
    id: number;
    name: string;
}

const LANGUAGES = ["English", "Ukranian", "French", "Italian", "German"]; 

type FormInputProps = {
    name: string;
    label: string;
    type?: string;
    required?: boolean;
    multiple?: boolean;
    value?: string;
    defaultValue?: number;
    isLoading?: boolean;
    onChange?: React.ChangeEventHandler<HTMLInputElement | HTMLTextAreaElement>;
};

const FormInput = ({ name, label, type = "text", required = false, multiple = false, value, onChange, defaultValue, isLoading }: FormInputProps) => {
    
    // Определение типа поля ввода: стандартный input или textarea
    const isTextArea = type !== "file" && (
        type === "textarea" || 
        name === 'game_description' || 
        name === 'about_game' || 
        name === 'features'
    );

    return (
        <div className="flex flex-col mb-6">
            {/* Текстовая метка элемента формы */}
            <label className="mb-2 text-white/50 text-xs uppercase tracking-widest ml-1">{label}</label>
            
            {isTextArea ? (
                // Многострочное текстовое поле
                <textarea 
                    name={name}
                    placeholder={label}
                    required={required}
                    disabled={isLoading} // Блокировка ввода на время отправки данных на сервер
                    value={value} // Управляемое React состояние значения поля
                    onChange={onChange} // Обработчик изменения значения
                    className="p-4 bg-white/5 border border-white/10 rounded-2xl text-white outline-none focus:border-purple-500 transition-all min-h-[220px] resize-none "
                />
            ) : (
                // Стандартное поле ввода text, date, file, number
                <input 
                    name={name}
                    type={type} 
                    multiple={multiple} // Атрибут множественного выбора файлов для медиагалереи
                    placeholder={type === "file" ? "" : label} 
                    required={required}
                    disabled={isLoading}
                    defaultValue={defaultValue} 
                    value={type !== "file" ? value : undefined} // Исключение передачи значения для input[type="file"]
                    onChange={onChange}
                    className="p-4 bg-white/5 border border-white/10 rounded-2xl text-white outline-none focus:border-purple-500 transition-all file:bg-purple-500 file:rounded-full file:text-white file:px-4 file:py-1 cursor-pointer"
                />
            )}
        </div>
    );
};

// Корневой компонент страницы создания игры
export default function CreateGame() {
    const router = useRouter(); 
    const [isLoading, setIsLoading] = useState(false); 
    
    // Состояние данных, генерируемых интеграцией с нейросетью
    const [aiData, setAiData] = useState({
        developer: "",
        game_description: "",
        about_game: "",
        features: "",
        publisher: "",
        release_date: "",
        genres: [] as number[],
        Windows_cpu_minimum: "",
        Windows_gpu_minimum: "",
        Windows_ram_minimum: "",
        Windows_storage_minimum: "",
        Windows_cpu_recommended: "",
        Windows_gpu_recommended: "",
        Windows_ram_recommended: "",
        Windows_storage_recommended: "",
        Mac_cpu_minimum: "",
        Mac_gpu_minimum: "",
        Mac_ram_minimum: "",
        Mac_storage_minimum: "",
        Mac_cpu_recommended: "",
        Mac_gpu_recommended: "",
        Mac_ram_recommended: "",
        Mac_storage_recommended: "",
        Linux_cpu_minimum: "",
        Linux_gpu_minimum: "",
        Linux_ram_minimum: "",
        Linux_storage_minimum: "",
        Linux_cpu_recommended: "",
        Linux_gpu_recommended: "",
        Linux_ram_recommended: "",
        Linux_storage_recommended: "",
        rating_summary: "",
        price_eur: "",
    });

    const [title, setTitle] = useState(""); // Состояние пользовательского ввода названия игры
    const [showGeminiBtn, setShowGeminiBtn] = useState(false); //Gemini API
    const [isAiLoading, setIsAiLoading] = useState(false);
    const [genres, setGenres] = useState<Genre[]>([]); // Массив доступных жанров из репозитория БД

    // Задержка отображения кнопки автозаполнения debounce
    useEffect(() => {
        if (title.length < 3) {
            setShowGeminiBtn(false);
            return;
        }
        const timer = setTimeout(() => setShowGeminiBtn(true), 700); 
        return () => clearTimeout(timer); 
    }, [title]);

    // Typewriter UI
    const animateText = (fieldName: string, fullText: string) => {
        let currentText = "";
        let index = 0;
        const speed = 10; // Интервал отрисовки символов в миллисекундах

        setAiData(prev => ({ ...prev, [fieldName]: "" })); // Сброс текущего значения поля

        const interval = setInterval(() => {
            if (index < fullText.length) {
                currentText += fullText[index];
                setAiData(prev => ({
                    ...prev,
                    [fieldName]: currentText // Обновление состояния по мере ввода
                }));
                index++;
            } else {
                clearInterval(interval); // Завершение анимации при достижении конца строки
            }
        }, speed);
    };
    
    // Обработчик запроса и парсинга данных из Gemini API
    const handleAiFill = async () => {
        if (!title) return;
        setIsAiLoading(true); 
        try {
            const result = await generateFullGameData(title); // Запрос к серверному модулю интеграции
            if (result.success && result.data) {
                const { developer, game_description, about_game, features, publisher, release_date, genres,
                Windows_cpu_minimum, Windows_gpu_minimum, Windows_ram_minimum, Windows_storage_minimum, Windows_cpu_recommended,
                Windows_gpu_recommended, Windows_ram_recommended, Windows_storage_recommended, Mac_cpu_minimum, Mac_gpu_minimum,
                Mac_ram_minimum, Mac_storage_minimum, Mac_cpu_recommended, Mac_gpu_recommended, Mac_ram_recommended, Mac_storage_recommended,
                Linux_cpu_minimum, Linux_gpu_minimum, Linux_ram_minimum, Linux_storage_minimum, Linux_cpu_recommended, Linux_gpu_recommended,
                Linux_ram_recommended, Linux_storage_recommended, rating_summary, price_eur,
                } = result.data;
                
                // Инициализация анимации вывода для текстовых блоков
                if (developer) animateText("developer", developer);
                if (game_description) animateText("game_description", game_description);
                if (about_game) animateText("about_game", about_game);
                if (features) animateText("features", features);
                if (publisher) animateText("publisher", publisher);
                
                // Статическое присвоение идентификаторов жанров (требует тип Number)
                if (Array.isArray(genres)) {
                    setAiData(prev => ({ ...prev, genres: genres.map(Number) }));
                }

                // Валидация формата даты (YYYY-MM-DD)
                if (release_date && release_date.match(/^\d{4}-\d{2}-\d{2}$/)) {
                    setAiData(prev => ({ ...prev, release_date: release_date }));
                } else {
                    setAiData(prev => ({ ...prev, release_date: "" }));
                }
                
                // Системные требования: Windows
                if (Windows_cpu_minimum) animateText("Windows_cpu_minimum", Windows_cpu_minimum);  
                if (Windows_gpu_minimum) animateText("Windows_gpu_minimum", Windows_gpu_minimum);  
                if (Windows_ram_minimum) animateText("Windows_ram_minimum", Windows_ram_minimum);  
                if (Windows_storage_minimum) animateText("Windows_storage_minimum", Windows_storage_minimum);  
                if (Windows_cpu_recommended) animateText("Windows_cpu_recommended", Windows_cpu_recommended);  
                if (Windows_gpu_recommended) animateText("Windows_gpu_recommended", Windows_gpu_recommended);
                if (Windows_ram_recommended) animateText("Windows_ram_recommended", Windows_ram_recommended); 
                if (Windows_storage_recommended) animateText("Windows_storage_recommended", Windows_storage_recommended);   

                // Системные требования: MacOS
                if (Mac_cpu_minimum) animateText("Mac_cpu_minimum", Mac_cpu_minimum);  
                if (Mac_gpu_minimum) animateText("Mac_gpu_minimum", Mac_gpu_minimum);  
                if (Mac_ram_minimum) animateText("Mac_ram_minimum", Mac_ram_minimum);  
                if (Mac_storage_minimum) animateText("Mac_storage_minimum", Mac_storage_minimum);  
                if (Mac_cpu_recommended) animateText("Mac_cpu_recommended", Mac_cpu_recommended);  
                if (Mac_gpu_recommended) animateText("Mac_gpu_recommended", Mac_gpu_recommended);
                if (Mac_ram_recommended) animateText("Mac_ram_recommended", Mac_ram_recommended); 
                if (Mac_storage_recommended) animateText("Mac_storage_recommended", Mac_storage_recommended);

                // Системные требования: Linux     
                if (Linux_cpu_minimum) animateText("Linux_cpu_minimum", Linux_cpu_minimum);  
                if (Linux_gpu_minimum) animateText("Linux_gpu_minimum", Linux_gpu_minimum);  
                if (Linux_ram_minimum) animateText("Linux_ram_minimum", Linux_ram_minimum);  
                if (Linux_storage_minimum) animateText("Linux_storage_minimum", Linux_storage_minimum);  
                if (Linux_cpu_recommended) animateText("Linux_cpu_recommended", Linux_cpu_recommended);  
                if (Linux_gpu_recommended) animateText("Linux_gpu_recommended", Linux_gpu_recommended);
                if (Linux_ram_recommended) animateText("Linux_ram_recommended", Linux_ram_recommended); 
                if (Linux_storage_recommended) animateText("Linux_storage_recommended", Linux_storage_recommended);

                if (rating_summary) animateText("rating_summary", rating_summary);
                if (price_eur) animateText("price_eur", price_eur);
            } else {
                alert(result.error || "An error occurred while generating");
            }
        } catch (error) {
            console.error("Ошибка:", error);
        } finally {
            setIsAiLoading(false); // Завершение процесса загрузки ИИ
        }
    };
    
    // Обработка отправки формы и сериализация данных перед отправкой в Server Action
    const handleFormSubmit = async (formData: FormData) => {
        setIsLoading(true); 
        try {
            // Формирование структуры локализации на основе выбранных чекбоксов
            const languagesData = LANGUAGES.map(lang => ({
                name: lang,
                has_audio: formData.get(`lang_${lang}_audio`) === 'on',
                has_interface: formData.get(`lang_${lang}_interface`) === 'on',
                has_subtitles: formData.get(`lang_${lang}_subtitles`) === 'on',
            })).filter(l => l.has_audio || l.has_interface || l.has_subtitles); // Исключение языков без выбранных параметров

            const System_req_windows_minimal = {
                is_recommended: false,
                os_type: "Windows",
                cpu: formData.get("Windows_cpu_minimum"),
                gpu: formData.get("Windows_gpu_minimum"),
                ram: formData.get("Windows_ram_minimum"),
                storage: formData.get("Windows_storage_minimum"),
            }

            const System_req_windows_recommended = {
                is_recommended: true,
                os_type: "Windows",
                cpu: formData.get("Windows_cpu_recommended"),
                gpu: formData.get("Windows_gpu_recommended"),
                ram: formData.get("Windows_ram_recommended"),
                storage: formData.get("Windows_storage_recommended"),
            }

            const System_req_mac_minimal = {
                is_recommended: false,
                os_type: "macOS",
                cpu: formData.get("Mac_cpu_minimum"),
                gpu: formData.get("Mac_gpu_minimum"),
                ram: formData.get("Mac_ram_minimum"),
                storage: formData.get("Mac_storage_minimum"),
            }

            const System_req_mac_recommended = {
                is_recommended: true,
                os_type: "macOS",
                cpu: formData.get("Mac_cpu_recommended"),
                gpu: formData.get("Mac_gpu_recommended"),
                ram: formData.get("Mac_ram_recommended"),
                storage: formData.get("Mac_storage_recommended"),
            }

            const System_req_linux_minimal = {
                is_recommended: false,
                os_type: "Linux",
                cpu: formData.get("Linux_cpu_minimum"),
                gpu: formData.get("Linux_gpu_minimum"),
                ram: formData.get("Linux_ram_minimum"),
                storage: formData.get("Linux_storage_minimum"),
            }

            const System_req_linux_recommended = {
                is_recommended: true,
                os_type: "Linux",
                cpu: formData.get("Linux_cpu_recommended"),
                gpu: formData.get("Linux_gpu_recommended"),
                ram: formData.get("Linux_ram_recommended"),
                storage: formData.get("Linux_storage_recommended"),
            }

            // Сбор идентификаторов выбранных жанров
            const selectedGenreIds = formData.getAll('genres').map(id => Number(id));
            
            // Сериализация объектов и массивов в JSON-строки для передачи через FormData
            formData.set('languages', JSON.stringify(languagesData));
            formData.set('genres', JSON.stringify(selectedGenreIds));

            formData.set('System_req_windows_minimal', JSON.stringify(System_req_windows_minimal));
            formData.set('System_req_windows_recommended', JSON.stringify(System_req_windows_recommended));

            formData.set('System_req_mac_minimal', JSON.stringify(System_req_mac_minimal));
            formData.set('System_req_mac_recommended', JSON.stringify(System_req_mac_recommended));

            formData.set('System_req_linux_minimal', JSON.stringify(System_req_linux_minimal));
            formData.set('System_req_linux_recommended', JSON.stringify(System_req_linux_recommended));

            // Вызов серверного метода для сохранения сущности в БД 
            const result = await createGame(formData); 
            
            if (result?.success) {
                alert("The game has been successfully created!");
                router.push('/account/admin'); // Редирект в панель администратора
                router.refresh(); // Принудительное обновление данных текущего роута
            } else {
                alert(result?.error || "Error creating game");
            }
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };
    
    // Первичный запрос справочника жанров при монтировании компонента
    useEffect(() => {
        GetGangres().then(setGenres).catch(console.error);
    }, []);
   
    // Управление состояниями лоадера внутри компонента CreateGame
    const [loadingText, setLoadingText] = useState("Thinking...");

    useEffect(() => {
        let interval: NodeJS.Timeout;

        if (isAiLoading) {
            // Массив стадий анимации текстового индикатора
            const stages = ["Thinking...", "Thinking..", "Thinking.", "Thinking.."];
            let step = 0;

            interval = setInterval(() => {
                step = (step + 1) % stages.length;
                setLoadingText(stages[step]);
            }, 400); 
        }

        return () => clearInterval(interval);
    }, [isAiLoading]);

    return (
        <div className='w-full h-auto bg-[#23122E] rounded-2xl p-10 text-white'>
            {/* Секция заголовка и элементов управления интеграцией */}
            <div className="flex justify-between items-start mb-10">
                <h1 className='text-4xl font-bold'>Create New Game</h1>
                
                {/* Компонент с анимацией плавного появления кнопки ИИ */}
                <div className={`transition-all duration-500 ${showGeminiBtn ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4 pointer-events-none'}`}>
                   <button
                        type="button"
                        onClick={handleAiFill}
                        disabled={isAiLoading}
                        className="group bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-3 rounded-xl font-bold flex items-center gap-3 hover:scale-105 active:scale-95 transition-all shadow-lg shadow-purple-500/20 disabled:grayscale min-w-[180px]"
                    >
                        <GeminiIcon className={`w-5 h-5 ${isAiLoading ? "animate-pulse text-blue-200" : ""}`} />
                        <span className="tracking-wide">{isAiLoading ? loadingText : "Fill with Gemini"}</span>
                    </button>
                </div>
            </div>

            <form action={handleFormSubmit} className='flex flex-col'>
                {/* Сетка элементов ввода формы */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10">
                    <div className="flex flex-col mb-6">
                        <label className="mb-2 text-white/50 text-xs uppercase tracking-widest ml-1">Game Title</label>
                        <input 
                            name="title" 
                            type="text"
                            required
                            value={title}
                            onChange={(e) => setTitle(e.target.value)} // Синхронизация пользовательского ввода со стейтом компонента
                            placeholder="Enter game title..."
                            className="p-4 bg-white/5 border border-white/10 rounded-2xl text-white outline-none focus:border-purple-500 transition-all"
                        />
                    </div>
                  
                    <FormInput 
                        name="price_eur" 
                        label="price" 
                        required 
                        value={aiData.price_eur} // Значение может быть переопределено данными от ИИ
                        isLoading={isLoading}
                        onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setAiData({...aiData, price_eur: e.target.value})} // Возможность ручной корректировки значения
                    />

                    <FormInput 
                        name="developer" 
                        label="Developer" 
                        required 
                        value={aiData.developer} // Значение может быть переопределено данными от ИИ
                        isLoading={isLoading}
                        onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setAiData({...aiData, developer: e.target.value})} // Возможность ручной корректировки значения
                    />
                    
                    {/* Секция полей, управляемых ИИ */}
                    <FormInput 
                        name="publisher" 
                        label="Publisher" 
                        value={aiData.publisher}
                        isLoading={isLoading}
                        onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setAiData({...aiData, publisher: e.target.value})}
                        required
                    />

                    <FormInput 
                        name="release_date" 
                        label="release_date" 
                        value={aiData.release_date}
                        isLoading={isLoading}
                        onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setAiData({...aiData, release_date: e.target.value})}
                        required
                        type="date"
                    />

                    <FormInput name="discount_percent" label="Discount %" type="number" defaultValue={0} isLoading={isLoading} />
                    
                    {/* Элементы управления для загрузки бинарных файлов */}
                    <FormInput name="card_img" label="Card Image (Vertical)" type="file" required isLoading={isLoading} />
                    <FormInput name="main_img" label="Main Banner" type="file" required isLoading={isLoading} />
                    <FormInput name="about_game_img" label="About Section Image" type="file" required isLoading={isLoading} />
                    <FormInput name="game_images" label="Gallery Screenshots" type="file" required multiple isLoading={isLoading} />
                </div>

                {/* Блоки текстовых полей большой емкости*/}
                <FormInput 
                    name="game_description" 
                    label="Short Description" 
                    value={aiData.game_description}
                    isLoading={isLoading}
                    onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setAiData({...aiData, game_description: e.target.value})}
                />
                <FormInput 
                    name="about_game" 
                    label="Full 'About' Description" 
                    value={aiData.about_game}
                    isLoading={isLoading}
                    onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setAiData({...aiData, about_game: e.target.value})}
                />
                <FormInput 
                    name="features" 
                    label="Features (Bullet points)" 
                    value={aiData.features}
                    isLoading={isLoading}
                    onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setAiData({...aiData, features: e.target.value})}
                />

                <FormInput 
                    name="rating_summary" 
                    label="rating_summary" 
                    value={aiData.rating_summary}
                    isLoading={isLoading}
                    onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setAiData({...aiData, rating_summary: e.target.value})}
                />

                {/* Блок выбора поддерживаемых языковых локализаций на основе итерации массива LANGUAGES */}
                <h2 className='text-3xl mb-6 mt-10 border-b border-white/10 pb-4'>Languages Support</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
                    {LANGUAGES.map((lang) => (
                        <div key={lang} className="p-4 bg-white/5 rounded-2xl border border-white/5">
                            <p className='text-xl mb-4 font-semibold text-purple-400'>{lang}</p>
                            <div className="flex flex-col gap-3">
                                {['audio', 'interface', 'subtitles'].map(type => (
                                    <label key={type} className="flex items-center gap-3 text-white/70 text-sm cursor-pointer hover:text-white transition-colors">
                                        <input type="checkbox" name={`lang_${lang}_${type}`} className="w-5 h-5 accent-purple-500 rounded" />
                                        {type.charAt(0).toUpperCase() + type.slice(1)}
                                    </label>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Блок выбора жанров на основе данных, полученных асинхронно методом GetGangres */}
                <h2 className='text-3xl mb-6 mt-10 border-b border-white/10 pb-4'>Genres</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
                    {genres.map((geng) => (
                        <label key={geng.id} className={`flex items-center gap-3 p-3 rounded-xl border transition-all cursor-pointer ${
                            aiData.genres.includes(geng.id) ? 'bg-purple-500/20 border-purple-500' : 'bg-white/5 border-white/5 hover:bg-white/10'
                        }`}>
                            <input 
                                type="checkbox" 
                                name="genres" 
                                value={geng.id} 
                                className="w-5 h-5 accent-purple-500 rounded"
                                // Проверка флага выбора жанра со стороны ИИ или пользователя
                                checked={aiData.genres.includes(geng.id)} 
                                // Логика интерактивного переключения состояний чекбоксов вручную
                                onChange={(e) => {
                                    const isChecked = e.target.checked;
                                    setAiData(prev => ({
                                        ...prev,
                                        genres: isChecked 
                                            ? [...prev.genres, geng.id] // Добавление ID в массив выбранных элементов
                                            : prev.genres.filter(id => id !== geng.id) // Удаление ID из массива
                                    }));
                                }}
                            />
                            <span className="text-sm">{geng.name}</span>
                        </label>
                    ))}
                </div>
                
                <h2 className='text-3xl mb-6 mt-10 border-b border-white/10 pb-4'>System Requirements</h2>

                <p className='text-3xl mb-6 mt-10'>Windows</p>
                {/* Конфигурация системных требований для ОС Windows */}
                <div className='flex'>
                    <div className='w-[50%] pr-10'>
                        <p>Minimum:</p>
                        <FormInput 
                                name="Windows_cpu_minimum" 
                                label="Cpu" 
                                value={aiData.Windows_cpu_minimum}
                                isLoading={isLoading}
                                onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setAiData({...aiData, Windows_cpu_minimum: e.target.value})}
                            />

                        <FormInput 
                                name="Windows_gpu_minimum" 
                                label="Gpu" 
                                value={aiData.Windows_gpu_minimum}
                                isLoading={isLoading}
                                onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setAiData({...aiData, Windows_gpu_minimum: e.target.value})}
                            />

                         <FormInput 
                                name="Windows_ram_minimum" 
                                label="Ram" 
                                value={aiData.Windows_ram_minimum}
                                isLoading={isLoading}
                                onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setAiData({...aiData, Windows_ram_minimum: e.target.value})}
                            />

                        <FormInput 
                                name="Windows_storage_minimum" 
                                label="Storage" 
                                value={aiData.Windows_storage_minimum}
                                isLoading={isLoading}
                                onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setAiData({...aiData, Windows_storage_minimum: e.target.value})}
                            />
                    </div>

                    <div className='w-[50%]' >
                        <p>Recommended:</p>

                        <FormInput 
                                name="Windows_cpu_recommended" 
                                label="Cpu" 
                                value={aiData.Windows_cpu_recommended}
                                isLoading={isLoading}
                                onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setAiData({...aiData, Windows_cpu_recommended: e.target.value})}
                            />
                         <FormInput 
                                name="Windows_gpu_recommended" 
                                label="Gpu" 
                                value={aiData.Windows_gpu_recommended}
                                isLoading={isLoading}
                                onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setAiData({...aiData, Windows_gpu_recommended: e.target.value})}
                            />
                        
                        <FormInput 
                                name="Windows_ram_recommended" 
                                label="Ram" 
                                value={aiData.Windows_ram_recommended}
                                isLoading={isLoading}
                                onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setAiData({...aiData, Windows_ram_recommended: e.target.value})}
                            />

                        <FormInput 
                                name="Windows_storage_recommended" 
                                label="Storage" 
                                value={aiData.Windows_storage_recommended}
                                isLoading={isLoading}
                                onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setAiData({...aiData, Windows_storage_recommended: e.target.value})}
                            />    
                    </div>
                </div>

                <p className='text-3xl mb-6 mt-10'>MacOS</p>
                {/* Конфигурация системных требований для ОС macOS */}
                <div className='flex'>
                    <div className='w-[50%] pr-10'>
                        <p>Minimum:</p>
                            
                            <FormInput 
                                name="Mac_cpu_minimum" 
                                label="Cpu" 
                                value={aiData.Mac_cpu_minimum}
                                isLoading={isLoading}
                                onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setAiData({...aiData, Mac_cpu_minimum: e.target.value})}
                            />
                            
                            <FormInput 
                                name="Mac_gpu_minimum" 
                                label="Gpu" 
                                value={aiData.Mac_gpu_minimum}
                                isLoading={isLoading}
                                onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setAiData({...aiData, Mac_gpu_minimum: e.target.value})}
                            />

                            <FormInput 
                                name="Mac_ram_minimum" 
                                label="Ram" 
                                value={aiData.Mac_ram_minimum}
                                isLoading={isLoading}
                                onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setAiData({...aiData, Mac_ram_minimum: e.target.value})}
                            />
                        
                             <FormInput 
                                name="Mac_storage_minimum" 
                                label="Storage" 
                                value={aiData.Mac_storage_minimum}
                                isLoading={isLoading}
                                onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setAiData({...aiData, Mac_storage_minimum: e.target.value})}
                            />
                    </div>

                    <div className='w-[50%]' >
                        <p>Recommended:</p>
                        <FormInput 
                                name="Mac_cpu_recommended" 
                                label="Cpu" 
                                value={aiData.Mac_cpu_recommended}
                                isLoading={isLoading}
                                onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setAiData({...aiData, Mac_cpu_recommended: e.target.value})}
                            />

                        <FormInput 
                                name="Mac_gpu_recommended" 
                                label="Gpu" 
                                value={aiData.Mac_gpu_recommended}
                                isLoading={isLoading}
                                onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setAiData({...aiData, Mac_gpu_recommended: e.target.value})}
                            />
                        
                         <FormInput 
                                name="Mac_ram_recommended" 
                                label="Ram" 
                                value={aiData.Mac_ram_recommended}
                                isLoading={isLoading}
                                onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setAiData({...aiData, Mac_ram_recommended: e.target.value})}
                            />
                          <FormInput 
                                name="Mac_storage_recommended" 
                                label="Storage" 
                                value={aiData.Mac_storage_recommended}
                                isLoading={isLoading}
                                onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setAiData({...aiData, Mac_storage_recommended: e.target.value})}
                            /> 
                    </div>
                </div>
                
                <p className='text-3xl mb-6 mt-10'>Linux</p>
                {/* Конфигурация системных требований для ОС Linux */}
                <div className='flex'>
                    <div className='w-[50%] pr-10'>
                        <p>Minimum:</p>
                        <FormInput 
                                name="Linux_cpu_minimum" 
                                label="Cpu" 
                                value={aiData.Linux_cpu_minimum}
                                isLoading={isLoading}
                                onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setAiData({...aiData, Linux_cpu_minimum: e.target.value})}
                            /> 
                        
                        <FormInput 
                                name="Linux_gpu_minimum" 
                                label="Gpu" 
                                value={aiData.Linux_gpu_minimum}
                                isLoading={isLoading}
                                onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setAiData({...aiData, Linux_gpu_minimum: e.target.value})}
                            />

                        <FormInput 
                                name="Linux_ram_minimum" 
                                label="Ram" 
                                value={aiData.Linux_ram_minimum}
                                isLoading={isLoading}
                                onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setAiData({...aiData, Linux_ram_minimum: e.target.value})}
                            />

                         <FormInput 
                                name="Linux_storage_minimum" 
                                label="Storage" 
                                value={aiData.Linux_storage_minimum}
                                isLoading={isLoading}
                                onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setAiData({...aiData, Linux_storage_minimum: e.target.value})}
                            />  
                    </div>

                    <div className='w-[50%]' >
                        <p>Recommended:</p>

                         <FormInput 
                                name="Linux_cpu_recommended" 
                                label="Cpu" 
                                value={aiData.Linux_cpu_recommended}
                                isLoading={isLoading}
                                onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setAiData({...aiData, Linux_cpu_recommended: e.target.value})}
                            /> 
                        
                         <FormInput 
                                name="Linux_gpu_recommended" 
                                label="Gpu" 
                                value={aiData.Linux_gpu_recommended}
                                isLoading={isLoading}
                                onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setAiData({...aiData, Linux_gpu_recommended: e.target.value})}
                            /> 
                         <FormInput 
                                name="Linux_ram_recommended" 
                                label="Ram" 
                                value={aiData.Linux_ram_recommended}
                                isLoading={isLoading}
                                onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setAiData({...aiData, Linux_ram_recommended: e.target.value})}
                            />

                         <FormInput 
                                name="Linux_storage_recommended" 
                                label="Storage" 
                                value={aiData.Linux_storage_recommended}
                                isLoading={isLoading}
                                onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setAiData({...aiData, Linux_storage_recommended: e.target.value})}
                            />  
                    </div>
                </div>

                {/* Кнопка отправки формы на публикацию */}
                <button 
                    type='submit' 
                    disabled={isLoading} // Блокировка вызова до окончания процессов выгрузки медиафайлов и обновления БД
                    className='bg-purple-600 hover:bg-purple-500 py-6 rounded-2xl text-2xl font-bold transition-all active:scale-95 shadow-lg shadow-purple-500/20 disabled:opacity-50'
                >
                    {isLoading ? "Uploading Data..." : "Publish Game "}
                </button>
            </form>
        </div>
    );
}