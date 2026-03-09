export type RiskLevel = "green" | "yellow" | "red";

export type AttentionLevel = "low" | "medium" | "high";

export type RiskItem = {
  id: string;
  title: string;
  level: RiskLevel;
  page: number;
  clauseLabel?: string;
  matchedTerm: string;
  explanation: string;
  recommendation: string;
  snippet: string;
};

export type ReviewItem = {
  id: string;
  title: string;
  page: number;
  clauseLabel?: string;
  matchedTerm: string;
  explanation: string;
  recommendation: string;
  snippet: string;
};

export type FinalGuidance = {
  attentionLevel: AttentionLevel;
  summary: string;
  nextSteps: string[];
  questionsToAsk: string[];
  professionalReviewRecommended: boolean;
};

export type AnalysisResult = {
  documentType: string;
  pageCount: number;
  summary: string;
  items: RiskItem[];
  reviewItems: ReviewItem[];
  guidance: FinalGuidance;
};

export type AnalyzeApiResponse = {
  ok: boolean;
  message: string;
  analysis?: AnalysisResult;
};