"use client";

import { useMemo, useState } from "react";
import ResultsPanel from "../components/ResultsPanel";
import type { AnalysisResult, AnalyzeApiResponse } from "../types/risk";

function formatFileSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDisplayFileName(fileName: string) {
  if (fileName.length <= 38) return fileName;

  const extensionIndex = fileName.lastIndexOf(".");
  if (extensionIndex === -1) {
    return `${fileName.slice(0, 35)}...`;
  }

  const extension = fileName.slice(extensionIndex);
  const base = fileName.slice(0, extensionIndex);

  if (base.length <= 30) return fileName;

  return `${base.slice(0, 30)}...${extension}`;
}

export default function Home() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [analysis, setAnalysis] = useState<AnalysisResult | undefined>(undefined);
  const [message, setMessage] = useState<string>("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const selectedFileLabel = useMemo(() => {
    if (!selectedFile) {
      return {
        title: "Todavía no has seleccionado ningún PDF",
        detail: "Sube un contrato en PDF para iniciar el análisis.",
      };
    }

    return {
      title: formatDisplayFileName(selectedFile.name),
      detail: formatFileSize(selectedFile.size),
    };
  }, [selectedFile]);

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] ?? null;
    setSelectedFile(file);
    setAnalysis(undefined);

    if (file) {
      setMessage("PDF cargado correctamente. Ya puedes iniciar el análisis.");
    } else {
      setMessage("");
    }
  }

  async function handleAnalyze() {
    if (!selectedFile) {
      setMessage("Primero selecciona un contrato en PDF.");
      return;
    }

    try {
      setIsAnalyzing(true);
      setMessage("Analizando el contrato...");
      setAnalysis(undefined);

      const formData = new FormData();
      formData.append("file", selectedFile);

      const response = await fetch("/api/analyze", {
        method: "POST",
        body: formData,
      });

      const data: AnalyzeApiResponse = await response.json();

      if (!response.ok || !data.ok) {
        setMessage(data.message || "No se pudo completar el análisis.");
        return;
      }

      setAnalysis(data.analysis);
      setMessage("Análisis completado.");
    } catch (error) {
      console.error(error);
      setMessage("Se produjo un error al analizar el contrato.");
    } finally {
      setIsAnalyzing(false);
    }
  }

  const statusStyles = useMemo(() => {
    if (!message) {
      return {
        background: "#f8fafc",
        border: "1px solid #e2e8f0",
        color: "#475569",
      };
    }

    if (message.toLowerCase().includes("error")) {
      return {
        background: "#fef2f2",
        border: "1px solid #fecaca",
        color: "#991b1b",
      };
    }

    if (message.toLowerCase().includes("analizando")) {
      return {
        background: "#eff6ff",
        border: "1px solid #bfdbfe",
        color: "#1d4ed8",
      };
    }

    return {
      background: "#f0fdf4",
      border: "1px solid #bbf7d0",
      color: "#166534",
    };
  }, [message]);

  return (
    <main
      style={{
        minHeight: "100vh",
        padding: "32px 20px 56px",
      }}
    >
      <div
        style={{
          maxWidth: "1180px",
          margin: "0 auto",
          display: "grid",
          gap: "24px",
        }}
      >
        <section
          style={{
            background:
              "linear-gradient(135deg, rgba(255,255,255,1) 0%, rgba(239,246,255,1) 100%)",
            border: "1px solid #dbeafe",
            borderRadius: "24px",
            padding: "36px",
            boxShadow: "0 12px 30px rgba(15, 23, 42, 0.06)",
          }}
        >
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "10px",
              background: "#dbeafe",
              color: "#1d4ed8",
              borderRadius: "999px",
              padding: "8px 14px",
              fontSize: "13px",
              fontWeight: 700,
              marginBottom: "18px",
            }}
          >
            Analizador de contratos de alquiler
          </div>

          <h1
            style={{
              margin: 0,
              fontSize: "44px",
              lineHeight: 1.1,
              letterSpacing: "-0.02em",
              maxWidth: "820px",
            }}
          >
            Revisa tu contrato de alquiler antes de firmarlo
          </h1>

          <p
            style={{
              marginTop: "16px",
              marginBottom: "24px",
              fontSize: "18px",
              lineHeight: 1.75,
              color: "#374151",
              maxWidth: "840px",
            }}
          >
            Sube un PDF y detecta cláusulas sensibles como penalizaciones por salida
            anticipada, renovaciones automáticas, posibles garantías adicionales y
            otros puntos que conviene revisar con calma.
          </p>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
              gap: "14px",
            }}
          >
            <div
              style={{
                background: "rgba(255,255,255,0.75)",
                border: "1px solid rgba(59,130,246,0.18)",
                borderRadius: "16px",
                padding: "16px",
              }}
            >
              <div style={{ fontWeight: 700, marginBottom: "8px" }}>
                Detecta cláusulas clave
              </div>
              <div style={{ color: "#4b5563", lineHeight: 1.6 }}>
                Señala riesgos principales y posibles puntos que conviene revisar
                manualmente.
              </div>
            </div>

            <div
              style={{
                background: "rgba(255,255,255,0.75)",
                border: "1px solid rgba(59,130,246,0.18)",
                borderRadius: "16px",
                padding: "16px",
              }}
            >
              <div style={{ fontWeight: 700, marginBottom: "8px" }}>
                Ubica el contexto
              </div>
              <div style={{ color: "#4b5563", lineHeight: 1.6 }}>
                Relaciona cada hallazgo con su fragmento y con el apartado aproximado
                del contrato.
              </div>
            </div>

            <div
              style={{
                background: "rgba(255,255,255,0.75)",
                border: "1px solid rgba(59,130,246,0.18)",
                borderRadius: "16px",
                padding: "16px",
              }}
            >
              <div style={{ fontWeight: 700, marginBottom: "8px" }}>
                Decide mejor antes de firmar
              </div>
              <div style={{ color: "#4b5563", lineHeight: 1.6 }}>
                Úsalo como filtro previo antes de negociar condiciones o pedir una
                revisión jurídica.
              </div>
            </div>
          </div>
        </section>

        <section
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
            gap: "20px",
            alignItems: "start",
          }}
        >
          <article
            style={{
              background: "white",
              border: "1px solid #e5e7eb",
              borderRadius: "20px",
              padding: "28px",
              boxShadow: "0 8px 24px rgba(15, 23, 42, 0.04)",
            }}
          >
            <h2
              style={{
                marginTop: 0,
                marginBottom: "10px",
                fontSize: "30px",
                lineHeight: 1.2,
              }}
            >
              Subir contrato
            </h2>

            <p
              style={{
                marginTop: 0,
                marginBottom: "20px",
                color: "#4b5563",
                lineHeight: 1.7,
              }}
            >
              Selecciona el PDF de tu contrato de alquiler y ejecuta el análisis.
            </p>

            <div
              style={{
                border: "2px dashed #cbd5e1",
                background: "#f8fafc",
                borderRadius: "18px",
                padding: "22px",
                marginBottom: "18px",
              }}
            >
              <div
                style={{
                  fontWeight: 700,
                  marginBottom: "8px",
                  fontSize: "18px",
                }}
              >
                Archivo seleccionado
              </div>

              <div
                style={{
                  fontSize: "16px",
                  fontWeight: selectedFile ? 700 : 500,
                  color: selectedFile ? "#111827" : "#475569",
                  marginBottom: "6px",
                  wordBreak: "break-word",
                }}
              >
                {selectedFileLabel.title}
              </div>

              <div
                style={{
                  color: "#64748b",
                  lineHeight: 1.6,
                  marginBottom: "16px",
                  fontSize: "14px",
                }}
              >
                {selectedFileLabel.detail}
              </div>

              <label
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: "#111827",
                  color: "white",
                  padding: "12px 18px",
                  borderRadius: "12px",
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                Seleccionar contrato PDF
                <input
                  type="file"
                  accept="application/pdf"
                  onChange={handleFileChange}
                  style={{ display: "none" }}
                />
              </label>
            </div>

            <button
              onClick={handleAnalyze}
              disabled={!selectedFile || isAnalyzing}
              style={{
                width: "100%",
                background: !selectedFile || isAnalyzing ? "#94a3b8" : "#2563eb",
                color: "white",
                border: "none",
                borderRadius: "14px",
                padding: "15px 18px",
                fontSize: "16px",
                fontWeight: 700,
                cursor: !selectedFile || isAnalyzing ? "not-allowed" : "pointer",
                boxShadow:
                  !selectedFile || isAnalyzing
                    ? "none"
                    : "0 10px 20px rgba(37, 99, 235, 0.18)",
                opacity: !selectedFile || isAnalyzing ? 0.9 : 1,
              }}
            >
              {isAnalyzing ? "Analizando..." : "Analizar contrato"}
            </button>

            <div
              style={{
                marginTop: "16px",
                minHeight: "26px",
                background: statusStyles.background,
                border: statusStyles.border,
                color: statusStyles.color,
                borderRadius: "12px",
                padding: "12px 14px",
                lineHeight: 1.6,
                fontSize: "14px",
              }}
            >
              {message || "Selecciona un PDF y pulsa analizar para empezar."}
            </div>

            <div
              style={{
                marginTop: "22px",
                padding: "16px",
                background: "#fffbeb",
                border: "1px solid #fde68a",
                borderRadius: "14px",
                color: "#78350f",
                lineHeight: 1.65,
                fontSize: "14px",
              }}
            >
              Esta herramienta sirve como revisión inicial. No sustituye el criterio
              de un abogado ni una revisión jurídica profesional.
            </div>
          </article>

          <article
            style={{
              background: "white",
              border: "1px solid #e5e7eb",
              borderRadius: "20px",
              padding: "28px",
              boxShadow: "0 8px 24px rgba(15, 23, 42, 0.04)",
            }}
          >
            <h2
              style={{
                marginTop: 0,
                marginBottom: "10px",
                fontSize: "30px",
                lineHeight: 1.2,
              }}
            >
              Cómo interpretar el resultado
            </h2>

            <div
              style={{
                display: "grid",
                gap: "14px",
              }}
            >
              <div
                style={{
                  background: "#fef2f2",
                  border: "1px solid #fecaca",
                  borderRadius: "14px",
                  padding: "16px",
                }}
              >
                <div style={{ fontWeight: 700, color: "#991b1b", marginBottom: "6px" }}>
                  Riesgo rojo
                </div>
                <div style={{ color: "#4b5563", lineHeight: 1.6 }}>
                  Señal fuerte y bastante justificada en el texto extraído del
                  contrato.
                </div>
              </div>

              <div
                style={{
                  background: "#fffbeb",
                  border: "1px solid #fde68a",
                  borderRadius: "14px",
                  padding: "16px",
                }}
              >
                <div style={{ fontWeight: 700, color: "#92400e", marginBottom: "6px" }}>
                  Riesgo amarillo
                </div>
                <div style={{ color: "#4b5563", lineHeight: 1.6 }}>
                  Cláusula relevante que conviene revisar, aunque no siempre implica
                  abuso o problema grave por sí sola.
                </div>
              </div>

              <div
                style={{
                  background: "#f8fafc",
                  border: "1px solid #e2e8f0",
                  borderRadius: "14px",
                  padding: "16px",
                }}
              >
                <div style={{ fontWeight: 700, color: "#334155", marginBottom: "6px" }}>
                  Posibles puntos a revisar
                </div>
                <div style={{ color: "#4b5563", lineHeight: 1.6 }}>
                  Señales más débiles o ambiguas que merece la pena revisar de forma
                  manual.
                </div>
              </div>
            </div>

            <div
              style={{
                marginTop: "18px",
                padding: "16px",
                background: "#eff6ff",
                border: "1px solid #bfdbfe",
                borderRadius: "14px",
                lineHeight: 1.7,
                color: "#1e3a8a",
              }}
            >
              Consejo práctico: si aparece una penalización económica, una renovación
              automática o cualquier obligación poco clara, lee la cláusula completa y
              confirma si puedes negociarla antes de firmar.
            </div>
          </article>
        </section>

        <ResultsPanel message={message} analysis={analysis} />
      </div>
    </main>
  );
}