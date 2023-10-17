import { Show } from "solid-js";
import { GameType } from "../../../types/types";
import styles from "../../../styles/Home/TimeControlButton.module.scss";

type TimeControlButtonProps = {
  time: number | null;
  increment: number | null;
  type: GameType | "custom";
  searching: boolean;
  active: boolean;
  onClick: () => void;
};

export const TimeControlButton = (props: TimeControlButtonProps) => {
  return (
    <div
      class={styles.main}
      classList={{
        [styles.searching]: props.searching,
        [styles.active]: props.active,
      }}
      onClick={props.onClick}
    >
      <Show when={props.active}>
        <div class="loader" />
      </Show>
      <h3 class={styles.title}>
        {props.type === "custom"
          ? props.type
          : `${props.time} + ${props.increment}`}
      </h3>
      <Show when={props.type !== "custom"}>
        <p class={styles.caption}>{props.type}</p>
      </Show>
    </div>
  );
};
