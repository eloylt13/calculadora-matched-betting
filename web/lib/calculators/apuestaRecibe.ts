export interface ApuestaRecibeInput {
    backStake: number;
    backOdds: number;
    layOdds: number;
    commission: number;
  }
  
  export interface ApuestaRecibeResult {
    layStake: number;
    liability: number;
    profitOrLoss: number;
  }
  
  function roundTo2(value: number) {
    return Math.round(value * 100) / 100;
  }
  
  export function calculateApuestaRecibe(
    input: ApuestaRecibeInput,
  ): ApuestaRecibeResult {
    const { backStake, backOdds, layOdds, commission } = input;
  
    const layStake = roundTo2((backStake * backOdds) / (layOdds - commission));
    const liability = roundTo2(layStake * (layOdds - 1));
    const profitOrLoss = roundTo2(backStake * (backOdds - 1) - liability);
  
    return {
      layStake,
      liability,
      profitOrLoss,
    };
  }