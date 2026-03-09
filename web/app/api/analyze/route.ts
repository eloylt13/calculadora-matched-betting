import { NextResponse } from "next/server";
import { extractPdfTextFromBuffer } from "../../../lib/pdf/extract";
import {
  classifyBasicRentalRisks,
  classifyWeakRentalSignals,
} from "../../../lib/analysis/classify";
import type {
  AnalyzeApiResponse,
  FinalGuidance,
  ReviewItem,
  RiskItem,
} from "../../../types/risk";

function formatCount(count: number, singular: string, plural: string) {
  return count === 1 ? `${count} ${singular}` : `${count} ${plural}`;
}

function buildSummary(findings: RiskItem[], reviewItems: ReviewItem[]) {
  const mainCount = findings.length;
  const reviewCount = reviewItems.length;

  if (mainCount === 0 && reviewCount === 0) {
    return "No se detectaron riesgos principales ni posibles puntos de revisión con esta primera versión básica del analizador.";
  }

  if (mainCount > 0 && reviewCount === 0) {
    return `Se detectaron ${formatCount(
      mainCount,
      "posible señal de riesgo",
      "posibles señales de riesgo"
    )}.`;
  }

  if (mainCount === 0 && reviewCount > 0) {
    return `No se detectaron riesgos principales, pero sí ${formatCount(
      reviewCount,
      "posible punto adicional a revisar manualmente",
      "posibles puntos adicionales a revisar manualmente"
    )}.`;
  }

  return `Se detectaron ${formatCount(
    mainCount,
    "posible señal de riesgo",
    "posibles señales de riesgo"
  )} y ${formatCount(
    reviewCount,
    "posible punto adicional a revisar manualmente",
    "posibles puntos adicionales a revisar manualmente"
  )}.`;
}

function pushUnique(list: string[], value: string) {
  if (!list.includes(value)) {
    list.push(value);
  }
}

