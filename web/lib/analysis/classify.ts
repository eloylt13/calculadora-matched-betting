import type { ReviewItem, RiskItem, RiskLevel } from "../../types/risk";
import type { ExtractedPdfPage } from "../pdf/extract";

type Indicator = {
  term: string;
  score: number;
};

type AnalysisTopic =
  | "exit_penalty"
  | "exit_general"
  | "renewal"
  | "costs"
  | "guarantees"
  | "liability"
  | "other";

type RiskRule = {
  topic: AnalysisTopic;
  title: string;
  level: RiskLevel;
  explanation: string;
  recommendation: string;
  coreIndicators: Indicator[];
  contextIndicators: Indicator[];
  hardRequirements?: string[][];
  avoidIndicators?: string[];
  evidenceTerms?: string[];
  minCoreScore: number;
  minTotalScore: number;
};

type ReviewRule = {
  topic: AnalysisTopic;
  title: string;
  explanation: string;
  recommendation: string;
  indicators: Indicator[];
  avoidIndicators?: string[];
  evidenceTerms?: string[];
  minScore: number;
};

type ClauseSegment = {
  page: number;
  clauseLabel?: string;
  text: string;
};

type CandidateClause = {
  page: number;
  clauseLabel?: string;
  text: string;
  score: number;
  coreScore: number;
  matchedTerms: string[];
  firstIndex: number;
  focusIndex: number;
};

type CandidateReviewClause = {
  page: number;
  clauseLabel?: string;
  text: string;
  score: number;
  matchedTerms: string[];
  firstIndex: number;
  focusIndex: number;
};

const CLAUSE_HEADING_REGEX =
  /^(?:(\d{1,2})\s*[.)-]\s*|(?:primera|segunda|tercera|cuarta|quinta|sexta|séptima|septima|octava|novena|décima|decima|undécima|undecima|duodécima|duodecima|decimotercera|decimocuarta|decimoquinta|decimosexta|decimoséptima|decimoseptima|decimoctava|decimonovena|vigésima|vigesima)\b)/i;

const EXIT_TERMS = [
  "desistimiento",
  "desistir del contrato",
  "rescisión anticipada",
  "rescision anticipada",
  "resolver el contrato antes",
  "abandona la vivienda antes",
  "abandono anticipado",
  "salida anticipada",
];

const EXPLICIT_ECONOMIC_PENALTY_TERMS = [
  "deberá abonar",
  "debera abonar",
  "deberá pagar",
  "debera pagar",
  "abonará al arrendador",
  "abonara al arrendador",
  "pagará al arrendador",
  "pagara al arrendador",
  "una mensualidad",
  "mensualidad de renta",
  "cantidad equivalente",
  "compensación económica",
  "compensacion economica",
  "deberá indemnizar al arrendador",
  "debera indemnizar al arrendador",
  "indemnizar al arrendador",
  "importe equivalente",
  "penalización",
  "penalizacion",
  "compensación",
  "compensacion",
];

const ANTI_PENALTY_TERMS = [
  "sin que ello genere derecho a indemnización",
  "sin que ello genere derecho a indemnizacion",
  "sin derecho a indemnización",
  "sin derecho a indemnizacion",
  "no generará derecho a indemnización",
  "no generara derecho a indemnizacion",
  "no dará derecho a indemnización",
  "no dara derecho a indemnizacion",
  "derecho a indemnización alguna por parte del arrendador",
  "derecho a indemnizacion alguna por parte del arrendador",
];

const COMMON_EDITORIAL_NOISE = [
  "la inclusión de esta cláusula",
  "la inclusion de esta clausula",
  "está sujeta al libre acuerdo de las partes",
  "esta sujeta al libre acuerdo de las partes",
  "ha venido siendo habitual",
  "a través de ellos",
  "a traves de ellos",
  "este límite también resulta aplicable",
  "este limite tambien resulta aplicable",
  "en el caso de que la normativa",
  "si la normativa así lo exige",
  "si la normativa asi lo exige",
];

const EXTRA_GUARANTEE_TERMS = [
  "garantía adicional",
  "garantia adicional",
  "garantía complementaria",
  "garantia complementaria",
  "aval bancario",
  "depósito adicional",
  "deposito adicional",
  "además de la fianza",
  "ademas de la fianza",
  "adicional a la fianza",
  "complementaria a la fianza",
  "dos mensualidades",
  "2 mensualidades",
  "más de una mensualidad",
  "mas de una mensualidad",
  "garantía extra",
  "garantia extra",
];

