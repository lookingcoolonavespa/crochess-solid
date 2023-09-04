import Timer, { TimerProps } from "./Timer";
import styles from "../../../styles/Game/Interface.module.scss";
import TimerBar from "./TimerBar";
import {
  Colors,
  Option,
  HistoryArr,
  InterfaceStatus,
} from "../../../types/types";
import { createMemo, Setter, Show } from "solid-js";
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
  whiteDetails: TimeDetails;
  blackDetails: TimeDetails;
  history: HistoryArr;
  historyControls: {
    goBackToStart: () => void;
    goBackOneMove: () => void;
    goForwardOneMove: () => void;
    goToCurrentMove: () => void;
  };
  view: Colors;
  flipBoard: () => void;
}

interface TimeDetails extends Omit<TimerProps, "className"> {
  maxTime: number;
}

export default function Interface(props: InterfaceProps) {
  const topTimer = createMemo(() =>
    props.view === "white" ? props.blackDetails : props.whiteDetails
  );

  const bottomTimer = createMemo(() =>
    props.view === "white" ? props.whiteDetails : props.blackDetails
  );

  return (
    <div class={styles.main}>
      <Timer className={`${styles.timer} ${styles.top}`} {...topTimer()} />
      <TimerBar maxTime={topTimer().maxTime} time={topTimer().time} />
      <div class={styles.display_wrapper}>
        <Show when={props.status}>
          <GameStatusDisplay
            setStatus={props.setStatus}
            resetStatus={props.resetStatus}
            styles={styles}
            status={props.status}
            activePlayer={props.activePlayer as Colors}
          />
        </Show>
        <History
          moveList={props.history}
          flipBoard={props.flipBoard}
          controls={props.historyControls}
        />
      </div>
      <Show when={props.activePlayer && props.gameActive}>
        <GameStatusControls
          offerDraw={props.offerDraw}
          resign={props.resign}
          offeredDraw={props.status?.type === "offeredDraw"}
        />
      </Show>
      <TimerBar maxTime={bottomTimer().maxTime} time={bottomTimer().time} />
      <Timer
        className={`${styles.timer} ${styles.bottom}`}
        {...bottomTimer()}
      />
    </div>
  );
}
