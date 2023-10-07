import { useParams } from "@solidjs/router";
import { Match, Setter, Switch } from "solid-js";
import {
  Colors,
  GameOverStatus,
  InterfaceStatus,
  Option,
} from "../../../types/types";
import {
  claimDraw,
  denyDraw,
  offerDraw,
  resign,
} from "../../../utils/game/ingameActions";
import { CheckIcon } from "../../icons/CheckIcon";
import { CloseIcon } from "../../icons/CloseIcon";
import { FlatBtn } from "../../ui-elements/buttons/FlatBtn";
import { IconBtn } from "../../ui-elements/buttons/IconBtn";

interface GameStatusDisplayProps {
  styles: { [key: string]: string };
  setStatus: Setter<Option<InterfaceStatus>>;
  resetStatus: () => void;
  status: Option<InterfaceStatus>;
  activePlayer: Option<Colors>;
}

export default function GameStatusDisplay(props: GameStatusDisplayProps) {
  const { id: gameId } = useParams();

  return (
    <div class={props.styles.game_over_display}>
      <IconBtn
        className="close-btn"
        icon={<CloseIcon />}
        altText="hide game over message"
        onClick={() => {
          props.setStatus(null);
        }}
      />
      <div class="status_display">
        <Switch>
          <Match when={props.status?.type === "gameOver"}>
            <p>Game over</p>
            <p>{(props.status! as GameOverStatus).payload!.result}</p>
            <p>
              {
                {
                  "1-0": "White wins",
                  "0-1": "Black wins",
                  "1/2-1/2": "Draw",
                  "*": "error",
                }[(props.status! as GameOverStatus).payload!.result]
              }{" "}
              by {(props.status! as GameOverStatus).payload!.method}
            </p>
          </Match>
          <Match
            when={
              props.activePlayer && props.status!.type === "resignConfirmation"
            }
          >
            <p>Are you sure you want to resign?</p>
            <div class={props.styles.btn_ctn}>
              <FlatBtn
                icon={<CloseIcon />}
                size="small"
                onClick={props.resetStatus}
              />
              <FlatBtn
                icon={<CheckIcon />}
                size="small"
                onClick={() => {
                  try {
                    if (!props.activePlayer) return;
                    resign(gameId!, props.activePlayer);
                  } catch (err) {
                    console.log(err);
                  }
                }}
              />
            </div>
          </Match>
          <Match
            when={props.activePlayer && props.status!.type === "claimDraw"}
          >
            <p>Claim draw?</p>
            <div class={props.styles.btn_ctn}>
              <FlatBtn
                icon={<CloseIcon />}
                size="small"
                onClick={() => {
                  try {
                    denyDraw(gameId!);
                  } catch (err) {
                    console.log(err);
                  }
                }}
              />
              <FlatBtn
                icon={<CheckIcon />}
                size="small"
                onClick={() => {
                  try {
                    claimDraw(gameId!);
                  } catch (err) {
                    console.log(err);
                  }
                }}
              />
            </div>
          </Match>
          <Match
            when={props.activePlayer && props.status!.type === "offeredDraw"}
          >
            <p>You have offered a draw</p>
          </Match>
          <Match when={props.status!.type === "offerDrawConfirmation"}>
            <p>Are you sure you want to offer a draw?</p>
            <div class={props.styles.btn_ctn}>
              <FlatBtn
                icon={<CloseIcon />}
                size="small"
                onClick={props.resetStatus}
              />
              <FlatBtn
                icon={<CheckIcon />}
                size="small"
                onClick={() => {
                  try {
                    if (!props.activePlayer) return;
                    offerDraw(gameId!, props.activePlayer);
                  } catch (err) {
                    console.log(err);
                  }
                }}
              />
            </div>
          </Match>
        </Switch>
      </div>
    </div>
  );
}
