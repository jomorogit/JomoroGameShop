'use client'
import React from 'react'
import { createCheckoutSession } from '../action/payment'
import { useToast } from '../components/Toast'; 
import { useSession } from "next-auth/react";
import { useState } from 'react';

export default function CheckoutButton() {
    const { data: session } = useSession() 
    const { showToast } = useToast() 
    const [loading, setLoading] = useState(false);

    const handlePayment = async () => {
    // 1. Проверяем авторизацию
    if (!session?.user?.email) {
      showToast("Please log in to purchase games!", "/register/login", "Log In");
      return;
    }

    try {
      setLoading(true);
      const result = await createCheckoutSession();

      if (result?.error) {
        showToast(`❌ ${result.error}`);
        return;
      }
      if (result?.url) {
        showToast("🔄 Redirecting to secure payment...");
        window.location.href = result.url; 
      }
    } catch (err) {
      console.error(err);
      showToast("❌ Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button className='bg-green-800 p-4 w-60 cursor-pointer rounded-xl hover:bg-green-700'
    onClick={handlePayment}
    disabled={loading}
    >
    {loading ? "Processing..." : "Checkout"}
    </button>
  )
}
