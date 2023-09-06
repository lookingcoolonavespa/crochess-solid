import {
  NOT_CONNECTED_TO_SOCKET_ERR_MSG,
  USER_NOT_FOUND_ERR_MSG,
} from "../../constants";
import { socket, user } from "../../globalState";
import { GameSeekColors } from "../../types/types";

export function createGameSeek(
  time: number,
  increment: number,
  color: GameSeekColors
) {
  let seeker = user();
  let stompClient = socket();
  if (!seeker) throw new Error(USER_NOT_FOUND_ERR_MSG);
  if (!stompClient) throw new Error(NOT_CONNECTED_TO_SOCKET_ERR_MSG);

  let colorToSendToServer = color === "white" ? "w" : "b";

  stompClient.publish({
    destination: "/app/api/gameseeks",
    body: JSON.stringify({
      time,
      increment,
      seeker,
      color: colorToSendToServer,
    }),
  });
}
