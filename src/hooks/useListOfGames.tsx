import { Client } from "@stomp/stompjs";
import { createEffect, createSignal, onCleanup } from "solid-js";
import { GameSeek } from "../types/types";

export function useListOfGames(stompClient: Client) {
  const [listOfGames, setListOfGames] = createSignal<GameSeek[]>([]);

  createEffect(
    function subscribeToGameSeeks() {
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
    },
    [stompClient]
  );

  return { listOfGames };
}
