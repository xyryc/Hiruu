export const STEP_NAMES = {
  1: "Details",
  2: "Photos",
  3: "Experience",
  4: "Interest",
  5: "Verify",
  6: "Verify",
} as const;

export type StepKey = keyof typeof STEP_NAMES;
export const TOTAL_STEPS = Object.keys(STEP_NAMES).length;

export const getStepName = (step: number): string => {
  return STEP_NAMES[step as StepKey];
};
