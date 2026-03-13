export interface DutchingInput {
    stakeA: number;
    oddsA: number;
    oddsB: number;
  }
  
  export interface DutchingResult {
    stakeB: number;
    totalInvestment: number;
    totalReturn: number;
    profitOrLoss: number;
  }
  
  function roundTo2(value: number) {
    return Math.round(value * 100) / 100;
  }
  
  export function calculateDutching(
    input: DutchingInput,
  ): DutchingResult {
    const { stakeA, oddsA, oddsB } = input;
  
    const stakeB = roundTo2((stakeA * oddsA) / oddsB);
    const totalInvestment = roundTo2(stakeA + stakeB);
    const totalReturn = roundTo2(stakeA * oddsA);
    const profitOrLoss = roundTo2(totalReturn - totalInvestment);
  
    return {
      stakeB,
      totalInvestment,
      totalReturn,
      profitOrLoss,
    };
  }