const ADDITIONAL_COST_TERMS = [
  "gastos de comunidad",
  "gastos repercutibles",
  "todos los gastos",
  "ibi",
  "impuesto sobre bienes inmuebles",
  "tasa de basura",
  "tasa de basuras",
  "suministros",
  "consumo de agua",
  "agua",
  "luz",
  "gas",
  "electricidad",
  "internet",
  "telefonía",
  "telefonia",
];

const COST_ASSIGNMENT_TERMS = [
  "por cuenta del arrendatario",
  "a cargo del arrendatario",
  "serán por cuenta del arrendatario",
  "seran por cuenta del arrendatario",
  "serán a cargo del arrendatario",
  "seran a cargo del arrendatario",
  "deberá pagar",
  "debera pagar",
  "abonará",
  "abonara",
  "serán satisfechos por el arrendatario",
  "seran satisfechos por el arrendatario",
  "repercutidos al arrendatario",
];

const COST_AVOID_TERMS = [
  "incluidos en la renta",
  "incluido en la renta",
  "incluidas en la renta",
  "incluidos en el precio",
  "a cargo del arrendador",
  "por cuenta del arrendador",
  "serán por cuenta del arrendador",
  "seran por cuenta del arrendador",
  "serán a cargo del arrendador",
  "seran a cargo del arrendador",
];

const TENANT_LIABILITY_TERMS = [
  "será responsable de cualquier",
  "sera responsable de cualquier",
  "todo desperfecto",
  "todos los desperfectos",
  "cualquier avería será por cuenta del arrendatario",
  "cualquier averia sera por cuenta del arrendatario",
  "por cuenta del arrendatario",
  "a cargo del arrendatario",
  "deberá asumir",
  "debera asumir",
  "coste de reparación",
  "coste de reparacion",
  "reparación será de cuenta del arrendatario",
  "reparacion sera de cuenta del arrendatario",
  "serán de cuenta del arrendatario",
  "seran de cuenta del arrendatario",
  "serán a cargo del arrendatario",
  "seran a cargo del arrendatario",
  "exime al arrendador",
  "daños y perjuicios",
  "danos y perjuicios",
];

const TENANT_LIABILITY_SOFT_TERMS = [
  "arrendatario",
  "desperfectos",
  "averías",
  "averias",
  "daños",
  "danos",
  "reparaciones",
  "costes",
  "gastos",
  "asumir",
];

const TENANT_LIABILITY_AVOID_TERMS = [
  "a cargo del arrendador",
  "por cuenta del arrendador",
  "serán por cuenta del arrendador",
  "seran por cuenta del arrendador",
  "serán a cargo del arrendador",
  "seran a cargo del arrendador",
  "salvo el desgaste por el uso ordinario",
  "salvo el desgaste por uso ordinario",
  "desgaste por el uso ordinario",
  "desgaste por uso ordinario",
  "conservación de la vivienda por el arrendador",
  "conservacion de la vivienda por el arrendador",
  "reparaciones necesarias para conservar la vivienda",
  "obras necesarias para conservar la vivienda",
];

