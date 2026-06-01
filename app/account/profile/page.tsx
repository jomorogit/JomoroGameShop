import Link from "next/link"
import { getServerSession } from "next-auth"
import { authConfig } from "../../configs/auth";
import Avatar from "@/app/icons/avatar.webp"
import Image from "next/image"
export default async function Account(){
 const session = await getServerSession(authConfig);   

    return(
        <div className="bg-[#23122E] p-5 w-full h-auto mr-10 rounded-2xl">
            
            <div className="pb-4 border-b border-white/10">
                <h1 className="text-xl text-white">Personal Information</h1>
            </div>

            <div className="mt-5 flex flex-col items-center md:flex-row md:items-center">
                {/* Контейнер аватарки: на мобилках по центру, hover-эффект центрирован */}
                <div className="flex justify-center md:block">
                    <button className="p-3 shrink-0 cursor-pointer hover:opacity-80 transition-opacity hover:scale-125">
                        <Image
                            src={session?.user?.image || Avatar} 
                            alt="avatar" 
                            width={75} 
                            height={75} 
                            className="rounded-full object-cover md:h-18 md:w-18"
                        />
                    </button>
                </div>

                {/* Контейнер кнопок: mt-4 делает отступ от аватарки на мобилках, md:mt-0 его убирает */}
                <div className="mt-4 flex justify-center md:mt-0">
                    <Link href="/account/profile/upload">
                        <button className="h-14 rounded-3xl bg-[#3D234D] p-4 w-28 mr-2 ml-2 cursor-pointer hover:border-[#816394] hover:border-4 transition-all">
                            Upload
                        </button>
                    </Link>
                    <Link href="/account/profile/remove">
                        <button className="h-14 rounded-3xl flex items-center justify-center border-4 border-[#3D234D] w-28 mr-2 cursor-pointer hover:border-[#816394] transition-all">
                            Remove 
                        </button>
                    </Link>
                </div>
            </div>
            
      
            <div className="flex flex-col w-[100%] mt-10 lg:w-[70%]">
                <label className="mb-2 text-white/50 text-xs uppercase tracking-widest ml-1">Username</label>
                <div className="flex">
                    <input 
                    name="username"
                    type="text" 
                    disabled={true}
                    placeholder={session?.user?.name ?? ""} 
                    className="p-4 mb-6 w-[60%] bg-white/5 border border-white/10 rounded-2xl text-white outline-none focus:border-purple-500 focus:bg-purple-500/5 transition-all disabled:opacity-50"
                    />

                    <button disabled={true} className="ml-5 p-4 mb-6 w-[30%] max-w-40 bg-white/5 border border-white/10 rounded-2xl text-white outline-none focus:border-purple-500 focus:bg-purple-500/5 transition-all disabled:opacity-50">Change</button>
                </div>
                

                <label className="mb-2 text-white/50 text-xs uppercase tracking-widest ml-1">Email</label>

                <div className="flex">
                    <input 
                    name="email"
                    type="email" 
                    disabled={true}
                    placeholder={session?.user?.email ?? ""} 
                    className="p-4 mb-6 w-[60%] bg-white/5 border border-white/10 rounded-2xl text-white outline-none focus:border-purple-500 focus:bg-purple-500/5 transition-all disabled:opacity-50"
                    />
                     <button disabled={true} className="ml-5 p-4 mb-6 w-[30%] max-w-40 bg-white/5 border border-white/10 rounded-2xl text-white outline-none focus:border-purple-500 focus:bg-purple-500/5 transition-all disabled:opacity-50">Change</button>
                </div>

                 <label className="mb-2 text-white/50 text-xs uppercase tracking-widest ml-1 ">Phone</label>

            {/* На данный момент не используется */}
            {/* <div className="flex">
                <input 
                name="phone"
                type="tel" 
                placeholder="your phone number" 
                className="p-4 mb-6 w-[60%] bg-white/5 border border-white/10 rounded-2xl text-white outline-none focus:border-purple-500 focus:bg-purple-500/5 transition-all disabled:opacity-50"
                />
                 <button className="ml-5 p-4 mb-6 w-[30%] max-w-40 bg-white/5 border border-white/10 rounded-2xl text-white outline-none focus:border-purple-500 focus:bg-purple-500/5 transition-all disabled:opacity-50">Change</button>
            </div> */}

          
        </div>

            <div className="w-full h-10">
                <Link href="/account/profile/delete-account">
               <button className="px-5 py-2.5 bg-red-600 hover:bg-red-700 active:bg-red-800 text-white font-semibold text-sm rounded-lg shadow-md hover:shadow-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-neutral-900 disabled:opacity-50 disabled:cursor-not-allowed">
                    Delete Account
                </button>
                </Link>
            </div>
       </div>
    )
}