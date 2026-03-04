import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Inter } from "next/font/google";
import "./globals.css";

import Clarity from "@/components/Analytics/Clarity";

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta",
  subsets: ["latin"],
  weight: ['400', '500', '600', '700', '800'],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Lovely Home | Premium Coliving & Short Term Rental in Medellín",
  description: "Experience luxury minimal living in the heart of Medellín. Premium properties for digital nomads and travelers.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
        />
      </head>
      <body className={`${plusJakartaSans.variable} ${inter.variable}`}>
        <Clarity id={process.env.NEXT_PUBLIC_CLARITY_ID || ""} />
        {children}
      </body>
    </html>
  );
}
