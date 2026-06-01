"use client";

import { useState } from "react";
import { useRouter } from "next/navigation"; 
import Step1 from "./Step1"; 
import Step2 from "./Step2"; 
import Step3 from "./Step3"; 
import { registerUser} from "@/app/action/register";
import { ISignUpData } from "@/lib/types";


export default function SignUpPage() {
  const router = useRouter(); // Инициализируем роутер
  const [step, setStep] = useState<number>(1);
  const [loading, setLoading] = useState(false); 
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState<ISignUpData>({
    email: "",
    username: "",
    password: "",
    confirmPassword: "",
    code: "",
  });

  const handleNext = () => setStep((prev) => prev + 1);
  const handleBack = () => setStep((prev) => prev - 2); 

  
  
  const handleFinalVerify = async (codeFromInput: string) => {
  try {
    setLoading(true);
    setError(null);

    const dataToSend = { 
      ...formData, 
      code: codeFromInput 
    };


    const result = await registerUser(dataToSend);
      
    if (result.error) {
      setError(result.error);
      return; 
    }

    if (result.success) {
      console.log("Welcome to GameShop! 🎮");
      router.push("/register/login"); 
    }
  } catch (e) {
    setError("Something went wrong. Please try again later.");
  } finally {
    setLoading(false);
  }
};

  return (
    // Карточка растягивается на всю ширину выделенного max-w-md контейнера
    <div className="w-full rounded-3xl bg-[#1a1625]/90 backdrop-blur-md p-6 sm:p-10 border border-purple-500/20 shadow-[0_0_50px_rgba(147,67,231,0.1)] flex flex-col">
      
      {/* Индикатор прогресса */}
      <div className="flex gap-2 mb-8 justify-center w-full">
        <div className={`h-1.5 flex-1 max-w-[80px] rounded-full transition-all duration-500 ${step >= 1 ? 'bg-purple-500 shadow-[0_0_10px_#9343E7]' : 'bg-white/10'}`}></div>
        <div className={`h-1.5 flex-1 max-w-[80px] rounded-full transition-all duration-500 ${step >= 2 ? 'bg-purple-500 shadow-[0_0_10px_#9343E7]' : 'bg-white/10'}`}></div>
        <div className={`h-1.5 flex-1 max-w-[80px] rounded-full transition-all duration-500 ${step >= 3 ? 'bg-purple-500 shadow-[0_0_10px_#9343E7]' : 'bg-white/10'}`}></div>
      </div>

      {/* Вывод ошибки, если она есть */}
      {error && (
        <div className="mb-4 p-3 bg-red-500/10 border border-red-500/50 rounded-lg text-red-500 text-sm text-center w-full">
          {error}
        </div>
      )}

      {/* Компоненты шагов автоматически займут 100% ширины */}
      <div className="w-full flex flex-col">
        {step === 1 && (
          <Step1 
            formData={formData} 
            setFormData={setFormData} 
            onNext={handleNext} 
          />
        )}

        {step === 2 && (
          <Step2 
            formData={formData} 
            setFormData={setFormData} 
            onNext={handleNext} 
          />
        )}

        {step === 3 && (
          <Step3 
            formData={formData} 
            onVerify={handleFinalVerify} 
            onBack={handleBack} 
            setFormData={setFormData}
          />
        )}
      </div>

    </div>
  );
}