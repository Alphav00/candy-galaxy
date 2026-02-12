import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Candy Galaxy - Chi Studios",
  description: "A mobile-first, browser-based 3D pet simulation. Adopt a Candy Creature and watch it evolve!",
  keywords: ["Candy Galaxy", "Chi Studios", "Tamagotchi", "pet simulation", "Next.js", "React Three Fiber"],
  authors: [{ name: "Chi Studios" }],
  icons: {
    icon: "/logo.svg",
  },
  openGraph: {
    title: "Candy Galaxy",
    description: "A cozy 3D pet simulation game",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Candy Galaxy",
    description: "A cozy 3D pet simulation game",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
