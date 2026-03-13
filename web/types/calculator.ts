export type CalculatorBlockId =
  | "apuesta-recibe"
  | "free-bet"
  | "reembolso"
  | "dutching";

export type HelpItem =
  | "micro-ayuda"
  | "tip-rapido"
  | "significado"
  | "error-comun"
  | "mini-paso";

export interface CalculatorBlockInfo {
  id: CalculatorBlockId;
  title: string;
  shortDescription: string;
  status: "proximamente" | "activo";
  includes: string[];
}

export interface ResultRow {
  label: string;
  value: string;
  tone?: "neutral" | "success" | "warning";
}