const RISK_RULES: RiskRule[] = [
  {
    topic: "exit_penalty",
    title: "Penalización económica por salida anticipada",
    level: "red",
    explanation:
      "La cláusula parece imponer un coste o consecuencia económica si el inquilino desiste del contrato antes de tiempo.",
    recommendation:
      "Revisa cuánto tendrías que pagar, cómo se calcula esa penalización y si puede negociarse o limitarse.",
    coreIndicators: [
      { term: "desistimiento", score: 2 },
      { term: "desistir del contrato", score: 3 },
      { term: "rescisión anticipada", score: 3 },
      { term: "rescision anticipada", score: 3 },
      { term: "resolver el contrato antes", score: 3 },
      { term: "abandona la vivienda antes", score: 3 },
      { term: "salida anticipada", score: 3 },

      { term: "deberá abonar", score: 4 },
      { term: "debera abonar", score: 4 },
      { term: "deberá pagar", score: 4 },
      { term: "debera pagar", score: 4 },
      { term: "abonará al arrendador", score: 4 },
      { term: "abonara al arrendador", score: 4 },
      { term: "pagará al arrendador", score: 4 },
      { term: "pagara al arrendador", score: 4 },
      { term: "una mensualidad", score: 4 },
      { term: "mensualidad de renta", score: 4 },
      { term: "cantidad equivalente", score: 4 },
      { term: "compensación económica", score: 4 },
      { term: "compensacion economica", score: 4 },
      { term: "deberá indemnizar al arrendador", score: 5 },
      { term: "debera indemnizar al arrendador", score: 5 },
      { term: "indemnizar al arrendador", score: 5 },
      { term: "importe equivalente", score: 4 },
      { term: "penalización", score: 4 },
      { term: "penalizacion", score: 4 },
      { term: "compensación", score: 3 },
      { term: "compensacion", score: 3 },
    ],
    contextIndicators: [
      { term: "arrendatario", score: 1 },
      { term: "arrendador", score: 1 },
      { term: "treinta días", score: 1 },
      { term: "treinta dias", score: 1 },
      { term: "seis meses", score: 1 },
      { term: "preaviso", score: 1 },
    ],
    hardRequirements: [EXIT_TERMS, EXPLICIT_ECONOMIC_PENALTY_TERMS],
    avoidIndicators: [...ANTI_PENALTY_TERMS],
    evidenceTerms: EXPLICIT_ECONOMIC_PENALTY_TERMS,
    minCoreScore: 6,
    minTotalScore: 7,
  },
  {
    topic: "exit_general",
    title: "Desistimiento o salida anticipada",
    level: "yellow",
    explanation:
      "El contrato regula el desistimiento o la salida anticipada del inquilino, pero en este fragmento no se aprecia con claridad una penalización económica explícita.",
    recommendation:
      "Revisa los plazos, el preaviso exigido y confirma si existe o no un coste económico asociado al desistimiento.",
    coreIndicators: [
      { term: "desistimiento", score: 3 },
      { term: "desistir del contrato", score: 3 },
      { term: "rescisión anticipada", score: 3 },
      { term: "rescision anticipada", score: 3 },
      { term: "resolver el contrato antes", score: 3 },
      { term: "abandona la vivienda antes", score: 3 },
      { term: "abandono anticipado", score: 3 },
      { term: "salida anticipada", score: 3 },
    ],
    contextIndicators: [
      { term: "arrendatario", score: 1 },
      { term: "preaviso", score: 2 },
      { term: "avise con", score: 2 },
      { term: "treinta días", score: 1 },
      { term: "treinta dias", score: 1 },
      { term: "seis meses", score: 1 },
      { term: "antelación", score: 1 },
      { term: "antelacion", score: 1 },
    ],
    hardRequirements: [EXIT_TERMS],
    avoidIndicators: [...EXPLICIT_ECONOMIC_PENALTY_TERMS],
    evidenceTerms: EXIT_TERMS,
    minCoreScore: 3,
    minTotalScore: 4,
  },
  {
    topic: "renewal",
    title: "Renovación automática",
    level: "yellow",
    explanation:
      "El contrato parece renovarse automáticamente o exigir preaviso para evitar la prórroga.",
    recommendation:
      "Comprueba el plazo de preaviso y las condiciones para evitar una renovación no deseada.",
    coreIndicators: [
      { term: "renovación automática", score: 4 },
      { term: "renovacion automatica", score: 4 },
      { term: "prórroga automática", score: 4 },
      { term: "prorroga automatica", score: 4 },
      { term: "se renovará automáticamente", score: 4 },
      { term: "se renovara automaticamente", score: 4 },
      { term: "tácita reconducción", score: 4 },
      { term: "tacita reconduccion", score: 4 },
      { term: "se prorrogará", score: 3 },
      { term: "se prorrogara", score: 3 },
    ],
    contextIndicators: [
      { term: "preaviso", score: 2 },
      { term: "salvo preaviso", score: 2 },
      { term: "comunicar", score: 1 },
      { term: "notificar", score: 1 },
      { term: "antelación", score: 1 },
      { term: "antelacion", score: 1 },
      { term: "prórrogas anuales", score: 2 },
      { term: "prorrogas anuales", score: 2 },
    ],
    hardRequirements: [
      [
        "renovación automática",
        "renovacion automatica",
        "prórroga automática",
        "prorroga automatica",
        "se renovará automáticamente",
        "se renovara automaticamente",
        "tácita reconducción",
        "tacita reconduccion",
        "se prorrogará",
        "se prorrogara",
      ],
    ],
    evidenceTerms: [
      "renovación automática",
      "renovacion automatica",
      "prórroga automática",
      "prorroga automatica",
      "se renovará automáticamente",
      "se renovara automaticamente",
      "tácita reconducción",
      "tacita reconduccion",
      "se prorrogará",
      "se prorrogara",
    ],
    minCoreScore: 3,
    minTotalScore: 4,
  },
  {
    topic: "costs",
    title: "Gastos adicionales a cargo del inquilino",
    level: "yellow",
    explanation:
      "La cláusula parece trasladar gastos extra al inquilino además de la renta, como comunidad, IBI, suministros u otros conceptos.",
    recommendation:
      "Comprueba qué gastos concretos asumes, si están claramente definidos y si algunos de ellos deberían corresponder al arrendador o estar ya incluidos.",
    coreIndicators: [
      { term: "gastos de comunidad", score: 4 },
      { term: "gastos repercutibles", score: 4 },
      { term: "todos los gastos", score: 4 },
      { term: "ibi", score: 3 },
      { term: "impuesto sobre bienes inmuebles", score: 3 },
      { term: "tasa de basura", score: 3 },
      { term: "tasa de basuras", score: 3 },
      { term: "suministros", score: 2 },
      { term: "consumo de agua", score: 2 },
      { term: "agua", score: 1 },
      { term: "luz", score: 1 },
      { term: "gas", score: 1 },
      { term: "electricidad", score: 1 },
      { term: "internet", score: 1 },
      { term: "telefonía", score: 1 },
      { term: "telefonia", score: 1 },
    ],
    contextIndicators: [
      { term: "por cuenta del arrendatario", score: 4 },
      { term: "a cargo del arrendatario", score: 4 },
      { term: "serán por cuenta del arrendatario", score: 5 },
      { term: "seran por cuenta del arrendatario", score: 5 },
      { term: "serán a cargo del arrendatario", score: 5 },
      { term: "seran a cargo del arrendatario", score: 5 },
      { term: "deberá pagar", score: 3 },
      { term: "debera pagar", score: 3 },
      { term: "abonará", score: 3 },
      { term: "abonara", score: 3 },
      { term: "serán satisfechos por el arrendatario", score: 5 },
      { term: "seran satisfechos por el arrendatario", score: 5 },
      { term: "repercutidos al arrendatario", score: 5 },
    ],
    hardRequirements: [ADDITIONAL_COST_TERMS, COST_ASSIGNMENT_TERMS],
    avoidIndicators: [...COST_AVOID_TERMS],
    evidenceTerms: [
      "gastos de comunidad",
      "gastos repercutibles",
      "todos los gastos",
      "ibi",
      "impuesto sobre bienes inmuebles",
      "tasa de basura",
      "tasa de basuras",
      "suministros",
      "por cuenta del arrendatario",
      "a cargo del arrendatario",
      "serán por cuenta del arrendatario",
      "seran por cuenta del arrendatario",
      "serán a cargo del arrendatario",
      "seran a cargo del arrendatario",
    ],
    minCoreScore: 3,
    minTotalScore: 5,
  },
  {
    topic: "guarantees",
    title: "Garantías adicionales o reforzadas",
    level: "yellow",
    explanation:
      "La cláusula parece exigir una garantía adicional, complementaria o reforzada, más allá de la simple fianza legal estándar.",
    recommendation:
      "Comprueba si además de la fianza legal se te exige aval bancario, garantía complementaria o más de una mensualidad de respaldo.",
    coreIndicators: [
      { term: "aval bancario", score: 5 },
      { term: "garantía adicional", score: 5 },
      { term: "garantia adicional", score: 5 },
      { term: "garantía complementaria", score: 5 },
      { term: "garantia complementaria", score: 5 },
      { term: "depósito adicional", score: 5 },
      { term: "deposito adicional", score: 5 },
      { term: "además de la fianza", score: 5 },
      { term: "ademas de la fianza", score: 5 },
      { term: "adicional a la fianza", score: 5 },
      { term: "complementaria a la fianza", score: 5 },
      { term: "dos mensualidades", score: 4 },
      { term: "2 mensualidades", score: 4 },
      { term: "más de una mensualidad", score: 4 },
      { term: "mas de una mensualidad", score: 4 },
      { term: "garantía extra", score: 4 },
      { term: "garantia extra", score: 4 },
    ],
    contextIndicators: [
      { term: "fianza", score: 1 },
      { term: "en concepto de fianza", score: 2 },
      { term: "mensualidad de renta", score: 2 },
      { term: "arrendatario hace entrega", score: 2 },
      { term: "arrendatario entrega", score: 2 },
      { term: "se exige", score: 2 },
      { term: "queda obligado", score: 2 },
    ],
    hardRequirements: [EXTRA_GUARANTEE_TERMS],
    avoidIndicators: [...COMMON_EDITORIAL_NOISE],
    evidenceTerms: EXTRA_GUARANTEE_TERMS,
    minCoreScore: 4,
    minTotalScore: 5,
  },
  {
    topic: "liability",
    title: "Responsabilidad excesiva del inquilino",
    level: "yellow",
    explanation:
      "La cláusula parece trasladar al inquilino una responsabilidad amplia o especialmente onerosa por daños, averías, reparaciones o desperfectos.",
    recommendation:
      "Revisa si se te atribuyen costes o responsabilidades que deberían limitarse a daños causados por ti o corresponder al arrendador.",
    coreIndicators: [
      { term: "será responsable de cualquier", score: 5 },
      { term: "sera responsable de cualquier", score: 5 },
      { term: "todo desperfecto", score: 5 },
      { term: "todos los desperfectos", score: 5 },
      { term: "cualquier avería será por cuenta del arrendatario", score: 6 },
      { term: "cualquier averia sera por cuenta del arrendatario", score: 6 },
      { term: "por cuenta del arrendatario", score: 4 },
      { term: "a cargo del arrendatario", score: 4 },
      { term: "deberá asumir", score: 4 },
      { term: "debera asumir", score: 4 },
      { term: "coste de reparación", score: 4 },
      { term: "coste de reparacion", score: 4 },
      { term: "reparación será de cuenta del arrendatario", score: 5 },
      { term: "reparacion sera de cuenta del arrendatario", score: 5 },
      { term: "serán de cuenta del arrendatario", score: 5 },
      { term: "seran de cuenta del arrendatario", score: 5 },
      { term: "serán a cargo del arrendatario", score: 5 },
      { term: "seran a cargo del arrendatario", score: 5 },
      { term: "exime al arrendador", score: 6 },
      { term: "daños y perjuicios", score: 4 },
      { term: "danos y perjuicios", score: 4 },
    ],
    contextIndicators: [
      { term: "arrendatario", score: 1 },
      { term: "desperfectos", score: 2 },
      { term: "averías", score: 2 },
      { term: "averias", score: 2 },
      { term: "daños", score: 2 },
      { term: "danos", score: 2 },
      { term: "reparaciones", score: 2 },
      { term: "asumir", score: 1 },
      { term: "costes", score: 1 },
      { term: "gastos", score: 1 },
    ],
    hardRequirements: [TENANT_LIABILITY_TERMS, TENANT_LIABILITY_SOFT_TERMS],
    avoidIndicators: [...TENANT_LIABILITY_AVOID_TERMS],
    evidenceTerms: TENANT_LIABILITY_TERMS,
    minCoreScore: 5,
    minTotalScore: 7,
  },
];

