import { JSX } from "solid-js";
import styles from "../../styles/Home/Tab.module.scss";

type Direction = "right" | "left";

type TabProps = {
  underlineSlideDirection?: Direction;
  active: boolean;
  onClick: JSX.EventHandler<HTMLLIElement, MouseEvent>;
  text: string;
};

export function Tab(props: TabProps) {
  return (
    <li
      class={styles.main}
      classList={{
        [styles.inactive]: !props.active,
        [styles.slide_left]: props.underlineSlideDirection === "left",
        [styles.slide_right]: props.underlineSlideDirection === "right",
      }}
      onClick={props.onClick}
    >
      <span>{props.text}</span>
    </li>
  );
}
