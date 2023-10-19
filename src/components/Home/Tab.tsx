import { JSX } from "solid-js";
import styles from "../../styles/Home/Tab.module.scss";

type Direction = "right" | "left";

type TabProps = {
  index: number;
  tabDetails: { active: number; prev: number };
  onClick: JSX.EventHandler<HTMLLIElement, MouseEvent>;
  text: string;
};

export function Tab(props: TabProps) {
  return (
    <li
      class={styles.main}
      classList={{
        [styles.inactive]: props.index != props.tabDetails.active,
        [styles.slide_left]: props.tabDetails.active > props.index,
        [styles.slide_right]: props.tabDetails.active < props.index,
      }}
      onClick={props.onClick}
    >
      <span>{props.text}</span>
    </li>
  );
}