const REVIEW_RULES: ReviewRule[] = [
  {
    topic: "costs",
    title: "Posible revisión de gastos y suministros",
    explanation:
      "Se mencionan gastos, suministros o conceptos asociados a la vivienda, pero no se aprecia con suficiente claridad una asignación fuerte al inquilino en este fragmento.",
    recommendation:
      "Busca si aparecen frases como 'por cuenta del arrendatario' o 'a cargo del arrendatario' junto a comunidad, IBI, agua, luz o gas.",
    indicators: [
      { term: "gastos de comunidad", score: 3 },
      { term: "suministros", score: 2 },
      { term: "ibi", score: 2 },
      { term: "agua", score: 1 },
      { term: "luz", score: 1 },
      { term: "gas", score: 1 },
      { term: "electricidad", score: 1 },
      { term: "tasa de basura", score: 2 },
      { term: "tasa de basuras", score: 2 },
      { term: "internet", score: 1 },
    ],
    avoidIndicators: [...COST_AVOID_TERMS],
    evidenceTerms: ADDITIONAL_COST_TERMS,
    minScore: 3,
  },
  {
    topic: "guarantees",
    title: "Posible revisión de fianza o garantías",
    explanation:
      "El contrato menciona fianza o garantías, pero no queda claro en este fragmento si existe una garantía reforzada más allá del estándar legal.",
    recommendation:
      "Comprueba si solo se exige la fianza legal o si además aparece aval, garantía complementaria o más de una mensualidad.",
    indicators: [
      { term: "fianza", score: 2 },
      { term: "en concepto de fianza", score: 3 },
      { term: "mensualidad de renta", score: 2 },
      { term: "garantía", score: 1 },
      { term: "garantia", score: 1 },
      { term: "aval", score: 2 },
    ],
    evidenceTerms: [
      "en concepto de fianza",
      "fianza",
      "garantía",
      "garantia",
      "aval",
    ],
    minScore: 3,
  },
  {
    topic: "liability",
    title: "Posible revisión de reparaciones o desperfectos",
    explanation:
      "Se mencionan reparaciones, daños o desperfectos, pero no queda suficientemente clara una responsabilidad especialmente onerosa del inquilino en este fragmento.",
    recommendation:
      "Comprueba quién asume reparaciones, averías y desperfectos, y distingue entre desgaste ordinario y daños causados por el inquilino.",
    indicators: [
      { term: "reparaciones", score: 2 },
      { term: "desperfectos", score: 2 },
      { term: "averías", score: 2 },
      { term: "averias", score: 2 },
      { term: "daños", score: 1 },
      { term: "danos", score: 1 },
      { term: "conservación", score: 1 },
      { term: "conservacion", score: 1 },
      { term: "mantenimiento", score: 1 },
      { term: "por cuenta del arrendatario", score: 3 },
      { term: "a cargo del arrendatario", score: 3 },
      { term: "deberá asumir", score: 2 },
      { term: "debera asumir", score: 2 },
    ],
    avoidIndicators: [
      ...TENANT_LIABILITY_AVOID_TERMS,
      "daños causados dolosamente",
      "obras no consentidas",
      "cuando el consentimiento de éste sea necesario",
      "cuando el consentimiento de este sea necesario",
    ],
    evidenceTerms: [
      "reparaciones",
      "desperfectos",
      "averías",
      "averias",
      "por cuenta del arrendatario",
      "a cargo del arrendatario",
    ],
    minScore: 4,
  },
];

