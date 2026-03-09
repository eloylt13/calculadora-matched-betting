import { extractText, getDocumentProxy } from "unpdf";

export type ExtractedPdfPage = {
  page: number;
  text: string;
};

type ExtractedPdfText = {
  text: string;
  preview: string;
  pageCount: number;
  pages: ExtractedPdfPage[];
};

export async function extractPdfTextFromBuffer(
  buffer: Buffer
): Promise<ExtractedPdfText> {
  const pdf = await getDocumentProxy(new Uint8Array(buffer));

  const { totalPages, text } = await extractText(pdf, { mergePages: false });

  const pages: ExtractedPdfPage[] = text.map((pageText, index) => ({
    page: index + 1,
    text: (pageText || "").trim(),
  }));

  const fullText = pages.map((p) => p.text).join("\n\n").trim();
  const preview = fullText.slice(0, 1200);

  return {
    text: fullText,
    preview,
    pageCount: totalPages,
    pages,
  };
}