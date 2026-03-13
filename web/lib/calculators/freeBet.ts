export interface FreeBetInput {
    freeBetAmount: number;
    backOdds: number;
    layOdds: number;
    commission: number;
    stakeReturned: boolean;
  }
  
  export interface FreeBetResult {
    layStake: number;
    liability: number;
    qualifyingProfit: number;
    retentionRate: number;
  }
  
  function roundTo2(value: number) {
    return Math.round(value * 100) / 100;
  }
  
  export function calculateFreeBet(input: FreeBetInput): FreeBetResult {
    const { freeBetAmount, backOdds, layOdds, commission, stakeReturned } = input;
  
    const effectiveBackOdds = stakeReturned ? backOdds : backOdds - 1;
  
    const layStake = roundTo2(
      (freeBetAmount * effectiveBackOdds) / (layOdds - commission),
    );
  
    const liability = roundTo2(layStake * (layOdds - 1));
  
    const profitIfBackWins = roundTo2(
      freeBetAmount * effectiveBackOdds - liability,
    );
  
    const profitIfLayWins = roundTo2(layStake * (1 - commission));
  
    const qualifyingProfit = roundTo2(
      Math.min(profitIfBackWins, profitIfLayWins),
    );
  
    const retentionRate =
      freeBetAmount > 0
        ? roundTo2((qualifyingProfit / freeBetAmount) * 100)
        : 0;
  
    return {
      layStake,
      liability,
      qualifyingProfit,
      retentionRate,
    };
  }