function normalizeText(text: string) {
  return text
    .replace(/-\s*\n\s*/g, "")
    .replace(/\r/g, "")
    .replace(/\t/g, " ")
    .replace(/\n+/g, " ")
    .replace(/\s+/g, " ")
    .replace(/\s+([.,;:])/g, "$1")
    .replace(/([.,;:])(?=\S)/g, "$1 ")
    .replace(/\(\s+/g, "(")
    .replace(/\s+\)/g, ")")
    .replace(/([A-Za-zÁÉÍÓÚáéíóúÑñ])(\d{1,2})(?=[\s.,;:])/g, "$1")
    .trim();
}

function buildClauseLabel(text: string) {
  const cleaned = normalizeText(text);
  const match = cleaned.match(/^(.{1,90}?)(?:\.\s|:\s|$)/);

  if (!match) return undefined;

  const label = match[1].trim();
  return label.length >= 3 ? label : undefined;
}

function splitIntoClauses(page: ExtractedPdfPage): ClauseSegment[] {
  const rawLines = page.text
    .replace(/\r/g, "")
    .split(/\n+/)
    .map((line) => normalizeText(line))
    .filter((line) => line.length > 0);

  const clauses: ClauseSegment[] = [];
  let currentLabel: string | undefined;
  let currentLines: string[] = [];
  let sawClauseHeading = false;

  for (const line of rawLines) {
    const isHeading = CLAUSE_HEADING_REGEX.test(line);

    if (isHeading) {
      sawClauseHeading = true;

      if (currentLines.length > 0) {
        clauses.push({
          page: page.page,
          clauseLabel: currentLabel,
          text: normalizeText(currentLines.join(" ")),
        });
      }

      currentLabel = buildClauseLabel(line);
      currentLines = [line];
    } else {
      currentLines.push(line);
    }
  }

  if (currentLines.length > 0) {
    clauses.push({
      page: page.page,
      clauseLabel: currentLabel,
      text: normalizeText(currentLines.join(" ")),
    });
  }

  if (sawClauseHeading) {
    return clauses.filter((clause) => clause.text.length > 30);
  }

  const blocks = page.text
    .replace(/\r/g, "")
    .split(/\n\s*\n/)
    .map((block) => normalizeText(block))
    .filter((block) => block.length > 30);

  return blocks.map((block) => ({
    page: page.page,
    clauseLabel: undefined,
    text: block,
  }));
}

