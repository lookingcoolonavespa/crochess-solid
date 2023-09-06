import { NOT_CONNECTED_TO_SOCKET_ERR_MSG, OPP_COLOR } from "../../constants";
import { socket } from "../../globalState";
import { Colors, MoveNotation } from "../../types/types";

export function offerDraw(gameId: string, offerer: Colors) {
  let stompClient = socket();
  if (!stompClient) throw new Error(NOT_CONNECTED_TO_SOCKET_ERR_MSG);
  const oppColor = OPP_COLOR[offerer];
  stompClient.publish({
    destination: `/app/api/game/${gameId}/draw`,
    body: JSON.stringify({
      [offerer[0]]: false,
      [oppColor[0]]: true,
    }),
  });
}

export async function denyDraw(gameId: string) {
  let stompClient = socket();
  if (!stompClient) throw new Error(NOT_CONNECTED_TO_SOCKET_ERR_MSG);
  stompClient.publish({
    destination: `/app/api/game/${gameId}/draw`,
    body: JSON.stringify({
      w: false,
      b: false,
    }),
  });
}

export async function claimDraw(gameId: string) {
  let stompClient = socket();
  if (!stompClient) throw new Error(NOT_CONNECTED_TO_SOCKET_ERR_MSG);
  stompClient.publish({
    destination: `/app/api/game/${gameId}/resign-draw`,
    body: JSON.stringify({
      winner: null,
      result: "draw",
    }),
  });
}

export async function resign(gameId: string, resigning: Colors) {
  let stompClient = socket();
  if (!stompClient) throw new Error(NOT_CONNECTED_TO_SOCKET_ERR_MSG);
  stompClient.publish({
    destination: `/app/api/game/${gameId}/resign-draw`,
    body: JSON.stringify({
      winner: OPP_COLOR[resigning][0],
      result: "resignation",
    }),
  });
}

export function sendMove(gameId: string, playerId: string, move: MoveNotation) {
  let stompClient = socket();
  if (!stompClient) throw new Error(NOT_CONNECTED_TO_SOCKET_ERR_MSG);
  stompClient.publish({
    destination: `/app/api/game/${gameId}`,
    body: JSON.stringify({
      playerId,
      move,
    }),
  });
}

export async function makeEngineMove(gameId: string, moves: string[]) {
  const worker = new Worker("/src/utils/game/engineMoveWorkerScript.ts", {
    type: "module",
  });
  worker.postMessage({ moves: moves.join(" ") });
  worker.onmessage = (msg) => {
    sendMove(gameId, "engine", msg.data.engineMove);
    worker.terminate();
  };
}
