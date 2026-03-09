import type { ReactNode } from "react";
import type { AnalysisResult, ReviewItem, RiskItem } from "../types/risk";

type ResultsPanelProps = {
  message: string;
  analysis?: AnalysisResult;
};

function getLevelStyles(level: RiskItem["level"]) {
  if (level === "red") {
    return {
      background: "#fef2f2",
      border: "1px solid #fecaca",
      badgeBackground: "#dc2626",
      badgeColor: "white",
      titleColor: "#991b1b",
    };
  }

  if (level === "yellow") {
    return {
      background: "#fffbeb",
      border: "1px solid #fde68a",
      badgeBackground: "#d97706",
      badgeColor: "white",
      titleColor: "#92400e",
    };
  }

  return {
    background: "#f0fdf4",
    border: "1px solid #bbf7d0",
    badgeBackground: "#16a34a",
    badgeColor: "white",
    titleColor: "#166534",
  };
}

function getAttentionStyles(level: AnalysisResult["guidance"]["attentionLevel"]) {
  if (level === "high") {
    return {
      background: "#fef2f2",
      border: "1px solid #fecaca",
      badgeBackground: "#dc2626",
      badgeColor: "white",
      titleColor: "#991b1b",
      label: "Atención alta",
    };
  }

  if (level === "medium") {
    return {
      background: "#fffbeb",
      border: "1px solid #fde68a",
      badgeBackground: "#d97706",
      badgeColor: "white",
      titleColor: "#92400e",
      label: "Atención media",
    };
  }

  return {
    background: "#f0fdf4",
    border: "1px solid #bbf7d0",
    badgeBackground: "#16a34a",
    badgeColor: "white",
    titleColor: "#166534",
    label: "Atención baja",
  };
}

function DetailRow({
  label,
  value,
}: {
  label: string;
  value: ReactNode;
}) {
  return (
    <div style={{ marginBottom: "12px" }}>
      <span style={{ fontWeight: 700 }}>{label}: </span>
      <span>{value}</span>
    </div>
  );
}

function ReviewCard({ item }: { item: ReviewItem }) {
  return (
    <article
      style={{
        background: "#f9fafb",
        border: "1px solid #e5e7eb",
        padding: "20px",
        borderRadius: "16px",
      }}
    >
      <h3
        style={{
          margin: 0,
          marginBottom: "14px",
          fontSize: "22px",
          lineHeight: 1.3,
          color: "#374151",
        }}
      >
        {item.title}
      </h3>

      <div
        style={{
          background: "rgba(255,255,255,0.78)",
          border: "1px solid rgba(0,0,0,0.05)",
          borderRadius: "12px",
          padding: "16px",
        }}
      >
        <DetailRow label="Indicador encontrado" value={item.matchedTerm} />
        <DetailRow label="Página aproximada" value={item.page} />

        {item.clauseLabel && (
          <DetailRow
            label="Cláusula/apartado aproximado"
            value={item.clauseLabel}
          />
        )}

        <DetailRow label="Explicación" value={item.explanation} />

        <div style={{ marginBottom: "12px" }}>
          <div style={{ fontWeight: 700, marginBottom: "6px" }}>Fragmento:</div>
          <div
            style={{
              background: "rgba(255,255,255,0.86)",
              border: "1px solid rgba(0,0,0,0.05)",
              borderRadius: "10px",
              padding: "12px",
              lineHeight: 1.75,
              whiteSpace: "pre-line",
              color: "#1f2937",
            }}
          >
            {item.snippet}
          </div>
        </div>

        <DetailRow label="Qué revisar" value={item.recommendation} />
      </div>
    </article>
  );
}

