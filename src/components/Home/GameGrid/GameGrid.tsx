import styles from "../../../styles/Home/GameGrid.module.scss";
import { toMilliseconds } from "../../../utils/time";
import { createSignal } from "solid-js";
import { user } from "../../../globalState";
import { Option } from "../../../types/types";
import { timeControls } from "../../../constants";
import { TimeControlButton } from "./TimeControlButton";
import { createGameSeek } from "../../../utils/game/createGameSeek";

interface GameGridProps {
  active: boolean;
  createCustomGame: () => void;
}

export const GameGrid = (props: GameGridProps) => {
  const [activeSearch, setActiveSearch] = createSignal<Option<number>>(null);

  return (
    <div
      class={[styles.game_grid_main, "foreground"].join(" ")}
      classList={{
        inactive: !props.active,
      }}
    >
      {timeControls.map((tc, i) => {
        let onClick =
          tc.type === "custom"
            ? () => {
                props.createCustomGame();
              }
            : () => {
                setActiveSearch(i);
                const time = toMilliseconds({ minutes: tc.time });
                try {
                  if (!user) return;
                  createGameSeek(time, tc.increment, "random");
                } catch (err) {
                  console.log(err);
                }
              };
        return (
          <div class={styles.grid_box}>
            <TimeControlButton
              time={tc.time}
              increment={tc.increment}
              type={tc.type}
              searching={activeSearch() === i}
              onClick={onClick}
            />
          </div>
        );
      })}
    </div>
  );
};
