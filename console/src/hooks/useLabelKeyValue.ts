import { useMemo } from "react";

export const useLabelKeyValue = (label: string) =>
  useMemo(() => label.split("="), [label]);
