"use client";

import { useMemo, useState } from "react";
import { calculateApuestaRecibe } from "@/lib/calculators/apuestaRecibe";
import { calculateFreeBet } from "@/lib/calculators/freeBet";
import { calculateReembolso } from "@/lib/calculators/reembolso";
import { calculateDutching } from "@/lib/calculators/dutching";

type TabId = "apuesta-recibe" | "free-bet" | "reembolso" | "dutcher";

type ScenarioRow = {
  label: string;
  first: number;
  second: number;
  total: number;
};

function roundTo2(value: number) {
  return Math.round(value * 100) / 100;
}

function formatEuro(value: number) {
  if (!Number.isFinite(value)) return "—";
  return `${value.toFixed(2)} €`;
}

function formatPercent(value: number) {
  if (!Number.isFinite(value)) return "—";
  return `${value.toFixed(2)} %`;
}

function formatSignedEuro(value: number) {
  if (!Number.isFinite(value)) return "—";
  const sign = value > 0 ? "+" : value < 0 ? "-" : "";
  return `${sign}€${Math.abs(value).toFixed(2)}`;
}

function getValueColor(value: number) {
  if (value > 0) return "text-emerald-300";
  if (value < 0) return "text-red-300";
  return "text-slate-200";
}

function SummaryCard({
  label,
  value,
  tone = "neutral",
}: {
  label: string;
  value: string;
  tone?: "neutral" | "success" | "warning";
}) {
  const toneClass =
    tone === "success"
      ? "text-emerald-300"
      : tone === "warning"
        ? "text-amber-300"
        : "text-cyan-300";

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
      <p className="text-sm text-slate-400">{label}</p>
      <p className={`mt-2 text-2xl font-bold ${toneClass}`}>{value}</p>
    </div>
  );
}

