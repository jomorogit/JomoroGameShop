import type { Metadata } from "next";
import { Geist, Inder } from "next/font/google";
import "./globals.css";
import CookieBanner from "./components/CookieBanner";
import Script from "next/script";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const inder = Inder({
  weight: "400", 
  subsets: ["latin"],
  variable: "--font-inder", 
});

export const metadata: Metadata = {
  title: "GameShop",
  description: "Your ultimate dark fantasy game store",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const GA_TRACKING_ID = process.env.NEXT_PUBLIC_GA_TRACKING_ID;

  return (
    <html lang="en" className="dark">
      <body
        className={`
          ${geistSans.variable} 
          ${inder.variable} 
          antialiased 
          bg-background 
          text-foreground
        `}
      >
        {children}

        {/*  баннер куки */}
        <CookieBanner />

        {GA_TRACKING_ID && (
          <Script
            id="google-analytics"
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{
              __html: `
                if (localStorage.getItem('cookie_consent') === 'granted') {
                  const firstScript = document.getElementsByTagName('script')[0];
                  const newScript = document.createElement('script');
                  newScript.async = true;
                  newScript.src = 'https://www.googletagmanager.com/gtag/js?id=${GA_TRACKING_ID}';
                  firstScript.parentNode.insertBefore(newScript, firstScript);

                  window.dataLayer = window.dataLayer || [];
                  function gtag(){window.dataLayer.push(arguments);}
                  gtag('js', new Date());

                  gtag('config', '${GA_TRACKING_ID}', {
                    page_path: window.location.pathname,
                  });
                }
              `,
            }}
          />
        )}
      </body>
    </html>
  );
}