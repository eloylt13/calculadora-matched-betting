import type { Metadata } from "next";

const siteUrl = "https://analizador-alquiler.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Analizador de Alquiler",
    template: "%s | Analizador de Alquiler",
  },
  description:
    "Herramienta para revisar contratos de alquiler en PDF y detectar cláusulas sensibles antes de firmar.",
  applicationName: "Analizador de Alquiler",
  keywords: [
    "contrato de alquiler",
    "analizador contrato alquiler",
    "revisar contrato alquiler",
    "cláusulas alquiler",
    "penalización salida anticipada",
    "renovación automática alquiler",
  ],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    url: siteUrl,
    siteName: "Analizador de Alquiler",
    title: "Analizador de Alquiler",
    description:
      "Revisa contratos de alquiler en PDF y detecta cláusulas sensibles antes de firmar.",
    locale: "es_ES",
  },
  twitter: {
    card: "summary",
    title: "Analizador de Alquiler",
    description:
      "Revisa contratos de alquiler en PDF y detecta cláusulas sensibles antes de firmar.",
  },
  robots: {
    index: true,
    follow: true,
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
      <body
        style={{
          margin: 0,
          background: "#f3f4f6",
          color: "#111827",
          fontFamily:
            'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        }}
      >
        {children}
      </body>
    </html>
  );
}