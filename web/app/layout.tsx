import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "IA PredictHub Calculadora de Matched Betting",
  description:
    "Calculadora web de matched betting con bloques de Apuesta-Recibe, Free Bet, Reembolso y Dutching.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}