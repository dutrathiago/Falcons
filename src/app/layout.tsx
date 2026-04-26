import type { Metadata } from "next";
import { Oswald, DM_Sans, Geist } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/Sidebar";
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

const oswald = Oswald({
  variable: "--font-oswald",
  subsets: ["latin"],
});

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Falcons - Atlética FAP | Gestão de Vôlei",
  description: "Sistema de Gestão de Vôlei - Falcons",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className={cn("font-sans", geist.variable)}>
      <body className={`${oswald.variable} ${dmSans.variable}`}>
        <div id="toast"></div>
        <Sidebar />
        <div id="main">
          {children}
        </div>
      </body>
    </html>
  );
}
