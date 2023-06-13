import { Colors } from "../types/types";

export function isColor(val: string): val is Colors {
  if (val === "b" || val === "w") {
    return true;
  }
  return false;
}
