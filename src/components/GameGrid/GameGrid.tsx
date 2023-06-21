import styles from "../../styles/GameGrid.module.scss";
import { toMilliseconds } from "../../utils/time";
import { createSignal, useContext } from "solid-js";
import { Option } from "../../types/types";
import { timeControls } from "../../constants";
import { UserContext } from "../../utils/contexts/UserContext";
import { createGameSeek } from "../../utils/game";
import { TimeControlButton } from "./TimeControlButton";

interface GameGridProps {
  active: boolean;
  createCustomGame: () => void;
}

export const GameGrid = (props: GameGridProps) => {
  const [activeSearch, setActiveSearch] = createSignal<Option<number>>(null);
  const { user, socket } = useContext(UserContext) || {
    user: null,
    socket: null,
  };

  const rootClasses = [styles.main, "foreground"];

  return (
    <div class={styles.grid_container}>
      <div class={rootClasses.join(" ")} classList={{ inactive: props.active }}>
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
                    createGameSeek(socket!, time, tc.increment, "random", user);
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
    </div>
  );
};
