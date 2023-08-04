import styles from "../../../styles/Game/History.module.scss";
import { HistoryArr } from "../../../types/types";
import { Controls, createControlBtnObj } from "./Controls";
import { MoveList } from "./MoveList";
import { FlipIcon } from "../../icons/FlipIcon";
import { ForwardIcon } from "../../icons/ForwardIcon";
import { BackIcon } from "../../icons/BackIcon";
import { SkipBackwardIcon } from "../../icons/SkipBackwardIcon";
import { SkipForwardIcon } from "../../icons/SkipForwardIcon";

interface HistoryProps {
  moveList: HistoryArr;
  controls: {
    goBackToStart: () => void;
    goBackOneMove: () => void;
    goForwardOneMove: () => void;
    goToCurrentMove: () => void;
  };
  flipBoard: () => void;
}

export function History({ moveList, controls, flipBoard }: HistoryProps) {
  return (
    <section class={styles.main}>
      <Controls
        className={styles["controls-ctn"]}
        list={[
          createControlBtnObj(<FlipIcon />, "flip board", undefined, flipBoard),
          createControlBtnObj(
            <SkipBackwardIcon />,
            "go to start of game",
            undefined,
            controls.goBackToStart
          ),
          createControlBtnObj(
            <BackIcon />,
            "last move",
            undefined,
            controls.goBackOneMove
          ),
          createControlBtnObj(
            <ForwardIcon />,
            "next move",
            undefined,
            controls.goForwardOneMove
          ),
          createControlBtnObj(
            <SkipForwardIcon />,
            "go to end/current move",
            undefined,
            controls.goToCurrentMove
          ),
        ]}
      />
      <MoveList list={moveList} styles={styles} />
    </section>
  );
}