function containsAny(text: string, terms: string[] = []) {
  const lower = text.toLowerCase();
  return terms.some((term) => lower.includes(term.toLowerCase()));
}

function passesHardRequirements(text: string, groups: string[][] = []) {
  if (!groups.length) return true;

  const lower = text.toLowerCase();

  return groups.every((group) =>
    group.some((term) => lower.includes(term.toLowerCase()))
  );
}

function scoreIndicators(text: string, indicators: Indicator[]) {
  const lower = text.toLowerCase();
  let score = 0;
  const matchedTerms: string[] = [];
  let firstIndex = -1;

  for (const indicator of indicators) {
    const index = lower.indexOf(indicator.term.toLowerCase());

    if (index !== -1) {
      score += indicator.score;
      matchedTerms.push(indicator.term);

      if (firstIndex === -1 || index < firstIndex) {
        firstIndex = index;
      }
    }
  }

  return { score, matchedTerms, firstIndex };
}

function findBestFocusIndex(text: string, preferredTerms: string[] = []) {
  const lower = text.toLowerCase();
  let bestIndex = -1;

  for (const term of preferredTerms) {
    const index = lower.indexOf(term.toLowerCase());
    if (index !== -1 && (bestIndex === -1 || index < bestIndex)) {
      bestIndex = index;
    }
  }

  return bestIndex;
}

