import { HistoryArr } from "../../../types/types";
import useScrollOnLoad from "../../../hooks/useScrollToBottom";
import { For, onMount, Show } from "solid-js";

interface HistoryDisplayProps {
  list: HistoryArr;
  styles: { [key: string]: string };
}

export function MoveList(props: HistoryDisplayProps) {
  let scrollEndRef: HTMLElement;
  onMount(() => {
    useScrollOnLoad(scrollEndRef, props.list);
  });

  return (
    <div class={props.styles.moves_ctn}>
      <ol>
        <Show when={props.list}>
          <For each={props.list}>
            {(move, i) => {
              const [wMove, bMove] = move;
              return (
                <li class={props.styles.list_item}>
                  <p class={props.styles.move_no}>{i() + 1}</p>
                  <div class={props.styles.moves_wrapper}>
                    <p>{wMove}</p>
                    <Show when={!!bMove}>
                      <p>{bMove}</p>
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
