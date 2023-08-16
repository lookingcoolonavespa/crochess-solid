import { createMemo } from "solid-js";

interface TimerBarProps {
  time: number | null;
  maxTime: number;
}

export default function TimerBar(props: TimerBarProps) {
  let timeLeft = createMemo(() => {
    let timeLeft = ((props.time || 0) / props.maxTime) * 100;
    if (isNaN(timeLeft)) return 0;
    else return timeLeft;
  });

  return (
    <div
      style={{
        width: `${timeLeft()}%`,
        height: "3px",
        "background-color": "red",
        "max-width": "100%",
      }}
    ></div>
  );
}
