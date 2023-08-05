import { createEffect, createSignal, onCleanup } from "solid-js";
import { socket } from "../globalState";
import { GameSeek } from "../types/types";

export function useListOfGames() {
  const [listOfGames, setListOfGames] = createSignal<GameSeek[]>([]);

  createEffect(function subscribeToGameSeeks() {
    const stompClient = socket();
    if (!stompClient) return;
    const subscription = stompClient.subscribe(
      "/app/api/gameseeks",
      (message) => {
        if (!message.body) return;
        const data = JSON.parse(message.body);
        setListOfGames(data);
      }
    );

    stompClient.subscribe("/topic/api/gameseeks", (message) => {
      if (!message.body) return;
      type MessageBody = insert | deleteGs;

      interface insert {
        event: "insert";
        payload: GameSeek;
      }
      interface deleteGs {
        event: "delete";
        payload: number[];
      }

      const data: MessageBody = JSON.parse(message.body);
      switch (data.event) {
        case "insert": {
          setListOfGames((prev) => prev.concat(data.payload));
          break;
        }
        case "delete": {
          setListOfGames((prev) =>
            prev.filter((v) => !data.payload.includes(parseInt(v.id)))
          );
          break;
        }
      }
    });

    onCleanup(() => subscription.unsubscribe());
  });

  return { listOfGames };
}
