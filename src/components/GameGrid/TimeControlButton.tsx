import { Match, Switch } from "solid-js";
import { GameType } from "../../types/types";
import styles from "../../styles/TimeControlButton.module.scss";

type TimeControlButtonProps = {
  time: number | null;
  increment: number | null;
  type: GameType | "custom";
  searching: boolean;
  onClick: () => void;
};

export const TimeControlButton = (props: TimeControlButtonProps) => {
  return (
    <div
      class={[styles.main, "hover-highlight outline"].join(" ")}
      classList={{
        "no-hover": props.searching,
        "sm-box-shadow": props.searching,
        searching: props.searching,
      }}
      onClick={props.onClick}
    >
      <h3 class={styles.title}>
        {props.type === "custom"
          ? props.type
          : `${props.time} + ${props.increment}`}
      </h3>
      <Switch>
        <Match when={props.searching}>
          <div class="sm-loader"></div>
        </Match>
        <Match when={props.type !== "custom"}>
          <p class={styles.caption}>{props.type}</p>
        </Match>
      </Switch>
    </div>
  );
};
