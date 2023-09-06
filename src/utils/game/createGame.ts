import {
  NOT_CONNECTED_TO_SOCKET_ERR_MSG,
  USER_NOT_FOUND_ERR_MSG,
} from "../../constants";
import { socket, user } from "../../globalState";
import { Colors, GameSeek } from "../../types/types";

function getRdmColor(): Colors {
  const rdm = Math.random();
  return rdm >= 0.5 ? "white" : "black";
}

export function createGame(gameSeek: GameSeek): void {
  let challenger = user();
  if (!challenger) throw new Error(USER_NOT_FOUND_ERR_MSG);
  if (gameSeek.color.toLowerCase() === "random") gameSeek.color = getRdmColor();

  let whitePlayer, blackPlayer;
  switch (gameSeek.color.toLowerCase()) {
    case "w":
      whitePlayer = challenger;
      blackPlayer = gameSeek.seeker;
      break;
    case "b":
      whitePlayer = gameSeek.seeker;
      blackPlayer = challenger;
      break;
  }

  let stompClient = socket();
  if (!stompClient) throw new Error(NOT_CONNECTED_TO_SOCKET_ERR_MSG);

  stompClient.publish({
    destination: "/app/api/game",
    body: JSON.stringify({
      w_id: whitePlayer,
      b_id: blackPlayer,
      time: gameSeek.time,
      increment: gameSeek.increment,
    }),
  });
}

export function initPlayEngine() {
  if (!user()) throw new Error(USER_NOT_FOUND_ERR_MSG);

  const userColor = getRdmColor();
  let whitePlayer, blackPlayer;
  switch (userColor) {
    case "white":
      whitePlayer = user();
      blackPlayer = "engine";
      break;
    case "black":
      whitePlayer = "engine";
      blackPlayer = user();
      break;
  }

  let stompClient = socket();
  if (!stompClient) throw new Error(NOT_CONNECTED_TO_SOCKET_ERR_MSG);

  stompClient.publish({
    destination: "/app/api/game",
    body: JSON.stringify({
      w_id: whitePlayer,
      b_id: blackPlayer,
      time: 1,
      increment: 0,
    }),
  });
}
