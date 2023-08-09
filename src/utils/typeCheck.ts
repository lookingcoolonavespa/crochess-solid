import { Colors, ColorsChar } from "../types/types";

export function isColor(val: string): val is Colors {
  if (val === "b" || val === "w") {
    return true;
  }
  return false;
}

export function getColorsChar(val: Colors): ColorsChar {
  return val[0] as ColorsChar;
}
