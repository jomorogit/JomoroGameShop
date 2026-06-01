"use client";
import GoogleButton from "@/app/ui/GoogleButton";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ISLoginData } from "@/lib/types";
import { LoginValidation, CodeValidate } from "@/app/action/login";
import { signIn } from 'next-auth/react'
import Link from "next/link";
import { Loader2 } from "lucide-react"; 

export default function LogInPage() {
const router = useRouter();
const [step, setStep] = useState<number>(0);
const [code, setCode] = useState("");
const [error, setError] = useState<string | null>(null);
const [loading, setLoading] = useState(false); 

const [formData, setFormData] = useState<ISLoginData>({
    email: "",
    password: "",
    code: "",
});

const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
};

const returnBack = () => {
  setStep((prev) => prev - 1);
}

const handleSubmit: React.SubmitEventHandler<HTMLFormElement> = async (event) => {
    event.preventDefault();
    setError(null); 
  
    if(!formData.email || !formData.password) {
      setError("Please fill in all fields");
      return;
    }

    try {
      setLoading(true); 
      const res = await LoginValidation(formData);
      
      if (res.error) {
         setError(res.error);
         return;
      }
      if (res.success) {
         setStep((prev) => prev + 1);
      }
    } catch(error) {
      console.error(error);
      setError("Something went wrong");
    } finally {
      setLoading(false); 
    }
}

const codeSubmit: React.SubmitEventHandler<HTMLFormElement> = async (event) => {
    event.preventDefault();
    if(!code) return;

    const dataToSend = { 
      ...formData, 
      code: code,
    };

    try {
      setLoading(true); 
      const res = await CodeValidate(dataToSend);
      
      if(res.error) {
         setError(res.error);
         return;
      }
      
      if(res.success) {
         const signInRes = await signIn("credentials", {
           email: formData.email,
           password: formData.password,
           redirect: false,
         });

         if(signInRes && !signInRes.error) {
             router.push('/');
         } else {
             setError(signInRes?.error || "Auth failed");
         }
      }
    } catch(error) {
      console.error(error);
      setError("Code verification failed");
    } finally {
      setLoading(false); 
    }
}

return (
    <div className="w-full rounded-3xl bg-[#1a1625]/90 backdrop-blur-md p-6 sm:p-10 border border-purple-500/20 shadow-[0_0_50px_rgba(147,67,231,0.1)] flex flex-col items-center relative">
      
      <h1 className="font-inder text-3xl text-white font-bold tracking-tight text-center">Login</h1>
      <h2 className="font-inder mt-3 text-purple-400/80 text-center leading-relaxed">
        Welcome back, you`ve<br />been missed!
      </h2>

      {error && (
        <div className="mb-2 mt-4 p-3 bg-red-500/10 border border-red-500/50 rounded-lg text-red-500 text-sm text-center w-full">
          {error}
        </div>
      )}

      {step === 0 ? (
        <form onSubmit={handleSubmit} className="flex flex-col w-full mt-8 mb-4">
          <label className="mb-2 text-white/50 text-xs uppercase tracking-widest ml-1">Email Address</label>
          <input 
            name="email"           
            type="email" 
            placeholder="your@email.com" 
            value={formData.email} 
            onChange={handleChange} 
            required 
            className="p-4 mb-5 bg-white/5 border border-white/10 rounded-2xl text-white outline-none focus:border-purple-500 focus:bg-purple-500/5 transition-all"
          />

          <label className="mb-2 text-white/50 text-xs uppercase tracking-widest ml-1">Password</label>
          <input 
            name="password"        
            type="password" 
            placeholder="Enter your password" 
            value={formData.password} 
            onChange={handleChange} 
            required 
            maxLength={20}
            className="p-4 mb-8 bg-white/5 border border-white/10 rounded-2xl text-white outline-none focus:border-purple-500 focus:bg-purple-500/5 transition-all"
          />
          
          <button 
            type="submit" 
            className="bg-[#9343E7] hover:bg-[#a55cf0] text-white font-bold py-4 rounded-2xl transition-all active:scale-[0.98] shadow-[0_10px_20px_rgba(147,67,231,0.3)] cursor-pointer"
          >
            Login
          </button>
        </form>
      ) : (
        <div className="w-full mt-6">
          <button onClick={returnBack} type="button" className="text-white/50 mb-4 hover:text-white transition-colors text-sm flex items-center gap-1 cursor-pointer">
            ← Return back
          </button>

          <form onSubmit={codeSubmit} className="flex flex-col w-full items-center">
            <input
              type="text"
              maxLength={6}
              placeholder="000000"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
              className="text-center text-4xl tracking-[0.5rem] sm:tracking-[1rem] p-5 mb-6 bg-white/5 border border-white/10 rounded-2xl text-purple-400 outline-none focus:border-purple-500 focus:bg-purple-500/5 transition-all w-full font-mono"
            />
            <button
              type="submit"
              disabled={code.length !== 6}
              className="w-full bg-[#9343E7] hover:bg-[#a55cf0] disabled:opacity-50 disabled:hover:bg-[#9343E7] text-white font-bold py-4 rounded-2xl transition-all active:scale-[0.98] shadow-[0_10px_20px_rgba(147,67,231,0.3)] mb-4 cursor-pointer"
            >
              Confirm Code
            </button>
          </form>
        </div>
      )}
      
      <Link href="/register/forgot" className="font-inder cursor-pointer text-white/60 hover:text-white transition-colors text-sm mt-2">
        Forgot your password?
      </Link>
         
      <p className="font-inder text-[#9343E7] text-sm mt-6 mb-3 font-medium">Or continue with</p>

      <div className="w-full">
        <GoogleButton/>

        <div className="mt-5 text-center max-w-[340px] mx-auto select-none">
          <p className="text-white/30 text-[13px] leading-normal font-light tracking-wide">
            By continuing, you agree to GameShop&apos;s{" "}
            <Link 
              href="/privacy" 
              target="_blank" 
              className="text-purple-400/80 hover:text-purple-300 underline underline-offset-2 transition-colors font-medium"
            >
              Privacy Policy
            </Link>{" "}
            and consent to account data processing.
          </p>
        </div>
      </div>

      {loading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm transition-all duration-300">
          <div className="flex flex-col items-center gap-3 bg-[#130f1d] border border-purple-500/30 p-8 rounded-3xl shadow-2xl shadow-purple-950/50">
            <Loader2 className="w-12 h-12 text-[#9343E7] animate-spin" />
            <span className="text-purple-300 font-medium tracking-wide text-sm">Please wait...</span>
          </div>
        </div>
      )}
    </div>
  );
}