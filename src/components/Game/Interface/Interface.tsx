import Timer, { TimerProps } from "./Timer";
import styles from "../../../styles/Game/Interface.module.scss";
import TimerBar from "./TimerBar";
import {
  Colors,
  Option,
  HistoryArr,
  InterfaceStatus,
} from "../../../types/types";
import { Setter, Show } from "solid-js";
import GameStatusDisplay from "./GameStatusDisplay";
import { History } from "./History";
import { GameStatusControls } from "./GameStatusControls";

interface InterfaceProps {
  gameActive: boolean;
  status: Option<InterfaceStatus>;
  setStatus: Setter<Option<InterfaceStatus>>;
  resetStatus: () => void;
  offerDraw: () => void;
  resign: () => void;
  activePlayer: Colors | null;
  topTimer: TimeDetails;
  bottomTimer: TimeDetails;
  history: HistoryArr;
  historyControls: {
    goBackToStart: () => void;
    goBackOneMove: () => void;
    goForwardOneMove: () => void;
    goToCurrentMove: () => void;
  };
  flipBoard: () => void;
  moveBeingViewed: number;
  playingAgainstEngine: boolean;
}

interface TimeDetails extends Omit<TimerProps, "className"> {
  maxTime: number;
}

export default function Interface(props: InterfaceProps) {
  return (
    <div class={styles.main}>
        <Timer
          className={`${styles.timer} ${styles.top}`}
          {...props.topTimer}
        />
        <TimerBar maxTime={props.topTimer.maxTime} time={props.topTimer.time} />
      <div class={styles.display_wrapper}>
        <Show when={props.status}>
          <GameStatusDisplay
            setStatus={props.setStatus}
            resetStatus={props.resetStatus}
            styles={styles}
            status={props.status}
            activePlayer={props.activePlayer}
          />
        </Show>
        <History
          moveList={props.history}
          flipBoard={props.flipBoard}
          controls={props.historyControls}
          moveBeingViewed={props.moveBeingViewed}
        />
      </div>
      <Show
        when={
          props.activePlayer && props.gameActive && !props.playingAgainstEngine
        }
      >
        <GameStatusControls
          offerDraw={props.offerDraw}
          resign={props.resign}
          offeredDraw={props.status?.type === "offeredDraw"}
        />
      </Show>
      <Show when={!props.playingAgainstEngine}>
        <TimerBar
          maxTime={props.bottomTimer.maxTime}
          time={props.bottomTimer.time}
        />
        <Timer
          className={`${styles.timer} ${styles.bottom}`}
          {...props.bottomTimer}
        />
      </Show>
    </div>
  );
}
