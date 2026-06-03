import Link from "next/link";

export default function Footer() {
  return (
    <footer className="w-full bg-[#160d1f]/60 border-t border-purple-900/20 px-6 md:px-10 py-8 mt-auto backdrop-blur-sm">
      <div className="max-w-7xl mx-auto flex flex-col items-center gap-8">
        
        {/* Верхняя часть: Ссылки и Платежки */}
        {/* НА МОБИЛЬНЫХ: flex-col с центрированием и хорошим отступом gap-8 */}
        {/* НА ДЕСКТОПАХ: grid из 3 колонок */}
        <div className="w-full flex flex-col items-center text-center gap-8 md:grid md:grid-cols-3 md:items-start md:text-left">
          
          {/* КОЛОНКА 1: SUPPORT */}
          <div className="flex flex-col items-center md:items-start gap-2">
            <h3 className="text-xs lg:text-xl font-semibold text-purple-400 uppercase tracking-wider">
              Support
            </h3>
            <Link 
              href="/information/support" 
              className="text-sm lg:text-xl text-gray-400 hover:text-white transition duration-200"
            >
              FAQ / Contact Support
            </Link>
          </div>

          {/* КОЛОНКА 2: LEGAL */}
          <div className="flex flex-col items-center md:items-start gap-2">
            <h3 className="text-xs lg:text-xl font-semibold text-purple-400 uppercase tracking-wider">
              Legal
            </h3>
            <Link 
              href="/information/privacy" 
              className="text-sm lg:text-xl text-gray-400 hover:text-white transition duration-200"
            >
              Privacy Policy
            </Link>
          </div>

          {/* КОЛОНКА 3: DATA & TRUST */}
          <div className="flex flex-col items-center md:items-end gap-3">
            <h3 className="text-xs font-semibold text-purple-400 uppercase tracking-wider lg:text-xl">
              Data & Trust
            </h3>
            
            {/* Иконки платежных систем */}
            <div className="flex items-center gap-3 bg-[#0d0614]/50 border border-purple-900/30 px-4 py-2 rounded-xl w-fit">
              <span className="text-xs lg:text-xl font-bold text-gray-500 tracking-widest">VISA</span>
              <span className="text-xs lg:text-xl font-bold text-gray-500 tracking-widest">MC</span>
              <span className="text-xs lg:text-xl font-semibold text-gray-500 lowercase">stripe</span>
            </div>
            
            <span className="text-[11px] lg:text-[20px] text-gray-500">
              payments powered by stripe
            </span>
          </div>

        </div>

        {/* Разделительная линия */}
        <div className="w-full h-[1px] bg-purple-900/20" />

       {/* Нижняя часть: Копирайт */}
        <div className="flex flex-col text-center text-xs lg:text-xl text-gray-500 gap-2 px-4">
          <p>
            © {new Date().getFullYear()} GameShop. All Rights Reserved. 
          </p>
          <p className="text-[10px] sm:text-[11px] text-gray-600 leading-relaxed">
            All registered trademarks and game images are property of their respective owners.
          </p>
          {/* Добавляем строчку про демо-статус */}
          <p className="text-[10px] sm:text-[11px] text-amber-600/80 italic font-medium core-tracking">
            This is a non-commercial educational portfolio project. No real purchases can be made.
          </p>
        </div>

      </div>
    </footer>
  );
}