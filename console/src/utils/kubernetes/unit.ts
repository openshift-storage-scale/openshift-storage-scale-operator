export type SuffixDecimalSI = "k" | "M" | "G" | "T" | "P" | "E";

export type SuffixBinarySI = "Ki" | "Mi" | "Gi" | "Ti" | "Pi" | "Ei";

export const BinarySI = {
  Ki: 1024,
  Mi: 1024 ** 2,
  Gi: 1024 ** 3,
  Ti: 1024 ** 4,
  Pi: 1024 ** 5,
  Ei: 1024 ** 6,
} as const;

export const DecimalSI = {
  k: 1000,
  M: 1000 ** 2,
  G: 1000 ** 3,
  T: 1000 ** 4,
  P: 1000 ** 5,
  E: 1000 ** 6,
} as const;
