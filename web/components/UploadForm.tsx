"use client";

import { useRef, useState } from "react";
import type { AnalysisResult, AnalyzeApiResponse } from "../types/risk";

type UploadFormProps = {
  onResult: (message: string, analysis?: AnalysisResult) => void;
};

export default function UploadForm({ onResult }: UploadFormProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);

  const [loading, setLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedFileName, setSelectedFileName] = useState("");
  const [fileError, setFileError] = useState("");

  function handleOpenFilePicker() {
    inputRef.current?.click();
  }

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) {
      setSelectedFile(null);
      setSelectedFileName("");
      setFileError("");
      return;
    }

    const isPdf =
      file.type === "application/pdf" ||
      file.name.toLowerCase().endsWith(".pdf");

    if (!isPdf) {
      setSelectedFile(null);
      setSelectedFileName("");
      setFileError("Solo se permiten archivos PDF.");
      return;
    }

    setFileError("");
    setSelectedFile(file);
    setSelectedFileName(file.name);
    onResult("", undefined);
  }

  async function handleSendPdf() {
    if (!selectedFile) {
      onResult("Primero debes seleccionar un archivo PDF.", undefined);
      return;
    }

    try {
      setLoading(true);
      onResult("", undefined);

      const formData = new FormData();
      formData.append("file", selectedFile);

      const response = await fetch("/api/analyze", {
        method: "POST",
        body: formData,
      });

      const data: AnalyzeApiResponse = await response.json();

      if (data.ok) {
        onResult(data.message, data.analysis);
      } else {
        onResult(data.message || "La ruta respondió con un error.", undefined);
      }
    } catch (error) {
      onResult("Error al enviar el PDF al backend.", undefined);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      <h2 className="text-xl font-semibold text-gray-900">Subir contrato</h2>
      <p className="mt-2 text-sm text-gray-600">
        Aquí podrás subir tu contrato de alquiler en PDF para analizar posibles
        riesgos.
      </p>

      <div className="mt-6 rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 p-6 text-center">
        <p className="text-sm font-medium text-gray-700">
          Zona de subida de PDF
        </p>
        <p className="mt-2 text-sm text-gray-500">
          En esta fase vamos a devolver resultados estructurados y visuales.
        </p>

        <input
          ref={inputRef}
          type="file"
          accept=".pdf,application/pdf"
          onChange={handleFileChange}
          className="hidden"
        />

        <button
          type="button"
          onClick={handleOpenFilePicker}
          className="mt-4 rounded-lg bg-black px-4 py-2 text-sm font-medium text-white"
        >
          Seleccionar contrato PDF
        </button>

        {selectedFileName && (
          <p className="mt-4 text-sm font-medium text-green-700">
            Archivo seleccionado: {selectedFileName}
          </p>
        )}

        {fileError && (
          <p className="mt-4 text-sm font-medium text-red-700">{fileError}</p>
        )}

        <button
          type="button"
          onClick={handleSendPdf}
          disabled={loading}
          className="mt-4 block w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-800 disabled:opacity-50"
        >
          {loading ? "Analizando contrato..." : "Analizar contrato"}
        </button>
      </div>
    </section>
  );
}