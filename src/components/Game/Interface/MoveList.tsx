import { HistoryArr } from "../../../types/types";
import useScrollOnLoad from "../../../hooks/useScrollToBottom";
import { onMount } from "solid-js";

interface HistoryDisplayProps {
  list: HistoryArr;
  styles: { [key: string]: string };
}

export function MoveList({ list, styles }: HistoryDisplayProps) {
  let scrollEndRef: HTMLElement;
  onMount(() => {
    useScrollOnLoad(scrollEndRef, list);
  });

  return (
    <div class={styles.moves_ctn}>
      <ol>
        {list &&
          list.map((move, i) => {
            const [wMove, bMove] = move;
            return (
              <li class={styles.list_item}>
                <p class={styles.move_no}>{i + 1}</p>
                <div class={styles.moves_wrapper}>
                  <p>{wMove}</p>
                  {bMove && <p>{bMove}</p>}
                </div>
              </li>
            );
          })}
      </ol>
      <span ref={scrollEndRef!}></span>
    </div>
  );
}
