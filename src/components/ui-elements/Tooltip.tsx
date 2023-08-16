import styles from "../../styles/ui-elements/Tooltip.module.scss";

type TooltipProps = {
  text: string;
};

export function Tooltip(props: TooltipProps) {
  return <div class={styles.main}>{props.text}</div>;
}
