
export const createSlug = (str: string): string => {
    return str
        .toLowerCase()
        .replace(/\s+/g, '-')     // Пробелы дефисы
        .replace(/[^\w-]+/g, ''); // Удаляем спецсимволы
};

/**
 * Форматирует цену: 0 превращает в "Free", остальное — в строку с валютой
 */
export const formatPrice = (price: number | undefined | null): string => {
    const safePrice = price || 0;
    return safePrice === 0 ? "Free" : `${safePrice.toFixed(2)} €`;
};

/**
 * Генерирует путь к игре по ID и заголовку
 */
export const generateGameHref = (id: string | number, title: string): string => {
    const slug = createSlug(title);
    return `/${id}-${slug}`;
};


export const generateGameHrefAdmin = (id: string | number, title: string): string => {
    const slug = createSlug(title);
    return `/account/admin/edit-game/${id}-${slug}`;
};