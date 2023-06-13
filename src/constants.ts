import { GameType } from "./types/types";

export const timeControls: (CustomTimeControl | TimeControl)[] = [
  createTimeControl({ time: 1, increment: 0, type: "bullet" }),
  createTimeControl({ time: 2, increment: 1, type: "bullet" }),
  createTimeControl({ time: 3, increment: 0, type: "blitz" }),
  createTimeControl({ time: 3, increment: 2, type: "blitz" }),
  createTimeControl({ time: 5, increment: 0, type: "blitz" }),
  createTimeControl({ time: 5, increment: 3, type: "blitz" }),
  createTimeControl({ time: 10, increment: 0, type: "rapid" }),
  createTimeControl({ time: 10, increment: 5, type: "rapid" }),
  createTimeControl({ time: 15, increment: 10, type: "rapid" }),
  createTimeControl({ time: 30, increment: 0, type: "classical" }),
  createTimeControl({ time: 30, increment: 20, type: "classical" }),
  createTimeControl({ time: null, increment: null, type: "custom" }),
];

type TimeControl = {
  time: number;
  increment: number;
  type: GameType;
};

type CustomTimeControl = {
  time: null;
  increment: null;
  type: "custom";
};

function createTimeControl(
  // using this function to typecast as TimeControl or CustomTimeControl
  control: TimeControl | CustomTimeControl
): TimeControl | CustomTimeControl {
  return control;
}