export default function ResultsPanel({
  message,
  analysis,
}: ResultsPanelProps) {
  return (
    <section
      style={{
        background: "white",
        padding: "32px",
        border: "1px solid #d1d5db",
        borderRadius: "20px",
        boxShadow: "0 8px 24px rgba(15, 23, 42, 0.04)",
      }}
    >
      <h2
        style={{
          fontSize: "34px",
          marginBottom: "12px",
          lineHeight: 1.2,
        }}
      >
        Resultados
      </h2>

      <p
        style={{
          marginBottom: "24px",
          fontSize: "17px",
          lineHeight: 1.6,
          color: "#374151",
        }}
      >
        Aquí aparecerán los hallazgos detectados en el contrato.
      </p>

      {!analysis ? (
        <div
          style={{
            background: "#f8fafc",
            border: "1px solid #e2e8f0",
            borderRadius: "16px",
            padding: "24px",
          }}
        >
          <h3
            style={{
              marginTop: 0,
              marginBottom: "12px",
              fontSize: "24px",
              color: "#111827",
            }}
          >
            Esperando análisis
          </h3>

          <p
            style={{
              marginTop: 0,
              marginBottom: "18px",
              color: "#475569",
              lineHeight: 1.7,
            }}
          >
            Sube un contrato en PDF y pulsa <strong>“Analizar contrato”</strong>.
            Cuando termine el proceso, aquí verás:
          </p>

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
                padding: "14px 16px",
              }}
            >
              <div style={{ fontWeight: 700, color: "#991b1b", marginBottom: "4px" }}>
                Riesgos detectados
              </div>
              <div style={{ color: "#4b5563", lineHeight: 1.6 }}>
                Cláusulas con señales fuertes o relevantes, como penalizaciones o
                renovaciones automáticas.
              </div>
            </div>

            <div
              style={{
                background: "#eff6ff",
                border: "1px solid #bfdbfe",
                borderRadius: "14px",
                padding: "14px 16px",
              }}
            >
              <div style={{ fontWeight: 700, color: "#1d4ed8", marginBottom: "4px" }}>
                Conclusión final
              </div>
              <div style={{ color: "#4b5563", lineHeight: 1.6 }}>
                Un resumen claro de qué revisaría antes de firmar y qué preguntas
                conviene hacer.
              </div>
            </div>

            <div
              style={{
                background: "#f9fafb",
                border: "1px solid #e5e7eb",
                borderRadius: "14px",
                padding: "14px 16px",
              }}
            >
              <div style={{ fontWeight: 700, color: "#374151", marginBottom: "4px" }}>
                Posibles puntos a revisar
              </div>
              <div style={{ color: "#4b5563", lineHeight: 1.6 }}>
                Señales más débiles o ambiguas que merece la pena revisar
                manualmente.
              </div>
            </div>
          </div>

          <div
            style={{
              marginTop: "18px",
              padding: "14px 16px",
              background: "#fffbeb",
              border: "1px solid #fde68a",
              borderRadius: "14px",
              color: "#78350f",
              lineHeight: 1.65,
            }}
          >
            Usa esta herramienta como filtro previo antes de firmar o antes de pedir
            una revisión más detallada.
          </div>
        </div>
      ) : (
        <div>
          <div
            style={{
              background: "#eff6ff",
              border: "1px solid #bfdbfe",
              padding: "20px",
              borderRadius: "14px",
              marginBottom: "24px",
            }}
          >
            <p
              style={{
                fontWeight: "bold",
                marginBottom: "12px",
                fontSize: "20px",
              }}
            >
              Resumen del análisis
            </p>

            <p
              style={{
                marginBottom: "14px",
                lineHeight: 1.7,
                color: "#1f2937",
              }}
            >
              {analysis.summary}
            </p>

            <DetailRow
              label="Tipo de documento"
              value={analysis.documentType}
            />
            <DetailRow
              label="Páginas detectadas"
              value={analysis.pageCount}
            />

            {message && (
              <div style={{ marginTop: "10px" }}>
                <DetailRow label="Estado" value={message} />
              </div>
            )}
          </div>

          <div style={{ marginBottom: "28px" }}>
            {(() => {
              const styles = getAttentionStyles(analysis.guidance.attentionLevel);

              return (
                <section
                  style={{
                    background: styles.background,
                    border: styles.border,
                    borderRadius: "16px",
                    padding: "22px",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                      flexWrap: "wrap",
                      marginBottom: "14px",
                    }}
                  >
                    <span
                      style={{
                        background: styles.badgeBackground,
                        color: styles.badgeColor,
                        padding: "5px 12px",
                        borderRadius: "999px",
                        fontSize: "12px",
                        fontWeight: 700,
                        textTransform: "uppercase",
                        letterSpacing: "0.5px",
                      }}
                    >
                      {styles.label}
                    </span>

                    <h3
                      style={{
                        margin: 0,
                        fontSize: "26px",
                        color: styles.titleColor,
                      }}
                    >
                      Conclusión final
                    </h3>
                  </div>

                  <p
                    style={{
                      marginTop: 0,
                      marginBottom: "18px",
                      lineHeight: 1.75,
                      color: "#1f2937",
                    }}
                  >
                    {analysis.guidance.summary}
                  </p>

                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
                      gap: "16px",
                    }}
                  >
                    <div
                      style={{
                        background: "rgba(255,255,255,0.72)",
                        border: "1px solid rgba(0,0,0,0.05)",
                        borderRadius: "12px",
                        padding: "16px",
                      }}
                    >
                      <div
                        style={{
                          fontWeight: 700,
                          marginBottom: "10px",
                          color: "#111827",
                        }}
                      >
                        Qué revisaría antes de firmar
                      </div>

                      <ul
                        style={{
                          margin: 0,
                          paddingLeft: "18px",
                          lineHeight: 1.8,
                          color: "#374151",
                        }}
                      >
                        {analysis.guidance.nextSteps.map((step, index) => (
                          <li key={index}>{step}</li>
                        ))}
                      </ul>
                    </div>

                    <div
                      style={{
                        background: "rgba(255,255,255,0.72)",
                        border: "1px solid rgba(0,0,0,0.05)",
                        borderRadius: "12px",
                        padding: "16px",
                      }}
                    >
                      <div
                        style={{
                          fontWeight: 700,
                          marginBottom: "10px",
                          color: "#111827",
                        }}
                      >
                        Preguntas para hacer al arrendador
                      </div>

                      <ul
                        style={{
                          margin: 0,
                          paddingLeft: "18px",
                          lineHeight: 1.8,
                          color: "#374151",
                        }}
                      >
                        {analysis.guidance.questionsToAsk.map((question, index) => (
                          <li key={index}>{question}</li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div
                    style={{
                      marginTop: "16px",
                      padding: "14px 16px",
                      borderRadius: "12px",
                      background: "rgba(255,255,255,0.72)",
                      border: "1px solid rgba(0,0,0,0.05)",
                      color: "#374151",
                      lineHeight: 1.7,
                    }}
                  >
                    <strong>Revisión profesional recomendada:</strong>{" "}
                    {analysis.guidance.professionalReviewRecommended
                      ? "Sí, conviene valorar una revisión jurídica antes de firmar."
                      : "No parece imprescindible con esta primera revisión, aunque sigue siendo recomendable si tienes dudas importantes."}
                  </div>
                </section>
              );
            })()}
          </div>

          {analysis.items.length === 0 ? (
            <div
              style={{
                background: "#f9fafb",
                border: "1px solid #e5e7eb",
                padding: "18px",
                borderRadius: "14px",
                marginBottom: "24px",
              }}
            >
              <p style={{ margin: 0 }}>
                No se detectaron riesgos principales en esta versión básica.
              </p>
            </div>
          ) : (
            <div style={{ marginBottom: "28px" }}>
              <h3
                style={{
                  fontSize: "26px",
                  marginBottom: "14px",
                  color: "#111827",
                }}
              >
                Riesgos detectados
              </h3>

              <div style={{ display: "grid", gap: "18px" }}>
                {analysis.items.map((item) => {
                  const styles = getLevelStyles(item.level);

                  return (
                    <article
                      key={item.id}
                      style={{
                        background: styles.background,
                        border: styles.border,
                        padding: "22px",
                        borderRadius: "14px",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "12px",
                          marginBottom: "16px",
                          flexWrap: "wrap",
                        }}
                      >
                        <span
                          style={{
                            background: styles.badgeBackground,
                            color: styles.badgeColor,
                            padding: "5px 12px",
                            borderRadius: "999px",
                            fontSize: "12px",
                            fontWeight: "bold",
                            textTransform: "uppercase",
                            letterSpacing: "0.5px",
                          }}
                        >
                          {item.level}
                        </span>

                        <h3
                          style={{
                            margin: 0,
                            fontSize: "24px",
                            lineHeight: 1.3,
                            color: styles.titleColor,
                          }}
                        >
                          {item.title}
                        </h3>
                      </div>

                      <div
                        style={{
                          background: "rgba(255,255,255,0.55)",
                          border: "1px solid rgba(0,0,0,0.05)",
                          borderRadius: "12px",
                          padding: "16px",
                        }}
                      >
                        <DetailRow
                          label="Indicador encontrado"
                          value={item.matchedTerm}
                        />

                        <DetailRow label="Página aproximada" value={item.page} />

                        {item.clauseLabel && (
                          <DetailRow
                            label="Cláusula/apartado aproximado"
                            value={item.clauseLabel}
                          />
                        )}

                        <DetailRow label="Explicación" value={item.explanation} />

                        <div style={{ marginBottom: "12px" }}>
                          <div style={{ fontWeight: 700, marginBottom: "6px" }}>
                            Fragmento:
                          </div>
                          <div
                            style={{
                              background: "rgba(255,255,255,0.7)",
                              border: "1px solid rgba(0,0,0,0.06)",
                              borderRadius: "10px",
                              padding: "12px",
                              lineHeight: 1.75,
                              whiteSpace: "pre-line",
                              color: "#1f2937",
                            }}
                          >
                            {item.snippet}
                          </div>
                        </div>

                        <DetailRow
                          label="Recomendación"
                          value={item.recommendation}
                        />
                      </div>
                    </article>
                  );
                })}
              </div>
            </div>
          )}

          <div>
            <h3
              style={{
                fontSize: "26px",
                marginBottom: "8px",
                color: "#111827",
              }}
            >
              Posibles puntos a revisar
            </h3>

            <p
              style={{
                marginBottom: "14px",
                color: "#4b5563",
                lineHeight: 1.6,
              }}
            >
              Estas señales no alcanzan el nivel de riesgo principal, pero pueden merecer una revisión manual antes de firmar.
            </p>

            {analysis.reviewItems.length === 0 ? (
              <div
                style={{
                  background: "#f9fafb",
                  border: "1px solid #e5e7eb",
                  padding: "18px",
                  borderRadius: "14px",
                }}
              >
                <p style={{ margin: 0 }}>
                  No se detectaron posibles puntos adicionales a revisar en este documento.
                </p>
              </div>
            ) : (
              <div style={{ display: "grid", gap: "18px" }}>
                {analysis.reviewItems.map((item) => (
                  <ReviewCard key={item.id} item={item} />
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
}