import {
  NOT_CONNECTED_TO_SOCKET_ERR_MSG,
  OPP_COLOR,
  USER_NOT_FOUND_ERR_MSG,
} from "../constants";
import { user, socket } from "../globalState";
import { Colors, GameSeek, GameSeekColors, MoveNotation } from "../types/types";

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

export function parseCookies(cookie: string): { [key: string]: string } {
  const cookies = cookie.split("; ");
  return cookies
    .map((c) => c.split("="))
    .reduce<{ [key: string]: string }>((acc, curr) => {
      const [key, value] = curr;
      acc[key] = value;
      return acc;
    }, {});
}

export function getActivePlayer(
  gameId: string,
  whiteId: string,
  blackId: string
): Colors | null {
  const cookieObj = parseCookies(document.cookie);
  switch (true) {
    case cookieObj[`${gameId}(w)`] === whiteId &&
      cookieObj[`${gameId}(b)`] === blackId: {
      // player is playing on two separate tabs
      const user = sessionStorage.getItem("user");
      if (user === whiteId) return "white";
      if (user === blackId) return "black";
      return null;
    }
    case cookieObj[`${gameId}(w)`] === whiteId: {
      return "white";
    }
    case cookieObj[`${gameId}(b)`] === blackId: {
      return "black";
    }
    default:
      return null;
  }
}

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
