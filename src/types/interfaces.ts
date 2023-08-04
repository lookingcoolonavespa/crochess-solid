import { Colors, DrawRecord } from "./types";

export interface GameOverDetails {
  winner: Colors | null;
  result: "mate" | "draw" | "time" | null;
}

export interface GameOverGameState extends GameStateSchema, GameOverDetails {}

export interface GameStateSchema {
  time_stamp_at_turn_start: number;
  fen: string;
  w_time: number;
  b_time: number;
  history: string | null;
  moves: string | null;
}

export interface GameSchema extends GameOverGameState {
  w_id: string;
  b_id: string;
  time: number;
  increment: number;
  details: GameOverDetails;
  gameState: GameStateSchema;
  drawRecord: DrawRecord;
}

export interface GameStatusInterface {
  type:
    | "gameOver"
    | "offeredDraw"
    | "claimDraw"
    | "offerDrawConfirmation"
    | "resignConfirmation";
  payload: GameOverDetails | undefined;
  close: (() => void) | undefined;
}

export interface TimeDetails {
  time: number | null;
  timeLeftAtTurnStart: number | null;
  stampAtTurnStart: number | null;
}
