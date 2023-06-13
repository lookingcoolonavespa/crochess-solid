import { Client } from "@stomp/stompjs";
import { GameSeekColors } from "../types/types";

export function createGameSeek(
  stompClient: Client,
  time: number,
  increment: number,
  color: GameSeekColors,
  seeker: string
) {
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
