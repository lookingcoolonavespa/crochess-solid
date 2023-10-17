import { createEffect, onCleanup, Show } from "solid-js";
import { TimeDetails } from "../../../types/interfaces";
import { formatTime } from "../../../utils/time";

export interface TimerProps extends TimeDetails {
  className: string;
  active: boolean;
  setTime: (time: number) => void;
}

export default function Timer(props: TimerProps) {
  createEffect(() => {
    /*
      if active, start timer 
      subtract elapsed time from playerTime to get clock 
    */
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

    onCleanup(() => clearInterval(interval));
  });
  console.log("timer component")

  return (
    <div class={props.className} classList={{ active: props.active }}>
      <Show when={props.time != null} fallback="-:--:--">
        {formatTime(props.time as number)
          .split(":")
          .map((val, i, thisArr) => {
            let isLastVal = false;
            let isMillisecond = false;
            if (i === thisArr.length - 1) isLastVal = true;
            if (i === 2) isMillisecond = true;
            return (
              <span
                classList={{
                  millisecond: isMillisecond,
                }}
              >
                {val}
                <Show when={!isLastVal}>:</Show>
              </span>
            );
          })}
      </Show>
    </div>
  );
}
