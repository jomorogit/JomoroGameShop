"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ISFrorgotData } from "@/lib/types";
import { emailValidate, codeValidate, NewPassword } from "@/app/action/forgotPass";

export default function LogInPage() {
const router = useRouter();
const [step, setStep] = useState<number>(0);
const [code, setCode] = useState("");
const [error, setError] = useState<string | null>(null);

const [formData, setFormData] = useState<ISFrorgotData>({
    email: "",
    code: "",
    password: "",
    confirmPassword: "",
});

const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
};

    const returnBack = () => {
      setStep((prev) => prev - 1);
      setError(null);
    }
    const handleSubmit: React.SubmitEventHandler<HTMLFormElement>  = async (event) => {
        event.preventDefault();
      
        const dataToSend = { 
        ...formData, 
        };

        try{
          if(!dataToSend){return "error"}
          if(!dataToSend.email){return "write your password"}


           const res = await emailValidate(dataToSend);
           if (res.error) {
             setError(res.error);
            return;
          }
          if (res.success) {
            setStep((prev) => prev + 1);
            setError(null);
          }
        }catch(error){
          
          console.log("")
        }

        
    }
    const codeSubmit: React.SubmitEventHandler<HTMLFormElement>  = async (event) => {
        event.preventDefault();
        
        const dataToSend = { 
        ...formData, 
        code: code,
        };

        try{
          if(!dataToSend){return "error"}
          if(!dataToSend.code){return "write your code"}


           const res = await codeValidate(dataToSend);
           if (res.error) {
             setError(res.error);
            return;
          }
          if (res.success) {
            setStep((prev) => prev + 1);
            setError(null);
          }
        }catch(error){
          
          console.log("")
        }
        
    }

    const newPasswordSubmit: React.SubmitEventHandler<HTMLFormElement>  = async (event) => {
      event.preventDefault();
        
        const dataToSend = { 
        ...formData, 
       };
       if(formData.password !== formData.confirmPassword){
            setError("Passwords do not match!");
            return;
          }
          if(formData.password && formData.password.length<8){
            setError("Password must be at least 8 characters");
            return;
          }
            const word: string = formData.password || ""; // Добавим проверку на пустую строку
            const letters: string[] = word.split('');
            let IsCapLetter: boolean = false;
            for (let i: number = 0; i < word.length; i++) {
          // Если нашли заглавную букву
            if (letters[i] === letters[i].toUpperCase() && letters[i] !== letters[i].toLowerCase()) {
              IsCapLetter = true;
              break; 
            }
          }

              if (!IsCapLetter) {
                setError("The password must contain at least 1 capital letter.");
                return; // Останавливаем выполнение, если буквы нет
              }
      
      // Описываем функцию отдельно
      const checkLatin = (text: string): boolean => {
        return /^[A-Za-z0-9.,!?]*$/.test(text);
      };

      //пароль только из латиницы, цифр и символов
      const isValid = checkLatin(formData.password || "");
      if(!isValid){
        setError("Password must contain only Latin characters, numbers and symbols.");
        return;
      }
       try{
          const res = await NewPassword(dataToSend);
          if (res.error) {
             setError(res.error);
            return;
          }
          if(res.success){
             router.push('/register/login')
          }
       }catch(error){
        return
       }
    }
  return (
     <div className="flex flex-col items-center justify-center min-h-full w-auto rounded-2xl bg-[#0a0514]">
        <div className="flex flex-col items-center w-96 max-w-md bg-[#1a1625]/90 backdrop-blur-md p-10 rounded-3xl border border-purple-500/20 shadow-[0_0_50px_rgba(147,67,231,0.1)]">
         <h1 className="font-inder text-3xl text-white font-bold tracking-tight">Password recovery</h1>

        {step === 0 && ( 
          
        <form onSubmit={handleSubmit} className="flex flex-col w-full mb-8 min-h-[400px]">
          <div className="flex w-full items-center justify-center">
            <h2 className="font-inder mt-4 text-purple-400/80">Write your email</h2>
          </div>
        

        {error && (
                  <div className=" p-3 mt-6 bg-red-500/10 border border-red-500/50 rounded-lg text-red-500 text-sm text-center w-[100%]">
                    {error}
                  </div>
        )}
        {/* Поле EMAIL */}
        <label className="mb-2 mt-6 text-white/50 text-xs uppercase tracking-widest ml-1">Email Address</label>
        <input 
          name="email"           // Должно совпадать с ключом в объекте ISignUpData
          type="email" 
          placeholder="your@email.com" 
          value={formData.email} 
          onChange={handleChange} 
          required 
          className="p-4 mb-6 bg-white/5 border border-white/10 rounded-2xl text-white outline-none focus:border-purple-500 focus:bg-purple-500/5 transition-all"
        />
        
        {/* Кнопка продолжения */}
        <button 
          type="submit" 
          className="bg-[#9343E7] hover:bg-[#a55cf0] text-white font-bold py-4 rounded-2xl transition-all active:scale-[0.98] shadow-[0_10px_20px_rgba(147,67,231,0.3)]"
        >
          Send Code
        </button>
      </form>
        )}
           
            {step === 1 && ( 
            
              

               <form onSubmit={codeSubmit} className="flex flex-col w-full items-center min-h-[400px]">

                 <h2 className="font-inder mt-4 text-purple-400/80">Write code</h2>

                 <button onClick={returnBack} type="button" className="text-white/50 mb-4 hover:text-white transition-colors mt-4">
                ← Return back
              </button>

              {error && (
                  <div className="mb-4 mt-2 p-3 bg-red-500/10 border border-red-500/50 rounded-lg text-red-500 text-sm text-center w-[100%]">
                    {error}
                  </div>
                )}

              <input
                type="text"
                maxLength={6}
                placeholder="000000"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                className="text-center text-4xl tracking-[1rem] p-6 mb-8 bg-white/5 border border-white/10 rounded-2xl text-purple-400 outline-none focus:border-purple-500 focus:bg-purple-500/5 transition-all w-full font-mono"
              />
            <button
                  type="submit"
                  disabled={code.length !== 6}
                  className="w-full bg-[#9343E7] hover:bg-[#a55cf0] disabled:opacity-50 disabled:hover:bg-[#9343E7] text-white font-bold py-4 rounded-2xl transition-all active:scale-[0.98] shadow-[0_10px_20px_rgba(147,67,231,0.3)] mb-6"
                >
                  Confirm Code
                </button>
            </form>
         
            
          )}

          {step === 2 && (
            
               

            <form onSubmit={newPasswordSubmit} className="flex flex-col w-full items-start mt-4">

              <div className="flex w-full items-center justify-center flex-col">
                <h2 className="font-inder mt-4 text-purple-400/80">Create new password</h2>

                <button onClick={returnBack} type="button" className="text-white/50 mb-4 hover:text-white transition-colors mt-4">
                ← Return back
              </button>
              </div>

                {error && (
                  <div className="mb-4 mt-4 p-3 bg-red-500/10 border border-red-500/50 rounded-lg text-red-500 text-sm text-center w-[100%]">
                    {error}
                  </div>
                )}

                <label className="mb-2 text-white/50 text-xs uppercase tracking-widest ml-1">Password</label>
                <input 
                  name="password"        // Должно совпадать с ключом в объекте ISignUpData
                  type="password" 
                  placeholder="Enter your password" 
                  value={formData.password} 
                  onChange={handleChange} 
                  required 
                  maxLength={20}
                 className="w-full p-4 mb-6 bg-white/5 border border-white/10 rounded-2xl text-white outline-none focus:border-purple-500 focus:bg-purple-500/5 transition-all"
                />
              
                <label className="mb-2 text-white/50 text-xs uppercase tracking-widest ml-1">Confirm Password</label>
                <input 
                  name="confirmPassword"       
                  type="password" 
                  placeholder="Enter your password" 
                  value={formData.confirmPassword} 
                  onChange={handleChange} 
                  required 
                  maxLength={20}
                  className="w-full p-4 mb-6 bg-white/5 border border-white/10 rounded-2xl text-white outline-none focus:border-purple-500 focus:bg-purple-500/5 transition-all"
                />
              
                


                <button
                  type="submit"
                  className="w-full bg-[#9343E7] hover:bg-[#a55cf0] disabled:opacity-50 disabled:hover:bg-[#9343E7] text-white font-bold py-4 rounded-2xl transition-all active:scale-[0.98] shadow-[0_10px_20px_rgba(147,67,231,0.3)] mb-6"
                >
                  Create new password
                </button>
            </form>
        
            
          )}
    </div>
   </div>
  );
}