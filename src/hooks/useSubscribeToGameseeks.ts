import { createEffect, createSignal, onCleanup } from "solid-js";
import { socket, user } from "../globalState";
import { Colors, GameSeek } from "../types/types";
import {
  ACCEPTED_EVENT,
  DELETION_EVENT,
  INIT_EVENT,
  INSERT_EVENT,
} from "../websocket/events";
import { GAMESEEKS_TOPIC } from "../websocket/topics";
import { WebSocketMessage } from "../websocket/websocket";

export function useSubscribeToGameseeks() {
  const [listOfGames, setListOfGames] = createSignal<GameSeek[]>([]);

  createEffect(function subscribeToGameSeeks() {
    const stompClient = socket();
    if (!stompClient) return;

    type MessageBody = init | insert | deleteGs | accepted;

    interface message extends WebSocketMessage {
      topic: typeof GAMESEEKS_TOPIC;
    }
    interface init extends message {
      event: typeof INIT_EVENT;
      payload: GameSeek[] | null;
    }
    interface insert extends message {
      event: typeof INSERT_EVENT;
      payload: GameSeek;
    }
    interface deleteGs extends message {
      event: typeof DELETION_EVENT;
      payload: number[];
    }
    interface accepted extends message {
      event: typeof ACCEPTED_EVENT;
      payload: {
        game_id: string;
        playerColor: Colors;
      };
    }
    const subscription = stompClient.subscribe("gameseeks", (message) => {
      if (!message) return;
      message = message as MessageBody;

      switch (message.event) {
        case INIT_EVENT: {
          setListOfGames(message.payload || []);
          break;
        }
        case INSERT_EVENT: {
          setListOfGames((prev) => {
            return prev.concat(message.payload);
          });
          break;
        }
        case DELETION_EVENT: {
          setListOfGames((prev) =>
            prev.filter((v) => !message.payload.includes(parseInt(v.id))),
          );
          break;
        }
        case ACCEPTED_EVENT: {
          const { game_id: gameId, playerColor } = message.payload;
          setIdToCookie(gameId, playerColor.toLowerCase() as Colors);
          function setIdToCookie(gameId: string, color: Colors) {
            // set the active playerIds to a cookie so we can tell between active players and spectators
            document.cookie = `${gameId}(${color})=${user()};max-age=${
              60 * 60 * 24
            };samesite=strict`;
          }

          window.dispatchEvent(
            new CustomEvent("acceptedGameseek", { detail: { gameId } }),
          );
        }
      }
    });

    onCleanup(() => subscription.unsubscribe());
  });

  return { listOfGames };
}
