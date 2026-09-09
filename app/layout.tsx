import type { Metadata } from "next";
import { Alice, Outfit } from "next/font/google";
import { Header } from "@/components/header";
import { TournamentProvider } from "@/contexts/tournament";
import "./globals.css";

const alice = Alice({
  weight: "400",
  variable: "--font-display",
  subsets: ["latin"],
});

const outfit = Outfit({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "JUTEL 2026",
  description: "Chaveamento e placar dos Jogos Universitários do Inatel 2026",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="pt-BR" className={`${alice.variable} ${outfit.variable} h-full antialiased`}>
      <body className="wonder-body min-h-full font-sans text-[#f7f4ff]">
        <Header />
        <TournamentProvider>
          <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">{children}</main>
        </TournamentProvider>
      </body>
    </html>
  );
}
