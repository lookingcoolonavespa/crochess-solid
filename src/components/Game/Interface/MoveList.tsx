import { HistoryArr } from "../../../types/types";
import { createEffect, For, on, Show } from "solid-js";
import { Move } from "./Move";

interface HistoryDisplayProps {
  list: HistoryArr;
  moveBeingViewed: number;
  styles: { [key: string]: string };
}

export function MoveList(props: HistoryDisplayProps) {
  let scrollEndRef: HTMLElement;
  function scrollIntoView(ref: HTMLElement) {
    ref!.scrollIntoView({
      behavior: "auto",
      block: "end",
      inline: "center",
    });
  }

  createEffect(
    on([() => props.list], () => {
      scrollIntoView(scrollEndRef);
    }),
  );

  return (
    <div class={props.styles.moves_ctn}>
      <ol>
        <Show when={props.list}>
          <For each={props.list}>
            {(move, i) => {
              const [wMove, bMove] = move;
              const whiteMoveBeingViewed = () => {
                const moveBeingViewed = get2dArrIndexFrom1dArrIndex(
                  props.moveBeingViewed,
                );
                return moveBeingViewed[0] === i() && moveBeingViewed[1] === 0;
              };
              const blackMoveBeingViewed = () => {
                const moveBeingViewed = get2dArrIndexFrom1dArrIndex(
                  props.moveBeingViewed,
                );
                return moveBeingViewed[0] === i() && moveBeingViewed[1] === 1;
              };

              return (
                <li class={props.styles.list_item}>
                  <p class={props.styles.move_no}>{i() + 1}</p>
                  <div class={props.styles.moves_wrapper}>
                    <Move
                      moveIsBeingViewed={whiteMoveBeingViewed}
                      move={wMove}
                      styles={props.styles}
                    />
                    <Show when={!!bMove}>
                      <Move
                        moveIsBeingViewed={blackMoveBeingViewed}
                        move={bMove}
                        styles={props.styles}
                      />
                    </Show>
                  </div>
                </li>
              );
            }}
          </For>
        </Show>
      </ol>
      <span ref={scrollEndRef!}></span>
    </div>
  );
}

function get2dArrIndexFrom1dArrIndex(oneDIndex: number): [number, number] {
  const firstArrIdx = Math.floor(oneDIndex / 2);
  return [firstArrIdx, oneDIndex % 2 === 0 ? 0 : 1];
}

export const TESTING = { get2dArrIndexFrom1dArrIndex };
