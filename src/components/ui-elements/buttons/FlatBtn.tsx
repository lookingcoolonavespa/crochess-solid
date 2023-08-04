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
}

export function FlatBtn(props: FlatBtnProps) {
  const classes = [styles.main, styles[props.size]];
  if (props.className) classes.push(props.className);
  if (props.filled) classes.push(styles.filled);
  if (props.hollow) classes.push(styles.hollow);

  return (
    <button
      type={props.type || "button"}
      class={classes.join(" ")}
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
