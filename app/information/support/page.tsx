'use client';

import React, { useState } from 'react';

interface FAQItem {
  question: string;
  answer: string;
}

export default function SupportPage() {
  // State for FAQ accordion
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  
  // State for Contact Form
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const faqData: FAQItem[] = [
    {
      question: "I purchased a game, but it hasn't appeared in my Library",
      answer: "Games are usually added instantly. Try refreshing the page. If the game doesn't appear within 5 minutes, please check the 'Transactions' tab in your profile or fill out the support form below with your order details."
    },
    {
      question: "How does hybrid payment with Account Balance and Stripe work?",
      answer: "You can top up your balance directly or use combined payment. If you have funds on your account balance, the system will automatically apply them, and you can pay the remaining amount with a card via Stripe."
    },
    {
      question: "Is this store compliant with GDPR regulations in Europe?",
      answer: "Yes, we are fully compliant with GDPR data protection rules. You can manage your cookie preferences via the cookie banner, and your personal data is securely encrypted and never shared with third parties."
    },
    {
      question: "How can I hide games or track discounts on a specific game?",
      answer: "You can add any game to your WishList. In future updates (Patch 1.1), we will add an automatic email notification system to alert you whenever a game on your WishList goes on sale!"
    }
  ];

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email && message) {
      setSubmitted(true);
      setEmail('');
      setMessage('');
    }
  };

  return (
    <div className="h-full bg-transparent text-gray-200 px-4 py-8 md:px-12 lg:px-16">
      {/* Page Header */}
      <div className="max-w-4xl mx-auto lg:text-center mb-12">
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-6 tracking-wide">
           GameShop Support Center
        </h1>
        <p className="text-gray-400 text-sm md:text-base">
          Having trouble with payment, library, or your account? Our medieval messenger is ready to help!
        </p>
      </div>

      <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* LEFT COLUMN: FAQ Accordion */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-purple-400 mb-4 flex items-center gap-2">
            Frequently Asked Questions
          </h2>
          
          {faqData.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <div 
                key={index} 
                className="bg-[#1b1124]/40 border border-purple-900/40 rounded-xl overflow-hidden transition-all duration-300"
              >
                <button
                  onClick={() => toggleFAQ(index)}
                  className="w-full text-left p-4 flex justify-between items-center hover:bg-purple-950/20 transition-colors gap-3"
                >
                  <span className="font-medium text-sm md:text-base text-gray-200">
                    {faq.question}
                  </span>
                  <span className={`text-purple-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}>
                    ▼
                  </span>
                </button>
                
                <div 
                  className={`transition-all duration-300 ease-in-out overflow-hidden ${
                    isOpen ? 'max-h-48 border-t border-purple-900/20' : 'max-h-0'
                  }`}
                >
                  <p className="p-4 text-xs md:text-sm text-gray-400 leading-relaxed bg-[#120a1a]/30">
                    {faq.answer}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* RIGHT COLUMN: Contact Form */}
        <div className="bg-[#160d1f]/60 border border-purple-900/30 rounded-2xl p-6 shadow-xl backdrop-blur-sm h-fit">
          <h2 className="text-xl font-semibold text-purple-400 mb-2 flex items-center gap-2">
            Contact Us
          </h2>
          <p className="text-xs text-gray-400 mb-6">
            Fill out the form below, and we will send a reply directly to your email address.
          </p>

          {submitted ? (
            <div className="bg-emerald-950/30 border border-emerald-500/30 text-emerald-400 p-4 rounded-xl text-center animate-fade-in">
              <p className="font-medium mb-1"> Message sent successfully!</p>
              <p className="text-xs text-emerald-500/80">We will get back to you as soon as possible.</p>
              <button 
                onClick={() => setSubmitted(false)}
                className="mt-4 text-xs underline hover:text-white transition-colors"
              >
                Send another message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5 uppercase tracking-wider">
                  Your Email
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full bg-[#0d0614] border border-purple-900/40 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5 uppercase tracking-wider">
                  Describe your issue
                </label>
                <textarea
                  required
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Please describe your problem in detail..."
                  className="w-full bg-[#0d0614] border border-purple-900/40 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all resize-none"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-purple-700 hover:bg-purple-600 active:bg-purple-800 text-white font-medium text-sm py-3 rounded-xl transition-colors duration-200 shadow-lg shadow-purple-950/50"
              >
                Submit Request
              </button>
            </form>
          )}

          {/* Direct contact footer */}
          <div className="mt-6 pt-6 border-t border-purple-900/20 text-center">
            <span className="text-xs text-gray-500">
              Direct Contact: <a href="jomoroforwork@gmail.com" className="text-purple-400 hover:underline">jomoroforwork@gmail.com</a>
            </span>
          </div>

        </div>

      </div>
    </div>
  );
}