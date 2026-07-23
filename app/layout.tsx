import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = { title: "SDD Studio — Descoberta de projetos", description: "Configure escopos, orçamentos e SDDs para sistemas personalizados." };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="pt-BR"><body>{children}</body></html>; }