function ScenarioTable({
  firstLabel,
  secondLabel,
  rows,
}: {
  firstLabel: string;
  secondLabel: string;
  rows: ScenarioRow[];
}) {
  return (
    <div className="mt-6 overflow-x-auto rounded-2xl border border-slate-800 bg-slate-950/60">
      <table className="min-w-[640px] w-full text-sm">
        <thead>
          <tr className="border-b border-slate-800">
            <th className="px-4 py-3 text-left text-slate-400">Escenario</th>
            <th className="px-4 py-3 text-right text-slate-400">
              {firstLabel}
            </th>
            <th className="px-4 py-3 text-right text-slate-400">
              {secondLabel}
            </th>
            <th className="px-4 py-3 text-right text-slate-400">TOTAL</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr
              key={row.label}
              className="border-b border-slate-800 last:border-b-0"
            >
              <td className="px-4 py-3 font-medium text-slate-200">
                {row.label}
              </td>
              <td
                className={`px-4 py-3 text-right font-semibold ${getValueColor(row.first)}`}
              >
                {formatSignedEuro(row.first)}
              </td>
              <td
                className={`px-4 py-3 text-right font-semibold ${getValueColor(row.second)}`}
              >
                {formatSignedEuro(row.second)}
              </td>
              <td
                className={`px-4 py-3 text-right font-semibold ${getValueColor(row.total)}`}
              >
                {formatSignedEuro(row.total)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function SectionBadge({
  children,
  color = "cyan",
}: {
  children: React.ReactNode;
  color?: "cyan" | "violet" | "rose" | "emerald";
}) {
  const styles = {
    cyan: "bg-cyan-400/10 text-cyan-300",
    violet: "bg-violet-400/10 text-violet-300",
    rose: "bg-rose-400/10 text-rose-300",
    emerald: "bg-emerald-400/10 text-emerald-300",
  };

  return (
    <span className={`rounded-full px-3 py-1 text-xs font-medium ${styles[color]}`}>
      {children}
    </span>
  );
}

export default function HomePage() {
  const [activeTab, setActiveTab] = useState<TabId>("apuesta-recibe");

  const [backStake, setBackStake] = useState("10");
  const [backOdds, setBackOdds] = useState("2.00");
  const [layOdds, setLayOdds] = useState("2.10");
  const [commissionPercent, setCommissionPercent] = useState("2");

  const [freeBetAmount, setFreeBetAmount] = useState("10");
  const [freeBetBackOdds, setFreeBetBackOdds] = useState("5.00");
  const [freeBetLayOdds, setFreeBetLayOdds] = useState("5.20");
  const [freeBetCommissionPercent, setFreeBetCommissionPercent] = useState("2");
  const [stakeReturned, setStakeReturned] = useState(false);

  const [refundBackStake, setRefundBackStake] = useState("10");
  const [refundBackOdds, setRefundBackOdds] = useState("2.50");
  const [refundLayOdds, setRefundLayOdds] = useState("2.60");
  const [refundMaxAmount, setRefundMaxAmount] = useState("10");
  const [refundRetentionPercent, setRefundRetentionPercent] = useState("80");
  const [refundCommissionPercent, setRefundCommissionPercent] = useState("2");

  const [dutchStakeA, setDutchStakeA] = useState("10");
  const [dutchOddsA, setDutchOddsA] = useState("2.20");
  const [dutchOddsB, setDutchOddsB] = useState("2.10");

  const parsedBackStake = Number(backStake);
  const parsedBackOdds = Number(backOdds);
  const parsedLayOdds = Number(layOdds);
  const parsedCommissionPercent = Number(commissionPercent);
  const normalizedCommission = parsedCommissionPercent / 100;

  const parsedFreeBetAmount = Number(freeBetAmount);
  const parsedFreeBetBackOdds = Number(freeBetBackOdds);
  const parsedFreeBetLayOdds = Number(freeBetLayOdds);
  const parsedFreeBetCommissionPercent = Number(freeBetCommissionPercent);
  const normalizedFreeBetCommission = parsedFreeBetCommissionPercent / 100;

  const parsedRefundBackStake = Number(refundBackStake);
  const parsedRefundBackOdds = Number(refundBackOdds);
  const parsedRefundLayOdds = Number(refundLayOdds);
  const parsedRefundMaxAmount = Number(refundMaxAmount);
  const parsedRefundRetentionPercent = Number(refundRetentionPercent);
  const parsedRefundCommissionPercent = Number(refundCommissionPercent);
  const normalizedRefundCommission = parsedRefundCommissionPercent / 100;

  const parsedDutchStakeA = Number(dutchStakeA);
  const parsedDutchOddsA = Number(dutchOddsA);
  const parsedDutchOddsB = Number(dutchOddsB);

  const isValidApuestaRecibe =
    parsedBackStake > 0 &&
    parsedBackOdds > 1 &&
    parsedLayOdds > 1 &&
    parsedCommissionPercent >= 0 &&
    parsedCommissionPercent < 100 &&
    normalizedCommission >= 0 &&
    normalizedCommission < 1 &&
    parsedLayOdds > normalizedCommission;

  const isValidFreeBet =
    parsedFreeBetAmount > 0 &&
    parsedFreeBetBackOdds > 1 &&
    parsedFreeBetLayOdds > 1 &&
    parsedFreeBetCommissionPercent >= 0 &&
    parsedFreeBetCommissionPercent < 100 &&
    normalizedFreeBetCommission >= 0 &&
    normalizedFreeBetCommission < 1 &&
    parsedFreeBetLayOdds > normalizedFreeBetCommission;

  const isValidReembolso =
    parsedRefundBackStake > 0 &&
    parsedRefundBackOdds > 1 &&
    parsedRefundLayOdds > 1 &&
    parsedRefundMaxAmount >= 0 &&
    parsedRefundRetentionPercent >= 0 &&
    parsedRefundRetentionPercent <= 100 &&
    parsedRefundCommissionPercent >= 0 &&
    parsedRefundCommissionPercent < 100 &&
    normalizedRefundCommission >= 0 &&
    normalizedRefundCommission < 1 &&
    parsedRefundLayOdds > normalizedRefundCommission;

  const isValidDutcher =
    parsedDutchStakeA > 0 && parsedDutchOddsA > 1 && parsedDutchOddsB > 1;

  const apuestaRecibeResult = useMemo(() => {
    if (!isValidApuestaRecibe) return null;

    return calculateApuestaRecibe({
      backStake: parsedBackStake,
      backOdds: parsedBackOdds,
      layOdds: parsedLayOdds,
      commission: normalizedCommission,
    });
  }, [
    isValidApuestaRecibe,
    parsedBackStake,
    parsedBackOdds,
    parsedLayOdds,
    normalizedCommission,
  ]);

  const freeBetResult = useMemo(() => {
    if (!isValidFreeBet) return null;

    return calculateFreeBet({
      freeBetAmount: parsedFreeBetAmount,
      backOdds: parsedFreeBetBackOdds,
      layOdds: parsedFreeBetLayOdds,
      commission: normalizedFreeBetCommission,
      stakeReturned,
    });
  }, [
    isValidFreeBet,
    parsedFreeBetAmount,
    parsedFreeBetBackOdds,
    parsedFreeBetLayOdds,
    normalizedFreeBetCommission,
    stakeReturned,
  ]);

  const reembolsoResult = useMemo(() => {
    if (!isValidReembolso) return null;

    return calculateReembolso({
      backStake: parsedRefundBackStake,
      backOdds: parsedRefundBackOdds,
      layOdds: parsedRefundLayOdds,
      maxRefund: parsedRefundMaxAmount,
      estimatedRetention: parsedRefundRetentionPercent / 100,
      commission: normalizedRefundCommission,
    });
  }, [
    isValidReembolso,
    parsedRefundBackStake,
    parsedRefundBackOdds,
    parsedRefundLayOdds,
    parsedRefundMaxAmount,
    parsedRefundRetentionPercent,
    normalizedRefundCommission,
  ]);

  const dutcherResult = useMemo(() => {
    if (!isValidDutcher) return null;

    return calculateDutching({
      stakeA: parsedDutchStakeA,
      oddsA: parsedDutchOddsA,
      oddsB: parsedDutchOddsB,
    });
  }, [isValidDutcher, parsedDutchStakeA, parsedDutchOddsA, parsedDutchOddsB]);

  const apuestaRecibeRows = useMemo<ScenarioRow[]>(() => {
    if (!apuestaRecibeResult) return [];

    const bookmakerIfBackWins = roundTo2(parsedBackStake * (parsedBackOdds - 1));
    const exchangeIfBackWins = roundTo2(-apuestaRecibeResult.liability);

    const bookmakerIfLayWins = roundTo2(-parsedBackStake);
    const exchangeIfLayWins = roundTo2(
      apuestaRecibeResult.layStake * (1 - normalizedCommission),
    );

    return [
      {
        label: "Si gana la apuesta a favor",
        first: bookmakerIfBackWins,
        second: exchangeIfBackWins,
        total: roundTo2(bookmakerIfBackWins + exchangeIfBackWins),
      },
      {
        label: "Si gana la apuesta en contra",
        first: bookmakerIfLayWins,
        second: exchangeIfLayWins,
        total: roundTo2(bookmakerIfLayWins + exchangeIfLayWins),
      },
    ];
  }, [
    apuestaRecibeResult,
    parsedBackStake,
    parsedBackOdds,
    normalizedCommission,
  ]);

  const freeBetRows = useMemo<ScenarioRow[]>(() => {
    if (!freeBetResult) return [];

    const effectiveBackOdds = stakeReturned
      ? parsedFreeBetBackOdds
      : parsedFreeBetBackOdds - 1;

    const bookmakerIfBackWins = roundTo2(parsedFreeBetAmount * effectiveBackOdds);
    const exchangeIfBackWins = roundTo2(-freeBetResult.liability);

    const bookmakerIfLayWins = 0;
    const exchangeIfLayWins = roundTo2(
      freeBetResult.layStake * (1 - normalizedFreeBetCommission),
    );

    return [
      {
        label: "Si gana la apuesta a favor",
        first: bookmakerIfBackWins,
        second: exchangeIfBackWins,
        total: roundTo2(bookmakerIfBackWins + exchangeIfBackWins),
      },
      {
        label: "Si gana la apuesta en contra",
        first: bookmakerIfLayWins,
        second: exchangeIfLayWins,
        total: roundTo2(bookmakerIfLayWins + exchangeIfLayWins),
      },
    ];
  }, [
    freeBetResult,
    parsedFreeBetAmount,
    parsedFreeBetBackOdds,
    normalizedFreeBetCommission,
    stakeReturned,
  ]);

  const reembolsoRows = useMemo<ScenarioRow[]>(() => {
    if (!reembolsoResult) return [];

    const bookmakerIfBackWins = roundTo2(
      parsedRefundBackStake * (parsedRefundBackOdds - 1),
    );
    const exchangeIfBackWins = roundTo2(-reembolsoResult.liability);

    const bookmakerIfLayWins = roundTo2(
      parsedRefundMaxAmount * (parsedRefundRetentionPercent / 100) -
        parsedRefundBackStake,
    );
    const exchangeIfLayWins = roundTo2(
      reembolsoResult.layStake * (1 - normalizedRefundCommission),
    );

    return [
      {
        label: "Si gana la apuesta a favor",
        first: bookmakerIfBackWins,
        second: exchangeIfBackWins,
        total: roundTo2(bookmakerIfBackWins + exchangeIfBackWins),
      },
      {
        label: "Si gana la apuesta en contra",
        first: bookmakerIfLayWins,
        second: exchangeIfLayWins,
        total: roundTo2(bookmakerIfLayWins + exchangeIfLayWins),
      },
    ];
  }, [
    reembolsoResult,
    parsedRefundBackStake,
    parsedRefundBackOdds,
    parsedRefundMaxAmount,
    parsedRefundRetentionPercent,
    normalizedRefundCommission,
  ]);

  const dutcherRows = useMemo<ScenarioRow[]>(() => {
    if (!dutcherResult) return [];

    const favor1IfWins = roundTo2(parsedDutchStakeA * (parsedDutchOddsA - 1));
    const favor2IfFavor1Wins = roundTo2(-dutcherResult.stakeB);

    const favor1IfFavor2Wins = roundTo2(-parsedDutchStakeA);
    const favor2IfWins = roundTo2(
      dutcherResult.stakeB * (parsedDutchOddsB - 1),
    );

    return [
      {
        label: "Si gana la apuesta a favor 1",
        first: favor1IfWins,
        second: favor2IfFavor1Wins,
        total: roundTo2(favor1IfWins + favor2IfFavor1Wins),
      },
      {
        label: "Si gana la apuesta a favor 2",
        first: favor1IfFavor2Wins,
        second: favor2IfWins,
        total: roundTo2(favor1IfFavor2Wins + favor2IfWins),
      },
    ];
  }, [dutcherResult, parsedDutchStakeA, parsedDutchOddsA, parsedDutchOddsB]);

  const conservativeApuestaRecibe =
    apuestaRecibeRows.length > 0
      ? Math.min(...apuestaRecibeRows.map((row) => row.total))
      : 0;

  const conservativeFreeBet =
    freeBetRows.length > 0
      ? Math.min(...freeBetRows.map((row) => row.total))
      : 0;

  const conservativeReembolso =
    reembolsoRows.length > 0
      ? Math.min(...reembolsoRows.map((row) => row.total))
      : 0;

  const conservativeDutcher =
    dutcherRows.length > 0
      ? Math.min(...dutcherRows.map((row) => row.total))
      : 0;

  const tabs = [
    { id: "apuesta-recibe" as const, label: "Apuesta-Recibe" },
    { id: "free-bet" as const, label: "Free Bet" },
    { id: "reembolso" as const, label: "Reembolso" },
    { id: "dutcher" as const, label: "Dutcher" },
  ];

  function resetApuestaRecibe() {
    setBackStake("10");
    setBackOdds("2.00");
    setLayOdds("2.10");
    setCommissionPercent("2");
  }

  function resetFreeBet() {
    setFreeBetAmount("10");
    setFreeBetBackOdds("5.00");
    setFreeBetLayOdds("5.20");
    setFreeBetCommissionPercent("2");
    setStakeReturned(false);
  }

  function resetReembolso() {
    setRefundBackStake("10");
    setRefundBackOdds("2.50");
    setRefundLayOdds("2.60");
    setRefundMaxAmount("10");
    setRefundRetentionPercent("80");
    setRefundCommissionPercent("2");
  }

  function resetDutcher() {
    setDutchStakeA("10");
    setDutchOddsA("2.20");
    setDutchOddsB("2.10");
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <section className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-10 sm:px-6 sm:py-16 md:px-10">
        <div className="max-w-3xl">
          <span className="inline-flex rounded-full border border-cyan-400/30 bg-cyan-400/10 px-4 py-1 text-sm font-medium text-cyan-300">
            V1 · Calculadora web de matched betting
          </span>

          <h1 className="mt-6 text-3xl font-bold tracking-tight text-white sm:text-4xl md:text-5xl">
            Calculadora simple, clara y útil para tus estrategias de matched
            betting
          </h1>

          <p className="mt-5 text-base leading-7 text-slate-300 sm:text-lg sm:leading-8">
            Esta primera versión incluye 4 bloques funcionales: Apuesta-Recibe,
            Free Bet, Reembolso y Dutcher. Sin tablas de partidos, sin APIs
            externas y sin complicaciones innecesarias.
          </p>
        </div>

        <section className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4 shadow-lg shadow-black/20">
          <div className="grid grid-cols-2 gap-3 sm:flex sm:flex-wrap">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id;

              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`rounded-xl px-4 py-3 text-sm font-semibold transition ${
                    isActive
                      ? "bg-cyan-500 text-white"
                      : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        </section>

        {activeTab === "apuesta-recibe" && (
          <section className="rounded-2xl border border-cyan-400/20 bg-slate-900/80 p-4 shadow-lg shadow-black/20 sm:p-6">
            <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
              <div>
                <SectionBadge color="cyan">Bloque activo</SectionBadge>
                <h2 className="mt-3 text-3xl font-bold text-white">
                  Apuesta-Recibe
                </h2>
                <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-300">
                  Operativa clásica FAVOR + CONTRA entre bookmaker y exchange.
                  Introduce los datos básicos y obtén la apuesta en contra, el
                  riesgo y cuánto ganarás.
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={resetApuestaRecibe}
                  className="rounded-2xl border border-slate-700 bg-slate-800 px-4 py-3 text-sm font-medium text-slate-200 transition hover:bg-slate-700"
                >
                  Resetear bloque
                </button>

                <div className="rounded-2xl border border-emerald-400/20 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-200">
                  Bookmaker + Exchange
                </div>
              </div>
            </div>

            <div className="mt-8 grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
              <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-5">
                <h3 className="text-lg font-semibold text-white">Inputs</h3>
                <p className="mt-2 text-sm leading-6 text-slate-400">
                  Usa punto decimal en las cuotas, por ejemplo: 2.10. En la
                  comisión, escribe un porcentaje normal: 2 = 2%.
                </p>

                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  <label className="flex flex-col gap-2">
                    <span className="text-sm font-medium text-slate-200">
                      Importe apuesta
                    </span>
                    <input
                      type="number"
                      step="0.01"
                      value={backStake}
                      onChange={(e) => setBackStake(e.target.value)}
                      className="rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-white outline-none transition focus:border-cyan-400"
                    />
                  </label>

                  <label className="flex flex-col gap-2">
                    <span className="text-sm font-medium text-slate-200">
                      Cuota a favor
                    </span>
                    <input
                      type="number"
                      step="0.01"
                      value={backOdds}
                      onChange={(e) => setBackOdds(e.target.value)}
                      className="rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-white outline-none transition focus:border-cyan-400"
                    />
                  </label>

                  <label className="flex flex-col gap-2">
                    <span className="text-sm font-medium text-slate-200">
                      Cuota en contra
                    </span>
                    <input
                      type="number"
                      step="0.01"
                      value={layOdds}
                      onChange={(e) => setLayOdds(e.target.value)}
                      className="rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-white outline-none transition focus:border-cyan-400"
                    />
                  </label>

                  <label className="flex flex-col gap-2">
                    <span className="text-sm font-medium text-slate-200">
                      Comisión exchange (%)
                    </span>
                    <input
                      type="number"
                      step="0.01"
                      value={commissionPercent}
                      onChange={(e) => setCommissionPercent(e.target.value)}
                      className="rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-white outline-none transition focus:border-cyan-400"
                    />
                  </label>
                </div>

                <div className="mt-6 rounded-2xl border border-amber-400/20 bg-amber-400/10 p-4">
                  <p className="text-sm font-medium text-amber-200">
                    Mini ayuda rápida
                  </p>
                  <p className="mt-2 text-sm leading-6 text-amber-100/90">
                    Este bloque es para cubrir una apuesta a favor con una
                    apuesta en contra en el exchange. En comisión, escribe 2
                    para un 2%.
                  </p>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-5">
                <h3 className="text-lg font-semibold text-white">Resultados</h3>

                {apuestaRecibeResult ? (
                  <>
                    <div className="mt-6 grid gap-4">
                      <SummaryCard
                        label="Apuesta en contra"
                        value={formatEuro(apuestaRecibeResult.layStake)}
                        tone="neutral"
                      />
                      <SummaryCard
                        label="Riesgo"
                        value={formatEuro(apuestaRecibeResult.liability)}
                        tone="warning"
                      />
                      <SummaryCard
                        label="Ganarás"
                        value={formatEuro(conservativeApuestaRecibe)}
                        tone="success"
                      />
                    </div>

                    <div className="mt-6 rounded-2xl border border-emerald-400/20 bg-emerald-400/10 p-4">
                      <p className="text-sm font-medium text-emerald-200">
                        Qué significa este resultado
                      </p>
                      <p className="mt-2 text-sm leading-6 text-emerald-100/90">
                        La apuesta en contra es lo que pondrás en el exchange.
                        El riesgo es la cantidad máxima retenida. “Ganarás”
                        muestra el resultado conservador entre los dos
                        escenarios.
                      </p>
                    </div>

                    <ScenarioTable
                      firstLabel="BOOKMAKER"
                      secondLabel="EXCHANGE"
                      rows={apuestaRecibeRows}
                    />
                  </>
                ) : (
                  <div className="mt-6 rounded-2xl border border-red-400/20 bg-red-400/10 p-4">
                    <p className="text-sm font-medium text-red-200">
                      Revisa los datos introducidos
                    </p>
                    <p className="mt-2 text-sm leading-6 text-red-100/90">
                      Comprueba que el importe sea mayor que 0, que las cuotas
                      sean válidas y que la comisión esté entre 0 y 99.
                    </p>
                  </div>
                )}

                <div className="mt-6 rounded-2xl border border-slate-800 bg-slate-900/80 p-4">
                  <p className="text-sm font-medium text-slate-200">
                    Error común
                  </p>
                  <p className="mt-2 text-sm leading-6 text-slate-400">
                    Ahora puedes escribir 2 para una comisión del 2%. Ya no
                    hace falta poner 0.02.
                  </p>
                </div>
              </div>
            </div>
          </section>
        )}

        {activeTab === "free-bet" && (
          <section className="rounded-2xl border border-violet-400/20 bg-slate-900/80 p-4 shadow-lg shadow-black/20 sm:p-6">
            <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
              <div>
                <SectionBadge color="violet">Bloque activo</SectionBadge>
                <h2 className="mt-3 text-3xl font-bold text-white">Free Bet</h2>
                <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-300">
                  Calculadora de apuesta gratis. Introduce los datos y obtén la
                  apuesta en contra, el riesgo, cuánto ganarás y la retención
                  real del bono.
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={resetFreeBet}
                  className="rounded-2xl border border-slate-700 bg-slate-800 px-4 py-3 text-sm font-medium text-slate-200 transition hover:bg-slate-700"
                >
                  Resetear bloque
                </button>

                <div className="rounded-2xl border border-emerald-400/20 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-200">
                  Bookmaker + Exchange
                </div>
              </div>
            </div>

            <div className="mt-8 grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
              <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-5">
                <h3 className="text-lg font-semibold text-white">Inputs</h3>
                <p className="mt-2 text-sm leading-6 text-slate-400">
                  Este bloque permite calcular free bets tipo SNR y SR.
                </p>

                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  <label className="flex flex-col gap-2">
                    <span className="text-sm font-medium text-slate-200">
                      Importe free bet
                    </span>
                    <input
                      type="number"
                      step="0.01"
                      value={freeBetAmount}
                      onChange={(e) => setFreeBetAmount(e.target.value)}
                      className="rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-white outline-none transition focus:border-violet-400"
                    />
                  </label>

                  <label className="flex flex-col gap-2">
                    <span className="text-sm font-medium text-slate-200">
                      Cuota a favor
                    </span>
                    <input
                      type="number"
                      step="0.01"
                      value={freeBetBackOdds}
                      onChange={(e) => setFreeBetBackOdds(e.target.value)}
                      className="rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-white outline-none transition focus:border-violet-400"
                    />
                  </label>

                  <label className="flex flex-col gap-2">
                    <span className="text-sm font-medium text-slate-200">
                      Cuota en contra
                    </span>
                    <input
                      type="number"
                      step="0.01"
                      value={freeBetLayOdds}
                      onChange={(e) => setFreeBetLayOdds(e.target.value)}
                      className="rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-white outline-none transition focus:border-violet-400"
                    />
                  </label>

                  <label className="flex flex-col gap-2">
                    <span className="text-sm font-medium text-slate-200">
                      Comisión exchange (%)
                    </span>
                    <input
                      type="number"
                      step="0.01"
                      value={freeBetCommissionPercent}
                      onChange={(e) =>
                        setFreeBetCommissionPercent(e.target.value)
                      }
                      className="rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-white outline-none transition focus:border-violet-400"
                    />
                  </label>
                </div>

                <div className="mt-4 rounded-2xl border border-slate-800 bg-slate-900/80 p-4">
                  <p className="text-sm font-medium text-slate-200">
                    Tipo de free bet
                  </p>

                  <div className="mt-3 flex flex-wrap gap-3">
                    <button
                      type="button"
                      onClick={() => setStakeReturned(false)}
                      className={`rounded-xl px-4 py-2 text-sm font-medium transition ${
                        !stakeReturned
                          ? "bg-violet-500 text-white"
                          : "bg-slate-800 text-slate-300"
                      }`}
                    >
                      SNR · sin devolución de stake
                    </button>

                    <button
                      type="button"
                      onClick={() => setStakeReturned(true)}
                      className={`rounded-xl px-4 py-2 text-sm font-medium transition ${
                        stakeReturned
                          ? "bg-violet-500 text-white"
                          : "bg-slate-800 text-slate-300"
                      }`}
                    >
                      SR · con devolución de stake
                    </button>
                  </div>
                </div>

                <div className="mt-6 rounded-2xl border border-amber-400/20 bg-amber-400/10 p-4">
                  <p className="text-sm font-medium text-amber-200">
                    Mini ayuda rápida
                  </p>
                  <p className="mt-2 text-sm leading-6 text-amber-100/90">
                    Usa SNR cuando la free bet no devuelve el stake. Usa SR
                    cuando la promoción sí devuelve el stake además del
                    beneficio. En comisión, escribe 2 para un 2%.
                  </p>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-5">
                <h3 className="text-lg font-semibold text-white">Resultados</h3>

                {freeBetResult ? (
                  <>
                    <div className="mt-6 grid gap-4">
                      <SummaryCard
                        label="Apuesta en contra"
                        value={formatEuro(freeBetResult.layStake)}
                        tone="neutral"
                      />
                      <SummaryCard
                        label="Riesgo"
                        value={formatEuro(freeBetResult.liability)}
                        tone="warning"
                      />
                      <SummaryCard
                        label="Ganarás"
                        value={formatEuro(conservativeFreeBet)}
                        tone="success"
                      />
                      <SummaryCard
                        label="Retención del bono"
                        value={formatPercent(freeBetResult.retentionRate)}
                        tone="neutral"
                      />
                    </div>

                    <div className="mt-6 rounded-2xl border border-emerald-400/20 bg-emerald-400/10 p-4">
                      <p className="text-sm font-medium text-emerald-200">
                        Qué significa este resultado
                      </p>
                      <p className="mt-2 text-sm leading-6 text-emerald-100/90">
                        “Ganarás” te orienta sobre el valor real que extraes de
                        la free bet. La retención del bono muestra qué porcentaje
                        conviertes en dinero real.
                      </p>
                    </div>

                    <ScenarioTable
                      firstLabel="BOOKMAKER"
                      secondLabel="EXCHANGE"
                      rows={freeBetRows}
                    />
                  </>
                ) : (
                  <div className="mt-6 rounded-2xl border border-red-400/20 bg-red-400/10 p-4">
                    <p className="text-sm font-medium text-red-200">
                      Revisa los datos introducidos
                    </p>
                    <p className="mt-2 text-sm leading-6 text-red-100/90">
                      Comprueba que el importe sea mayor que 0, que las cuotas
                      sean válidas y que la comisión esté entre 0 y 99.
                    </p>
                  </div>
                )}

                <div className="mt-6 rounded-2xl border border-slate-800 bg-slate-900/80 p-4">
                  <p className="text-sm font-medium text-slate-200">
                    Error común
                  </p>
                  <p className="mt-2 text-sm leading-6 text-slate-400">
                    En comisión, escribe 2 para un 2%. Ya no hace falta poner
                    0.02.
                  </p>
                </div>
              </div>
            </div>
          </section>
        )}

        {activeTab === "reembolso" && (
          <section className="rounded-2xl border border-rose-400/20 bg-slate-900/80 p-4 shadow-lg shadow-black/20 sm:p-6">
            <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
              <div>
                <SectionBadge color="rose">Bloque activo</SectionBadge>
                <h2 className="mt-3 text-3xl font-bold text-white">
                  Reembolso
                </h2>
                <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-300">
                  Simula promociones de reembolso y calcula la apuesta en
                  contra, el riesgo y lo que ganarás en cada escenario.
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={resetReembolso}
                  className="rounded-2xl border border-slate-700 bg-slate-800 px-4 py-3 text-sm font-medium text-slate-200 transition hover:bg-slate-700"
                >
                  Resetear bloque
                </button>

                <div className="rounded-2xl border border-emerald-400/20 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-200">
                  Bookmaker + Exchange
                </div>
              </div>
            </div>

            <div className="mt-8 grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
              <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-5">
                <h3 className="text-lg font-semibold text-white">Inputs</h3>
                <p className="mt-2 text-sm leading-6 text-slate-400">
                  Aquí introduces la apuesta inicial, el reembolso máximo y la
                  retención estimada del bono devuelto.
                </p>

                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  <label className="flex flex-col gap-2">
                    <span className="text-sm font-medium text-slate-200">
                      Importe apuesta
                    </span>
                    <input
                      type="number"
                      step="0.01"
                      value={refundBackStake}
                      onChange={(e) => setRefundBackStake(e.target.value)}
                      className="rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-white outline-none transition focus:border-rose-400"
                    />
                  </label>

                  <label className="flex flex-col gap-2">
                    <span className="text-sm font-medium text-slate-200">
                      Cuota a favor
                    </span>
                    <input
                      type="number"
                      step="0.01"
                      value={refundBackOdds}
                      onChange={(e) => setRefundBackOdds(e.target.value)}
                      className="rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-white outline-none transition focus:border-rose-400"
                    />
                  </label>

                  <label className="flex flex-col gap-2">
                    <span className="text-sm font-medium text-slate-200">
                      Cuota en contra
                    </span>
                    <input
                      type="number"
                      step="0.01"
                      value={refundLayOdds}
                      onChange={(e) => setRefundLayOdds(e.target.value)}
                      className="rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-white outline-none transition focus:border-rose-400"
                    />
                  </label>

                  <label className="flex flex-col gap-2">
                    <span className="text-sm font-medium text-slate-200">
                      Comisión exchange (%)
                    </span>
                    <input
                      type="number"
                      step="0.01"
                      value={refundCommissionPercent}
                      onChange={(e) =>
                        setRefundCommissionPercent(e.target.value)
                      }
                      className="rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-white outline-none transition focus:border-rose-400"
                    />
                  </label>

                  <label className="flex flex-col gap-2">
                    <span className="text-sm font-medium text-slate-200">
                      Reembolso máximo
                    </span>
                    <input
                      type="number"
                      step="0.01"
                      value={refundMaxAmount}
                      onChange={(e) => setRefundMaxAmount(e.target.value)}
                      className="rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-white outline-none transition focus:border-rose-400"
                    />
                  </label>

                  <label className="flex flex-col gap-2">
                    <span className="text-sm font-medium text-slate-200">
                      Retención estimada (%)
                    </span>
                    <input
                      type="number"
                      step="0.01"
                      value={refundRetentionPercent}
                      onChange={(e) => setRefundRetentionPercent(e.target.value)}
                      className="rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-white outline-none transition focus:border-rose-400"
                    />
                  </label>
                </div>

                <div className="mt-6 rounded-2xl border border-amber-400/20 bg-amber-400/10 p-4">
                  <p className="text-sm font-medium text-amber-200">
                    Mini ayuda rápida
                  </p>
                  <p className="mt-2 text-sm leading-6 text-amber-100/90">
                    Si esperas convertir un bono devuelto en un 80% de valor
                    real, escribe 80. En comisión, escribe 2 para un 2%.
                  </p>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-5">
                <h3 className="text-lg font-semibold text-white">Resultados</h3>

                {reembolsoResult ? (
                  <>
                    <div className="mt-6 grid gap-4">
                      <SummaryCard
                        label="Apuesta en contra"
                        value={formatEuro(reembolsoResult.layStake)}
                        tone="neutral"
                      />
                      <SummaryCard
                        label="Riesgo"
                        value={formatEuro(reembolsoResult.liability)}
                        tone="warning"
                      />
                      <SummaryCard
                        label="Ganarás"
                        value={formatEuro(conservativeReembolso)}
                        tone="success"
                      />
                      <SummaryCard
                        label="Retención usada"
                        value={formatPercent(parsedRefundRetentionPercent)}
                        tone="neutral"
                      />
                    </div>

                    <div className="mt-6 rounded-2xl border border-emerald-400/20 bg-emerald-400/10 p-4">
                      <p className="text-sm font-medium text-emerald-200">
                        Qué significa este resultado
                      </p>
                      <p className="mt-2 text-sm leading-6 text-emerald-100/90">
                        Este bloque muestra los dos escenarios clave: si gana la
                        apuesta a favor o si falla y entra el reembolso con la
                        retención estimada que hayas introducido.
                      </p>
                    </div>

                    <ScenarioTable
                      firstLabel="BOOKMAKER"
                      secondLabel="EXCHANGE"
                      rows={reembolsoRows}
                    />
                  </>
                ) : (
                  <div className="mt-6 rounded-2xl border border-red-400/20 bg-red-400/10 p-4">
                    <p className="text-sm font-medium text-red-200">
                      Revisa los datos introducidos
                    </p>
                    <p className="mt-2 text-sm leading-6 text-red-100/90">
                      Comprueba que las cuotas sean válidas, que la comisión
                      esté entre 0 y 99 y que la retención estimada esté entre 0
                      y 100.
                    </p>
                  </div>
                )}

                <div className="mt-6 rounded-2xl border border-slate-800 bg-slate-900/80 p-4">
                  <p className="text-sm font-medium text-slate-200">
                    Error común
                  </p>
                  <p className="mt-2 text-sm leading-6 text-slate-400">
                    En comisión, escribe 2 para un 2%. En retención, escribe 80
                    para un 80%.
                  </p>
                </div>
              </div>
            </div>
          </section>
        )}

        {activeTab === "dutcher" && (
          <section className="rounded-2xl border border-emerald-400/20 bg-slate-900/80 p-4 shadow-lg shadow-black/20 sm:p-6">
            <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
              <div>
                <SectionBadge color="emerald">Bloque activo</SectionBadge>
                <h2 className="mt-3 text-3xl font-bold text-white">
                  Dutcher (Favor-Favor)
                </h2>
                <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-300">
                  Cobertura FAVOR + FAVOR entre dos resultados opuestos, sin
                  exchange. Este bloque te ayuda a repartir la segunda apuesta
                  para equilibrar el retorno entre dos bookmakers.
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={resetDutcher}
                  className="rounded-2xl border border-slate-700 bg-slate-800 px-4 py-3 text-sm font-medium text-slate-200 transition hover:bg-slate-700"
                >
                  Resetear bloque
                </button>

                <div className="rounded-2xl border border-emerald-400/20 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-200">
                  Dos bookmakers · sin exchange
                </div>
              </div>
            </div>

            <div className="mt-8 grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
              <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-5">
                <h3 className="text-lg font-semibold text-white">Inputs</h3>
                <p className="mt-2 text-sm leading-6 text-slate-400">
                  Introduce el importe de la primera apuesta a favor y las
                  cuotas de ambas apuestas.
                </p>

                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  <label className="flex flex-col gap-2">
                    <span className="text-sm font-medium text-slate-200">
                      Importe apuesta a favor 1
                    </span>
                    <input
                      type="number"
                      step="0.01"
                      value={dutchStakeA}
                      onChange={(e) => setDutchStakeA(e.target.value)}
                      className="rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-white outline-none transition focus:border-emerald-400"
                    />
                  </label>

                  <label className="flex flex-col gap-2">
                    <span className="text-sm font-medium text-slate-200">
                      Cuota a favor 1
                    </span>
                    <input
                      type="number"
                      step="0.01"
                      value={dutchOddsA}
                      onChange={(e) => setDutchOddsA(e.target.value)}
                      className="rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-white outline-none transition focus:border-emerald-400"
                    />
                  </label>

                  <label className="flex flex-col gap-2 sm:col-span-2">
                    <span className="text-sm font-medium text-slate-200">
                      Cuota a favor 2
                    </span>
                    <input
                      type="number"
                      step="0.01"
                      value={dutchOddsB}
                      onChange={(e) => setDutchOddsB(e.target.value)}
                      className="rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-white outline-none transition focus:border-emerald-400"
                    />
                  </label>
                </div>

                <div className="mt-6 rounded-2xl border border-amber-400/20 bg-amber-400/10 p-4">
                  <p className="text-sm font-medium text-amber-200">
                    Mini ayuda rápida
                  </p>
                  <p className="mt-2 text-sm leading-6 text-amber-100/90">
                    Este bloque replica la lógica Favor-Favor. Tú haces una
                    apuesta a favor en una casa y cubres con otra apuesta a
                    favor en el resultado opuesto, sin necesidad de exchange.
                  </p>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-5">
                <h3 className="text-lg font-semibold text-white">Resultados</h3>

                {dutcherResult ? (
                  <>
                    <div className="mt-6 grid gap-4">
                      <SummaryCard
                        label="Apuesta a favor 2"
                        value={formatEuro(dutcherResult.stakeB)}
                        tone="neutral"
                      />
                      <SummaryCard
                        label="Inversión total"
                        value={formatEuro(dutcherResult.totalInvestment)}
                        tone="warning"
                      />
                      <SummaryCard
                        label="Ganarás"
                        value={formatEuro(conservativeDutcher)}
                        tone="success"
                      />
                    </div>

                    <div className="mt-6 rounded-2xl border border-emerald-400/20 bg-emerald-400/10 p-4">
                      <p className="text-sm font-medium text-emerald-200">
                        Qué significa este resultado
                      </p>
                      <p className="mt-2 text-sm leading-6 text-emerald-100/90">
                        La calculadora te dice cuánto deberías apostar a favor
                        en la segunda casa para equilibrar el resultado entre los
                        dos escenarios.
                      </p>
                    </div>

                    <ScenarioTable
                      firstLabel="FAVOR 1"
                      secondLabel="FAVOR 2"
                      rows={dutcherRows}
                    />
                  </>
                ) : (
                  <div className="mt-6 rounded-2xl border border-red-400/20 bg-red-400/10 p-4">
                    <p className="text-sm font-medium text-red-200">
                      Revisa los datos introducidos
                    </p>
                    <p className="mt-2 text-sm leading-6 text-red-100/90">
                      Comprueba que el importe sea mayor que 0 y que ambas cuotas
                      sean superiores a 1.
                    </p>
                  </div>
                )}

                <div className="mt-6 rounded-2xl border border-slate-800 bg-slate-900/80 p-4">
                  <p className="text-sm font-medium text-slate-200">
                    Error común
                  </p>
                  <p className="mt-2 text-sm leading-6 text-slate-400">
                    Este bloque no usa exchange. Sirve para coberturas FAVOR +
                    FAVOR entre dos resultados opuestos y dos bookmakers
                    distintos.
                  </p>
                </div>
              </div>
            </div>
          </section>
        )}

        <section className="rounded-2xl border border-amber-400/20 bg-amber-400/10 p-4 sm:p-6">
          <h3 className="text-lg font-semibold text-amber-200">
            Enfoque de esta V1
          </h3>

          <p className="mt-3 text-sm leading-7 text-amber-100/90">
            La app está pensada para ayudarte a calcular mejor siguiendo tus
            guías, no para recomendar partidos automáticamente. Tus PDFs enseñan
            la estrategia y la app ejecuta la parte numérica de forma más
            rápida, clara y usable.
          </p>
        </section>
      </section>
    </main>
  );
}
