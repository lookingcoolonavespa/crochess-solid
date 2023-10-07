import { PIECE_TYPES } from "../constants";
import {
  GameOverDetails,
  GameOverGameStateFromBackend,
  GameSchema,
  GameStateSchema,
} from "./interfaces";

export type Time = {
  hours?: number;
  minutes?: number;
  seconds?: number;
  milliseconds?: number;
};

export type Option<T> = null | T;

export type Colors = "black" | "white";

export type GameSeekColors = Colors | "random";

export type GameType = "rapid" | "blitz" | "bullet" | "classical";

export type GameSeek = {
  color: GameSeekColors;
  time: number;
  increment: number;
  gameType: GameType;
  seeker: string;
  id: string;
};

const BOARD_LENGTH = 8;
const FILES = ["a", "b", "c", "d", "e", "f", "g", "h"] as const;

export type _EnumerateFrom<
  N extends number,
  Acc extends number[] = [],
> = Acc["length"] extends N
  ? Acc[number] & number
  : _EnumerateFrom<N, [...Acc, Acc["length"]]>;

export type EnumerateFromOne<
  N extends number,
  Acc extends number[] = [N],
> = Acc["length"] extends N
  ? Acc[number] & number
  : _EnumerateFrom<N, [...Acc, Acc["length"]]>;

// Square is from 0 to 63
export type Square = number;
export type SquareNotation = `${(typeof FILES)[number]}${EnumerateFromOne<
  typeof BOARD_LENGTH
>}`;

export type DrawRecord = Record<Colors, boolean>;

export type Tuple<T, N extends number> = N extends N
  ? number extends N
    ? T[]
    : _TupleOf<T, N, []>
  : never;
type _TupleOf<T, N extends number, R extends T[]> = R["length"] extends N
  ? R
  : _TupleOf<T, N, [T, ...R]>;

export type MoveNotation =
  | `${SquareNotation}${SquareNotation}`
  | `${SquareNotation}${SquareNotation}${PromotePieceType}`;

export type HistoryArr = Tuple<MoveNotation | "", 2>[];

// Board is a string with 64 length.
// Pieces are represented with one character - lowercase for black, uppercase for white.
// Empty squares are represented by '.'
export type BoardVal = PieceType | Uppercase<PieceType> | ".";
export type Board = BoardVal[];

export type PieceType = (typeof PIECE_TYPES)[number];

export type PromotePieceType = Exclude<PieceType, "k" | "p">;

export type Position = {
  x: number;
  y: number;
};

export type GameState = {
  active: boolean;
  activeColor: Colors;
  history: HistoryArr;
  moves: string[];
  playingAgainstEngine: boolean;
};

export type GameOverStatus = {
  type: "gameOver";
  payload: GameOverDetails;
};
export type InterfaceStatus =
  | GameOverStatus
  | {
      type:
        | "offeredDraw"
        | "claimDraw"
        | "resignConfirmation"
        | "offerDrawConfirmation";
    };

type WhiteTimeOutPayload = {
  method: "TimeOut";
  white_draw_status: false;
  black_draw_status: false;
  white_time: 0;
  result: "0-1";
};
type BlackTimeOutPayload = {
  method: "TimeOut";
  white_draw_status: false;
  black_draw_status: false;
  black_time: 0;
  result: "1-0";
};

export type TimeOutPayload = WhiteTimeOutPayload | BlackTimeOutPayload;

export type Init = {
  event: "init";
  payload: GameSchema;
};
export type UpdateOnGameOver = {
  event: "game over";
  payload: GameOverGameStateFromBackend;
};
export type UpdateOnMove = {
  event: "make move";
  payload: GameStateSchema;
};
export type UpdateDraw = {
  event: "update draw";
  payload: DrawRecord;
};
export type Message = Init | UpdateOnMove | UpdateOnGameOver | UpdateDraw;
