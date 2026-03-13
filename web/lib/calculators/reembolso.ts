export interface ReembolsoInput {
    backStake: number;
    backOdds: number;
    layOdds: number;
    maxRefund: number;
    estimatedRetention: number;
    commission: number;
  }
  
  export interface ReembolsoResult {
    layStake: number;
    liability: number;
    profitIfBackWins: number;
    profitIfBackLoses: number;
  }
  
  function roundTo2(value: number) {
    return Math.round(value * 100) / 100;
  }
  
  export function calculateReembolso(
    input: ReembolsoInput,
  ): ReembolsoResult {
    const {
      backStake,
      backOdds,
      layOdds,
      maxRefund,
      estimatedRetention,
      commission,
    } = input;
  
    const layStake = roundTo2(
      ((backStake * backOdds) - (maxRefund * estimatedRetention)) /
        (layOdds - commission),
    );
  
    const liability = roundTo2(layStake * (layOdds - 1));
  
    const profitIfBackWins = roundTo2(
      backStake * (backOdds - 1) - liability,
    );
  
    const profitIfBackLoses = roundTo2(
      layStake * (1 - commission) - backStake + (maxRefund * estimatedRetention),
    );
  
    return {
      layStake,
      liability,
      profitIfBackWins,
      profitIfBackLoses,
    };
  }