import { prisma } from '@/lib/prisma'; 
import { authConfig } from "../../configs/auth";
import { getServerSession } from "next-auth"
import { CreditCard, Wallet, Gamepad2 } from 'lucide-react';

// Функция для динамического выбора иконки с адаптивными размерами
const getTransactionIcon = (type: string) => {
  const iconClass = "w-8 h-8 sm:w-10 sm:h-10";
  
  switch (type.toLowerCase()) {
    case 'deposit':
      return <Wallet className={`${iconClass} text-emerald-500`} />; // Кошелёк для пополнений 
    case 'purchase':
      return <Gamepad2 className={`${iconClass} text-purple-400`} />; // Геймпад для покупки игр 
    default:
      return <CreditCard className={`${iconClass} text-gray-400`} />;
  }
};

export default async function page() {
  const session = await getServerSession(authConfig);

  if (!session?.user?.email) {
    return (
      <div className="w-full text-center p-4">
        <p className="text-red-500 font-bold">User is not authorized</p>
      </div>
    );
  }

  const transactions = await prisma.transaction.findMany({
    where: {
      user_id: Number(session.user.id),
    },
    include: {
      transaction_games: { 
        include: {
          game: { 
            select: {
              title: true,
            },
          },
        },
      },
    },
    orderBy: {
      created_at: 'desc', 
    }
  });

  if (!transactions || transactions.length === 0) {
    return (
      <div className="w-full text-center p-4">
        <p className="text-gray-500">You don&apos;t have transactions yet.</p>
      </div>
    );
  }

  const formatter = new Intl.DateTimeFormat('en-US', {
    month: 'short',    
    day: 'numeric',    
    year: 'numeric',   
    hour: 'numeric',   
    minute: '2-digit', 
    hour12: true       
  });

  return (
    <div className='w-full h-auto space-y-4'>
        {transactions.map((transaction) => {
          return (
            <div 
              key={transaction.id} 
              className='w-full h-auto bg-[#160d1f]/40 backdrop-blur-sm rounded-2xl flex border border-purple-900/40 justify-between items-center p-3 sm:p-4 gap-4 hover:border-purple-800/60 transition-colors duration-200'
            >
              {/* Левая часть: Динамическая иконка + Инфо */}
              <div className='flex-1 flex items-center min-w-0 gap-4'>
                
                {/* Круглый темный контейнер-подложка под иконку для глубины интерфейса */}
                <div className='shrink-0 w-12 h-12 sm:w-16 sm:h-16 bg-[#0d0614]/80 border border-purple-900/30 rounded-xl flex items-center justify-center'>
                  {getTransactionIcon(transaction.payment_type)}
                </div>
                
                {/* Текстовый контейнер */}
                <div className='flex-1 min-w-0'> 
                  <div className="text-sm md:text-xl font-medium text-gray-100 truncate w-full">
                    {transaction.payment_type === "Deposit" ? (
                      <span>Deposit Balance</span>
                    ) : (
                      transaction.transaction_games.map((tg, index) => (
                        <span key={index}>
                          {tg.game?.title}{index < transaction.transaction_games.length - 1 ? ', ' : ''}
                        </span>
                      ))
                    )}
                  </div>

                  {/* Сделали подписи контрастнее для тёмного UI 👑 */}
                  <p className="text-purple-400/80 text-xs md:text-sm font-medium mt-0.5">{transaction.payment_type}</p>
                  <p className="text-gray-400 text-[11px] md:text-xs mt-0.5">{formatter.format(transaction.created_at)}</p>
                </div>
              </div>

              {/* Правая часть: Цена и Статус */}
              <div className='shrink-0 text-right min-w-[80px] sm:min-w-[100px] flex flex-col items-end justify-center ml-2'>
                {transaction.payment_type === "Purchase" && (
                  <p className='text-sm sm:text-base font-semibold text-red-500 md:text-xl'>-{Number(transaction.amount_eur)} €</p>
                )}

                {transaction.payment_type === "Deposit" && (
                  <p className='text-sm sm:text-base font-semibold text-emerald-500 md:text-xl'>+{Number(transaction.amount_eur)} €</p>
                )}

                {transaction.stripe_session_id && (
                  <p className='text-[14px] sm:text-xs text-gray-400 font-medium mt-1 bg-purple-950/30 border border-purple-900/40 px-2 py-0.5 rounded-md'>
                    Completed
                  </p>
                )}  
              </div>
            
            </div>
          );
        })}
    </div>
  )
}