import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Analizador de Alquiler",
  description:
    "Herramienta para revisar contratos de alquiler en PDF y detectar cláusulas sensibles antes de firmar.",
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