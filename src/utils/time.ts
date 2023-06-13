import dayjs from "dayjs";
import duration from "dayjs/plugin/duration";
import { Time } from "../types/types";

dayjs.extend(duration);

export function toMilliseconds(time: Time) {
  return dayjs.duration(time).asMilliseconds();
}

export function fromMillisecondsToMinutes(ms: number) {
  return dayjs.duration(ms).asMinutes();
}

export function formatTime(ms: number) {
  const duration = dayjs.duration(ms);

  const atLeastAnHour = duration.asHours() >= 1;
  const belowTwentySeconds = duration.asSeconds() <= 20;

  switch (true) {
    case atLeastAnHour: {
      return duration.format("HH:mm:ss");
    }
    case belowTwentySeconds: {
      return duration.format("mm:ss:SSS");
    }
    default: {
      return duration.format("mm:ss");
    }
  }
}

export { dayjs };
