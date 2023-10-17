import { NOT_CONNECTED_TO_SOCKET_ERR_MSG, OPP_COLOR } from "../../constants";
import { socket } from "../../globalState";
import { GameOverDetails } from "../../types/interfaces";
import { Colors, MoveNotation } from "../../types/types";
import { GAME_BASE_TOPIC } from "../../websocket/topics";
import EngineWorker from "./engineMoveWorkerScript?worker";

export function offerDraw(gameId: string, offerer: Colors) {
  let stompClient = socket();
  if (!stompClient) throw new Error(NOT_CONNECTED_TO_SOCKET_ERR_MSG);
  const oppColor = OPP_COLOR[offerer];
  stompClient.publish({
    topic: `${GAME_BASE_TOPIC}/${gameId}`,
    event: "update draw",
    payload: {
      [offerer]: false,
      [oppColor]: true,
    },
  });
}

export async function denyDraw(gameId: string) {
  let stompClient = socket();
  if (!stompClient) throw new Error(NOT_CONNECTED_TO_SOCKET_ERR_MSG);
  stompClient.publish({
    topic: `${GAME_BASE_TOPIC}/${gameId}`,
    event: "update draw",
    payload: {
      white: false,
      black: false,
    },
  });
}

export async function claimDraw(gameId: string) {
  let stompClient = socket();
  if (!stompClient) throw new Error(NOT_CONNECTED_TO_SOCKET_ERR_MSG);
  const gameOverDetails: GameOverDetails = {
    method: "DrawOffer",
    result: "1/2-1/2",
  };
  stompClient.publish({
    topic: `${GAME_BASE_TOPIC}/${gameId}`,
    event: "update result",
    payload: gameOverDetails,
  });
}

export async function resign(gameId: string, resigning: Colors) {
  let stompClient = socket();
  if (!stompClient) throw new Error(NOT_CONNECTED_TO_SOCKET_ERR_MSG);
  const gameOverDetails: GameOverDetails = {
    method: "Resignation",
    result: resigning == "black" ? "1-0" : "0-1",
  };
  stompClient.publish({
    topic: `${GAME_BASE_TOPIC}/${gameId}`,
    event: "update result",
    payload: gameOverDetails,
  });
}

export function sendMove(gameId: string, playerId: string, move: MoveNotation) {
  let stompClient = socket();
  if (!stompClient) throw new Error(NOT_CONNECTED_TO_SOCKET_ERR_MSG);
  stompClient.publish({
    topic: `${GAME_BASE_TOPIC}/${gameId}`,
    event: "make move",
    payload: {
      move,
      player_id: playerId,
    },
  });
}

export async function makeEngineMove(gameId: string, moves: string[]) {
  const worker = new EngineWorker();
  worker.postMessage({ moves: moves.join(" ") });
  worker.onmessage = (msg) => {
    sendMove(gameId, "engine", msg.data.engineMove);
    worker.terminate();
  };
}
