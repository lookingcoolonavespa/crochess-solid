import { createEffect, Show } from "solid-js";
import { TimeDetails } from "../../../types/interfaces";
import { formatTime } from "../../../utils/time";

export interface TimerProps extends TimeDetails {
  className: string;
  active: boolean;
  setTime: (time: number) => void;
}

export default function Timer(props: TimerProps) {
  const classNames = [props.className];
  if (props.active) classNames.push("active");

  createEffect(() => {
    /*
      if active, start timer 
      subtract elapsed time from playerTime to get clock 
    */
    console.log(props.time);
    if (
      !props.active ||
      !props.time ||
      !props.stampAtTurnStart ||
      props.timeLeftAtTurnStart === null
    )
      return;
    const interval: number = window.setInterval(() => {
      const elapsed = Date.now() - (props.stampAtTurnStart as number);
      const timeLeft = (props.timeLeftAtTurnStart as number) - elapsed;
      if (timeLeft < 0) return clearInterval(interval);
      props.setTime(timeLeft);
      // if (!timeLeft) return clearInterval(interval);
    }, 1);

    return () => clearInterval(interval);
  });

  return (
    <div class={classNames.join(" ")}>
      <Show when={props.time != null} fallback="-:--:--">
        {formatTime(props.time as number)}
      </Show>
    </div>
  );
}