function moveToWordStart(text: string, index: number) {
  let i = index;
  while (i > 0 && /\S/.test(text[i - 1])) {
    i--;
  }
  return i;
}

function moveToWordEnd(text: string, index: number) {
  let i = index;
  while (i < text.length && /\S/.test(text[i])) {
    i++;
  }
  return i;
}

function findSmartStart(text: string, index: number) {
  const min = Math.max(0, index - 240);

  for (let i = index; i >= min; i--) {
    if (
      text[i] === "." ||
      text[i] === ";" ||
      text[i] === ":" ||
      text[i] === "\n"
    ) {
      let start = i + 1;
      while (start < text.length && /\s/.test(text[start])) {
        start++;
      }
      return start;
    }
  }

  return moveToWordStart(text, Math.max(0, index - 180));
}

function findSmartEnd(text: string, index: number) {
  const max = Math.min(text.length, index + 320);

  for (let i = index; i < max; i++) {
    if (
      text[i] === "." ||
      text[i] === ";" ||
      text[i] === ":" ||
      text[i] === "\n"
    ) {
      return i + 1;
    }
  }

  return moveToWordEnd(text, Math.min(text.length, index + 240));
}

function buildFocusedSnippet(text: string, focusIndex: number) {
  const start = findSmartStart(text, focusIndex);
  const end = findSmartEnd(text, focusIndex);

  let snippet = normalizeText(text.slice(start, end));

  if (snippet.length > 420) {
    snippet = snippet.slice(0, 420).trim();

    const lastStop = Math.max(
      snippet.lastIndexOf("."),
      snippet.lastIndexOf(";"),
      snippet.lastIndexOf(":")
    );

    if (lastStop > 180) {
      snippet = snippet.slice(0, lastStop + 1);
    } else if (!snippet.endsWith(".")) {
      snippet += "...";
    }
  }

  return snippet;
}

function getBestClauseForRule(
  page: ExtractedPdfPage,
  rule: RiskRule
): CandidateClause | null {
  const clauses = splitIntoClauses(page);

  let best: CandidateClause | null = null;

  for (const clause of clauses) {
    const text = clause.text;
    if (text.length < 40) continue;

    if (rule.avoidIndicators && containsAny(text, rule.avoidIndicators)) {
      continue;
    }

    if (!passesHardRequirements(text, rule.hardRequirements)) {
      continue;
    }

    const core = scoreIndicators(text, rule.coreIndicators);
    const context = scoreIndicators(text, rule.contextIndicators);
    const totalScore = core.score + context.score;

    if (core.score < rule.minCoreScore) continue;
    if (totalScore < rule.minTotalScore) continue;
    if (core.firstIndex === -1) continue;

    const focusIndex = findBestFocusIndex(text, rule.evidenceTerms);

    if (focusIndex === -1) continue;

    const snippet = buildFocusedSnippet(text, focusIndex);

    if (
      rule.level === "red" &&
      !containsAny(snippet, EXPLICIT_ECONOMIC_PENALTY_TERMS)
    ) {
      continue;
    }

    const candidate: CandidateClause = {
      page: clause.page,
      clauseLabel: clause.clauseLabel,
      text: snippet,
      score: totalScore,
      coreScore: core.score,
      matchedTerms: [...core.matchedTerms, ...context.matchedTerms],
      firstIndex: core.firstIndex,
      focusIndex,
    };

    if (!best) {
      best = candidate;
      continue;
    }

    if (candidate.score > best.score) {
      best = candidate;
      continue;
    }

    if (
      candidate.score === best.score &&
      candidate.coreScore > best.coreScore
    ) {
      best = candidate;
      continue;
    }
  }

  return best;
}

