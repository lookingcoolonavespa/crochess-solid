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
  moveBeingViewed: number;
}

export function History(props: HistoryProps) {
  return (
    <section class={styles.main}>
      <Controls
        className={styles["controls-ctn"]}
        list={[
          createControlBtnObj(
            <FlipIcon />,
            "flip board",
            undefined,
            props.flipBoard
          ),
          createControlBtnObj(
            <SkipBackwardIcon />,
            "go to start of game",
            undefined,
            props.controls.goBackToStart
          ),
          createControlBtnObj(
            <BackIcon />,
            "last move",
            undefined,
            props.controls.goBackOneMove
          ),
          createControlBtnObj(
            <ForwardIcon />,
            "next move",
            undefined,
            props.controls.goForwardOneMove
          ),
          createControlBtnObj(
            <SkipForwardIcon />,
            "go to end/current move",
            undefined,
            props.controls.goToCurrentMove
          ),
        ]}
      />
      <MoveList
        list={props.moveList}
        moveBeingViewed={props.moveBeingViewed}
        styles={styles}
      />
    </section>
  );
}
