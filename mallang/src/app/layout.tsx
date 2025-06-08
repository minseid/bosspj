"use client";

import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Image from "next/image";
import { AuthProvider } from "../context/AuthContext";
import { useRouter } from 'next/navigation';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const router = useRouter();

  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased flex flex-col min-h-screen`}
      >
        <AuthProvider>
          <div className="flex-1 overflow-y-auto pb-16">{children}</div>

          <nav className="flex justify-around items-center h-16 bg-white shadow-lg fixed bottom-0 left-0 right-0 z-50">
            <button
              className="flex flex-col items-center text-gray-600"
              onClick={() => router.push('/')}
            >
              <Image src="/house.svg" alt="Home" width={24} height={24} />
              <span className="text-xs mt-1">홈</span>
            </button>
            <button
              className="flex flex-col items-center text-gray-600"
              onClick={() => router.push('/schedule')}
            >
              <Image src="/calendar.svg" alt="Calendar" width={24} height={24} />
              <span className="text-xs mt-1">일정</span>
            </button>
            <button
              className="flex flex-col items-center text-gray-600"
              onClick={() => router.push('/settings')}
            >
              <Image src="/settings.svg" alt="Settings" width={24} height={24} />
              <span className="text-xs mt-1">설정</span>
            </button>
          </nav>
        </AuthProvider>
      </body>
    </html>
  );
}