function mapConfirmedTopic(title: string): AnalysisTopic {
  if (title === "Penalización económica por salida anticipada")
    return "exit_penalty";
  if (title === "Desistimiento o salida anticipada") return "exit_general";
  if (title === "Renovación automática") return "renewal";
  if (title === "Gastos adicionales a cargo del inquilino") return "costs";
  if (title === "Garantías adicionales o reforzadas") return "guarantees";
  if (title === "Responsabilidad excesiva del inquilino") return "liability";
  return "other";
}

function getBestClauseForReviewRule(
  page: ExtractedPdfPage,
  rule: ReviewRule
): CandidateReviewClause | null {
  const clauses = splitIntoClauses(page);

  let best: CandidateReviewClause | null = null;

  for (const clause of clauses) {
    const text = clause.text;
    if (text.length < 30) continue;

    if (rule.avoidIndicators && containsAny(text, rule.avoidIndicators)) {
      continue;
    }

    const scored = scoreIndicators(text, rule.indicators);

    if (scored.score < rule.minScore) continue;
    if (scored.firstIndex === -1) continue;

    const focusIndex = findBestFocusIndex(text, rule.evidenceTerms);

    if (focusIndex === -1) continue;

    const candidate: CandidateReviewClause = {
      page: clause.page,
      clauseLabel: clause.clauseLabel,
      text: buildFocusedSnippet(text, focusIndex),
      score: scored.score,
      matchedTerms: scored.matchedTerms,
      firstIndex: scored.firstIndex,
      focusIndex,
    };

    if (!best || candidate.score > best.score) {
      best = candidate;
    }
  }

  return best;
}

export function classifyBasicRentalRisks(
  pages: ExtractedPdfPage[]
): RiskItem[] {
  const findings: RiskItem[] = [];

  for (const rule of RISK_RULES) {
    let bestMatch: CandidateClause | null = null;

    for (const page of pages) {
      const candidate = getBestClauseForRule(page, rule);

      if (!candidate) continue;

      if (
        !bestMatch ||
        candidate.score > bestMatch.score ||
        (candidate.score === bestMatch.score &&
          candidate.coreScore > bestMatch.coreScore)
      ) {
        bestMatch = candidate;
      }
    }

    if (bestMatch) {
      const uniqueTerms = Array.from(new Set(bestMatch.matchedTerms));

      findings.push({
        id: `${rule.title}-${bestMatch.page}-${bestMatch.firstIndex}`,
        title: rule.title,
        level: rule.level,
        page: bestMatch.page,
        clauseLabel: bestMatch.clauseLabel,
        matchedTerm: uniqueTerms.slice(0, 2).join(", "),
        explanation: rule.explanation,
        recommendation: rule.recommendation,
        snippet: bestMatch.text,
      });
    }
  }

  return findings;
}

export function classifyWeakRentalSignals(
  pages: ExtractedPdfPage[],
  confirmedItems: RiskItem[]
): ReviewItem[] {
  const confirmedTopics = new Set(
    confirmedItems.map((item) => mapConfirmedTopic(item.title))
  );

  const reviewItems: ReviewItem[] = [];

  for (const rule of REVIEW_RULES) {
    if (confirmedTopics.has(rule.topic)) {
      continue;
    }

    let bestMatch: CandidateReviewClause | null = null;

    for (const page of pages) {
      const candidate = getBestClauseForReviewRule(page, rule);

      if (!candidate) continue;

      if (!bestMatch || candidate.score > bestMatch.score) {
        bestMatch = candidate;
      }
    }

    if (bestMatch) {
      const uniqueTerms = Array.from(new Set(bestMatch.matchedTerms));

      reviewItems.push({
        id: `${rule.title}-${bestMatch.page}-${bestMatch.firstIndex}`,
        title: rule.title,
        page: bestMatch.page,
        clauseLabel: bestMatch.clauseLabel,
        matchedTerm: uniqueTerms.slice(0, 2).join(", "),
        explanation: rule.explanation,
        recommendation: rule.recommendation,
        snippet: bestMatch.text,
      });
    }
  }

  return reviewItems.sort(
    (a, b) => a.page - b.page || a.title.localeCompare(b.title)
  );
}