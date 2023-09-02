import Timer, { TimerProps } from "./Timer";
import styles from "../../../styles/Game/Interface.module.scss";
import TimerBar from "./TimerBar";
import { Colors, HistoryArr } from "../../../types/types";
import { GameOverDetails } from "../../../types/interfaces";
import { createEffect, createMemo, createSignal, Show } from "solid-js";
import GameStatusDisplay from "./GameStatusDisplay";
import { Controls, createControlBtnObj } from "./Controls";
import { History } from "./History";
import { FlagIcon } from "../../icons/FlagIcon";
import { GameStatusControls } from "./GameStatusControls";

interface InterfaceProps {
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
  gameOverDetails: GameOverDetails;
  offeredDraw: boolean;
  claimDraw: boolean;
}

interface TimeDetails extends Omit<TimerProps, "className"> {
  maxTime: number;
}

export default function Interface(props: InterfaceProps) {
  const [status, setStatus] = createSignal<{
    type:
      | "gameOver"
      | "offeredDraw"
      | "claimDraw"
      | "offerDrawConfirmation"
      | "resignConfirmation";
    payload: GameOverDetails | undefined;
    close: (() => void) | undefined;
  }>();
  const [resignConfirmation, setResignConfirmation] = createSignal(false);
  const [offerDrawConfirmation, setOfferDrawConfirmation] = createSignal(false);

  let oldDetails = {
    gameOver: !!props.gameOverDetails,
    offeredDraw: props.offeredDraw,
    claimDraw: props.claimDraw,
    resignConfirmation: resignConfirmation(),
    offerDrawConfirmation: offerDrawConfirmation(),
  };
  createEffect(() => {
    //
    const currentDetails = {
      gameOver: !!props.gameOverDetails?.result,
      offeredDraw: props.offeredDraw,
      claimDraw: props.claimDraw,
      resignConfirmation: resignConfirmation(),
      offerDrawConfirmation: offerDrawConfirmation(),
    };

    function getChangedVariableThatsTruthy() {
      let key: keyof typeof oldDetails;
      for (key in oldDetails) {
        if (oldDetails[key] === currentDetails[key]) continue;
        if (!currentDetails[key]) continue;
        return key;
      }
    }
    const statusType = getChangedVariableThatsTruthy();

    oldDetails = currentDetails; // need to update before function exits

    if (!statusType) return setStatus(undefined);
    if (!props.activePlayer && statusType !== "gameOver") {
      return;
    }

    let close;
    switch (statusType) {
      case "resignConfirmation":
        close = cancelResign;
        break;
      case "offerDrawConfirmation":
        close = cancelDraw;
        break;
    }

    setStatus({
      close,
      type: statusType,
      payload: statusType === "gameOver" ? props.gameOverDetails : undefined,
    });
  });

  const topTimer = createMemo(() =>
    props.view === "white" ? props.blackDetails : props.whiteDetails
  );

  const bottomTimer = createMemo(() =>
    props.view === "white" ? props.whiteDetails : props.blackDetails
  );

  function resign() {
    setResignConfirmation(true);
  }
  function cancelResign() {
    setResignConfirmation(false);
  }

  function offerDraw() {
    setOfferDrawConfirmation(true);
  }
  function cancelDraw() {
    setOfferDrawConfirmation(false);
  }

  return (
    <div class={styles.main}>
      <Timer className={`${styles.timer} ${styles.top}`} {...topTimer()} />
      <TimerBar maxTime={topTimer().maxTime} time={topTimer().time} />
      <div class={styles.display_wrapper}>
        <Show when={status}>
          <GameStatusDisplay
            setStatus={setStatus}
            styles={styles}
            status={status()}
            activePlayer={props.activePlayer as Colors}
          />
        </Show>
        <History
          moveList={props.history}
          flipBoard={props.flipBoard}
          controls={props.historyControls}
        />
      </div>
      <Show when={props.activePlayer && !props.gameOverDetails.result}>
        <GameStatusControls
          offerDraw={offerDraw}
          resign={resign}
          offeredDraw={props.offeredDraw}
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
