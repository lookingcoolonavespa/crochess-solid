import { Client } from "@stomp/stompjs";
import { Accessor } from "solid-js";
import { OPP_COLOR } from "../constants";
import { user, socket, Socket, User } from "../globalState";
import { Colors, GameSeek, GameSeekColors, GameType } from "../types/types";

export function createGameSeek(
  time: number,
  increment: number,
  color: GameSeekColors
) {
  let seeker = user();
  let stompClient = socket();
  if (!seeker || !stompClient) return;

  stompClient.publish({
    destination: "/app/api/gameseeks",
    body: JSON.stringify({
      time,
      increment,
      color,
      seeker,
    }),
  });
}

function getRdmColor(): Colors {
  const rdm = Math.random();
  return rdm >= 0.5 ? "white" : "black";
}

export function createGame(gameSeek: GameSeek): void {
  let challenger = user();
  if (!challenger) return;
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
  if (!stompClient) return console.error(NOT_CONNECTED_TO_SOCKET_ERR_MSG);

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
  if (!stompClient) return console.error(NOT_CONNECTED_TO_SOCKET_ERR_MSG);
  const oppColor = OPP_COLOR[offerer];
  stompClient.publish({
    destination: `/app/api/game/${gameId}/draw`,
    body: JSON.stringify({
      [offerer]: false,
      [oppColor]: true,
    }),
  });
}

export async function denyDraw(stompClient: Client, gameId: string) {
  stompClient.publish({
    destination: `/app/api/game/${gameId}/draw`,
    body: JSON.stringify({
      w: false,
      b: false,
    }),
  });
}

export async function claimDraw(stompClient: Client, gameId: string) {
  stompClient.publish({
    destination: `/app/api/game/${gameId}/resign-draw`,
    body: JSON.stringify({
      winner: null,
      result: "draw",
    }),
  });
}

export async function resign(
  stompClient: Client,
  gameId: string,
  resigning: Colors
) {
  stompClient.publish({
    destination: `/app/api/game/${gameId}/resign-draw`,
    body: JSON.stringify({
      winner: OPP_COLOR[resigning],
      result: "resignation",
    }),
  });
}
