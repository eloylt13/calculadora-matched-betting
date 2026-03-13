import type { Metadata } from "next";
import "./globals.css";

const siteUrl = "https://calculadora-matched-betting.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title:
    "Calculadora Matched Betting | Apuesta-Recibe, Free Bet, Reembolso y Dutcher",
  description:
    "Calculadora de matched betting con bloques de Apuesta-Recibe, Free Bet, Reembolso y Dutcher. Herramienta clara y práctica para ejecutar estrategias paso a paso.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title:
      "Calculadora Matched Betting | Apuesta-Recibe, Free Bet, Reembolso y Dutcher",
    description:
      "Calculadora de matched betting con bloques de Apuesta-Recibe, Free Bet, Reembolso y Dutcher.",
    url: siteUrl,
    siteName: "Calculadora Matched Betting",
    locale: "es_ES",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title:
      "Calculadora Matched Betting | Apuesta-Recibe, Free Bet, Reembolso y Dutcher",
    description:
      "Calculadora de matched betting con bloques de Apuesta-Recibe, Free Bet, Reembolso y Dutcher.",
  },
  verification: {
    google: "6Cr92jGfY8D6cZX4sdEC1v1vECb_mgjBy8Jd9qoUfI4",
  },
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