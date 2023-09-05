import { JSX, Show } from "solid-js";
import styles from "../../../styles/ui-elements/FlatBtn.module.scss";

interface FlatBtnProps {
  className?: string;
  type?: "button" | "submit" | "reset" | undefined;
  text?: string;
  underline?: boolean;
  filled?: boolean;
  hollow?: boolean;
  size: "small" | "medium";
  onClick?: JSX.EventHandler<HTMLButtonElement, MouseEvent>;
  icon?: JSX.Element;
  inactive?: boolean;
}

export function FlatBtn(props: FlatBtnProps) {
  return (
    <button
      type={props.type || "button"}
      class={[styles.main, styles[props.size], props.className || ""].join(" ")}
      classList={{
        [styles.filled]: props.filled,
        [styles.hollow]: props.hollow,
        [styles.inactive]: props.inactive,
      }}
      onClick={props.onClick}
    >
      <Show when={props.text}>
        <span class={props.underline ? styles["underline-hover"] : ""}>
          {props.text}
        </span>
      </Show>
      <Show when={props.icon}>{props.icon}</Show>
    </button>
  );
}