function buildGuidance(findings: RiskItem[], reviewItems: ReviewItem[]): FinalGuidance {
  const nextSteps: string[] = [];
  const questionsToAsk: string[] = [];

  const hasRed = findings.some((item) => item.level === "red");
  const hasYellow = findings.some((item) => item.level === "yellow");

  const titles = new Set(findings.map((item) => item.title));
  const reviewTitles = new Set(reviewItems.map((item) => item.title));

  if (titles.has("Penalización económica por salida anticipada")) {
    pushUnique(
      nextSteps,
      "Lee completa la cláusula de desistimiento y anota exactamente cómo se calcula la indemnización."
    );
    pushUnique(
      questionsToAsk,
      "¿Cómo se calcula exactamente la indemnización por salida anticipada y en qué casos se aplica?"
    );
  }

  if (titles.has("Desistimiento o salida anticipada")) {
    pushUnique(
      nextSteps,
      "Confirma el plazo mínimo de permanencia y el preaviso exigido antes de marcharte."
    );
    pushUnique(
      questionsToAsk,
      "¿Qué preaviso tengo que dar si quiero dejar la vivienda antes de tiempo?"
    );
  }

  if (titles.has("Renovación automática")) {
    pushUnique(
      nextSteps,
      "Apunta el plazo de preaviso para evitar que el contrato se prorrogue automáticamente."
    );
    pushUnique(
      questionsToAsk,
      "¿Con cuántos días de antelación tengo que avisar para evitar la renovación automática?"
    );
  }

  if (titles.has("Gastos adicionales a cargo del inquilino")) {
    pushUnique(
      nextSteps,
      "Haz una lista de todos los gastos extra que asumirías además de la renta mensual."
    );
    pushUnique(
      questionsToAsk,
      "¿Qué gastos concretos pago yo y cuáles asume el arrendador?"
    );
  }

  if (titles.has("Garantías adicionales o reforzadas")) {
    pushUnique(
      nextSteps,
      "Comprueba si te exigen algo más que la fianza legal, como aval bancario o garantía complementaria."
    );
    pushUnique(
      questionsToAsk,
      "¿Además de la fianza legal se exige alguna garantía adicional o aval?"
    );
  }

  if (titles.has("Responsabilidad excesiva del inquilino")) {
    pushUnique(
      nextSteps,
      "Revisa si el contrato te carga reparaciones o desperfectos que no deberían recaer automáticamente sobre ti."
    );
    pushUnique(
      questionsToAsk,
      "¿Qué reparaciones o desperfectos asumiría yo y cuáles corresponderían al arrendador?"
    );
  }

  if (reviewTitles.has("Posible revisión de fianza o garantías")) {
    pushUnique(
      nextSteps,
      "Comprueba si la cláusula de fianza se limita a la fianza legal o si hay condiciones adicionales."
    );
    pushUnique(
      questionsToAsk,
      "¿La garantía exigida se limita a la fianza legal o hay alguna condición extra?"
    );
  }

  if (reviewTitles.has("Posible revisión de gastos y suministros")) {
    pushUnique(
      nextSteps,
      "Revisa si aparecen gastos o suministros mencionados sin quedar claro quién los paga."
    );
    pushUnique(
      questionsToAsk,
      "¿Los suministros y gastos comunes están incluidos o los tengo que pagar aparte?"
    );
  }

  if (reviewTitles.has("Posible revisión de reparaciones o desperfectos")) {
    pushUnique(
      nextSteps,
      "Distingue entre desgaste ordinario y daños causados por el inquilino antes de asumir responsabilidades."
    );
    pushUnique(
      questionsToAsk,
      "¿Cómo distingue el contrato entre desgaste normal y daños imputables al inquilino?"
    );
  }

  if (nextSteps.length === 0) {
    pushUnique(
      nextSteps,
      "Lee de principio a fin las cláusulas económicas y las condiciones de duración antes de firmar."
    );
  }

  if (questionsToAsk.length === 0) {
    pushUnique(
      questionsToAsk,
      "¿Hay alguna cláusula económica o condición especial que deba conocer antes de firmar?"
    );
  }

  let attentionLevel: FinalGuidance["attentionLevel"] = "low";
  let summary =
    "No se aprecia una señal fuerte de riesgo en esta revisión inicial, aunque siempre conviene leer el contrato completo antes de firmar.";
  let professionalReviewRecommended = false;

  if (hasRed) {
    attentionLevel = "high";
    summary =
      "Este contrato merece una revisión cuidadosa antes de firmar. Al menos una cláusula muestra una señal fuerte de impacto económico o de condición relevante para ti como inquilino.";
    professionalReviewRecommended = true;
  } else if (hasYellow || reviewItems.length >= 2) {
    attentionLevel = "medium";
    summary =
      "El contrato contiene varios puntos que conviene revisar con calma antes de firmar. No necesariamente implican un problema grave, pero sí merecen comprobación.";
    professionalReviewRecommended = reviewItems.length >= 3;
  }

  return {
    attentionLevel,
    summary,
    nextSteps: nextSteps.slice(0, 4),
    questionsToAsk: questionsToAsk.slice(0, 4),
    professionalReviewRecommended,
  };
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!file || !(file instanceof File)) {
      return NextResponse.json<AnalyzeApiResponse>(
        {
          ok: false,
          message: "No se recibió ningún archivo válido.",
        },
        { status: 400 }
      );
    }

    const isPdf =
      file.type === "application/pdf" ||
      file.name.toLowerCase().endsWith(".pdf");

    if (!isPdf) {
      return NextResponse.json<AnalyzeApiResponse>(
        {
          ok: false,
          message: "El archivo recibido no es un PDF.",
        },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const extracted = await extractPdfTextFromBuffer(buffer);

    if (!extracted.text) {
      return NextResponse.json<AnalyzeApiResponse>({
        ok: true,
        message: "El PDF se recibió, pero no se pudo extraer texto útil.",
        analysis: {
          documentType: "Contrato de alquiler",
          pageCount: extracted.pageCount,
          summary:
            "No se pudo extraer texto útil del PDF. Puede que el documento sea una imagen escaneada o tenga poco texto accesible.",
          items: [],
          reviewItems: [],
          guidance: {
            attentionLevel: "medium",
            summary:
              "No se pudo analizar el contenido del contrato con suficiente fiabilidad. Antes de firmar, conviene revisarlo manualmente o usar un PDF con texto seleccionable.",
            nextSteps: [
              "Comprueba si el PDF tiene texto seleccionable o si es una imagen escaneada.",
              "Prueba con una versión más legible del documento.",
            ],
            questionsToAsk: [
              "¿Puedes facilitarme una versión más clara o editable del contrato?",
            ],
            professionalReviewRecommended: false,
          },
        },
      });
    }

    const findings = classifyBasicRentalRisks(extracted.pages);
    const reviewItems = classifyWeakRentalSignals(extracted.pages, findings);
    const summary = buildSummary(findings, reviewItems);
    const guidance = buildGuidance(findings, reviewItems);

    return NextResponse.json<AnalyzeApiResponse>({
      ok: true,
      message: "Análisis completado correctamente.",
      analysis: {
        documentType: "Contrato de alquiler",
        pageCount: extracted.pageCount,
        summary,
        items: findings,
        reviewItems,
        guidance,
      },
    });
  } catch (error) {
    console.error("Error al analizar el PDF:", error);

    return NextResponse.json<AnalyzeApiResponse>(
      {
        ok: false,
        message: "Error al procesar el PDF y analizar sus riesgos básicos.",
      },
      { status: 500 }
    );
  }
}