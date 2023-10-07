import { Option } from "./types";

export interface GameOverDetails {
  result: "*" | "1-0" | "0-1" | "1/2-1/2";
  method:
    | "TimeOut"
    | "DrawOffer"
    | "Checkmate"
    | "Resignation"
    | "Stalemate"
    | "ThreefoldRepetition"
    | "FivefoldRepetition"
    | "FiftyMoveRule"
    | "SeventyFiveMoveRule"
    | "InsufficientMaterial";
}

export interface GameOverGameStateFromBackend
  extends GameStateSchema,
    GameOverDetails {}

export interface GameOverGameState extends GameStateSchema, GameOverDetails {}

export interface GameStateSchema {
  time_stamp_at_turn_start: Option<number>;
  fen: string;
  white_time: number;
  black_time: number;
  history: Option<string>;
  moves: Option<string>;
}

export interface GameSchema extends GameOverGameState {
  white_id: string;
  black_id: string;
  time: number;
  increment: number;
  details: GameOverDetails;
  gameState: GameStateSchema;
  white_draw_status: boolean;
  black_draw_status: boolean;
}

export interface TimeDetails {
  time: number | null;
  timeLeftAtTurnStart: number | null;
  stampAtTurnStart: number | null;
}
