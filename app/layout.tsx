import type { Metadata } from "next";
import { Geist, Inder } from "next/font/google";
import "./globals.css";
import CookieBanner from "./components/CookieBanner";
import Script from "next/script";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: 'swap',
});

const inder = Inder({
  weight: "400", 
  subsets: ["latin"],
  variable: "--font-inder", 
  display: 'swap',
});

// export const metadata: Metadata = {
//   title: "GameShop",
//   description: "Your ultimate game store",
//   icons: {
//     icon: './icons/icon.ico', 
//     apple: './icons/icon.ico',  
//   },
// };


export const metadata: Metadata = {

  metadataBase: new URL("https://jomoro-game-shop.vercel.app"),


  title: {
    default: "JomoroGameShop — Buy Game Keys & Digital Games",
    template: "%s | JomoroGameShop", 
  },
  
  description: "Discover and buy the latest video games, Steam keys, and digital activation codes at the best prices. Instant digital delivery and secure checkout.",

  alternates: {
  canonical: "/",
  languages: {
    "en-US": "https://jomoro-game-shop.vercel.app",
    "x-default": "https://jomoro-game-shop.vercel.app",
  },
},

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },

  icons: {
    icon: "./icons/icon.ico", 
    apple: "./icons/icon.ico",  
  },

  openGraph: {
    title: "JomoroGameShop — Buy Game Keys & Digital Games",
    description: "Discover and buy the latest video games and Steam keys with instant delivery.",
    url: "https://jomoro-game-shop.vercel.app",
    siteName: "JomoroGameShop",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "./icons/icon.png", 
        width: 1200,
        height: 630,
        alt: "JomoroGameShop Banner",
      },
    ],
  },

  // Настройки для Twitter
  twitter: {
    card: "summary_large_image",
    title: "JomoroGameShop — Buy Game Keys",
    description: "Discover and buy the latest video games with instant delivery.",
    images: ["./icons/icon.png"],
    site: "@JomoroGameShop",     
    creator: "@JomoroGameShop", 
  },
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