export type Time = {
  hours?: number;
  minutes?: number;
  seconds?: number;
  milliseconds?: number;
};

export type Option<T> = null | T;

export type Colors = "b" | "w";

export type GameSeekColors = Colors | "random";

export type GameType = "rapid" | "blitz" | "bullet" | "classical";
