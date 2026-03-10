/**
 * 信用等级枚举
 *
 * 根据信用分推算，等级决定押金比例、免押、分期等权益
 */
export enum CreditLevel {
  AAA = 'AAA',
  AA = 'AA',
  A = 'A',
  B = 'B',
  C = 'C',
  D = 'D',
  E = 'E',
}

/**
 * 信用等级分数区间
 * AAA 900-950, AA 850-899, A 800-849, B 700-799, C 600-699, D 500-599, E <500
 */
export const CREDIT_LEVEL_THRESHOLDS: Record<CreditLevel, [number, number]> = {
  [CreditLevel.AAA]: [900, 950],
  [CreditLevel.AA]: [850, 899],
  [CreditLevel.A]: [800, 849],
  [CreditLevel.B]: [700, 799],
  [CreditLevel.C]: [600, 699],
  [CreditLevel.D]: [500, 599],
  [CreditLevel.E]: [0, 499],
};

/**
 * 根据信用分获取等级
 */
export function getCreditLevelByScore(score: number): CreditLevel {
  if (score >= 900) return CreditLevel.AAA;
  if (score >= 850) return CreditLevel.AA;
  if (score >= 800) return CreditLevel.A;
  if (score >= 700) return CreditLevel.B;
  if (score >= 600) return CreditLevel.C;
  if (score >= 500) return CreditLevel.D;
  return CreditLevel.E;
}
