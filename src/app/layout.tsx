import type { Metadata, Viewport } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import { HeaderNav } from "./components/HeaderNav";

// Load fonts
const geist = Geist({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-geist",
});

export const metadata: Metadata = {
  title: "ReasonAI Assistant",
  description: "An AI reasoning assistant for all your questions, providing detailed analysis and step-by-step explanations.",
  authors: [{ name: "ReasonAI Team" }],
  keywords: [
    "AI", "assistant", "reasoning", "problem-solving", "analysis", 
    "artificial intelligence", "machine learning", "question answering",
    "reasoning ai", "cognitive computing", "explainable ai"
  ],
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  minimumScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#111827' }
  ]
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth h-full" suppressHydrationWarning>
      <body
        className={`${geist.variable} font-sans antialiased bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 flex flex-col min-h-screen`}
      >
        <HeaderNav />
        <main className="flex-grow">
          {children}
        </main>
      </body>
    </html>
  );
}
