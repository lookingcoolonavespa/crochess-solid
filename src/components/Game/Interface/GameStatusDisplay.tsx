import { useParams } from "@solidjs/router";
import { Match, Setter, Show, Switch } from "solid-js";
import { Colors, InterfaceStatus, Option } from "../../../types/types";
import { claimDraw, denyDraw, offerDraw, resign } from "../../../utils/game";
import { CheckIcon } from "../../icons/CheckIcon";
import { CloseIcon } from "../../icons/CloseIcon";
import { FlatBtn } from "../../ui-elements/buttons/FlatBtn";
import { IconBtn } from "../../ui-elements/buttons/IconBtn";

interface GameStatusDisplayProps {
  styles: { [key: string]: string };
  setStatus: Setter<Option<InterfaceStatus>>;
  resetStatus: () => void;
  status: Option<InterfaceStatus>;
  activePlayer: Colors;
}

export default function GameStatusDisplay(props: GameStatusDisplayProps) {
  const { id: gameId } = useParams();

  return (
    <Show when={props.status}>
      <div class={props.styles.game_over_display}>
        <IconBtn
          className="close-btn"
          icon={<CloseIcon />}
          altText="hide game over message"
          onClick={() => props.setStatus(null)}
        />
        <div class="status_display">
          <Switch>
            <Match when={props.status?.type === "gameOver"}>
              <Show when={props.status && "payload" in props.status}>
                <p>Game over</p>
                <Show
                  when={(props.status! as any).payload!.winner != null}
                  fallback={<p>Game is a draw</p>}
                >
                  <p>
                    {(props.status! as any).payload!.winner === "white"
                      ? "White "
                      : "Black "}
                    won by {(props.status! as any).payload!.result}
                  </p>
                </Show>
              </Show>
            </Match>
            <Match when={props.status!.type === "resignConfirmation"}>
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
                      resign(gameId!, props.activePlayer);
                    } catch (err) {
                      console.log(err);
                    }
                  }}
                />
              </div>
            </Match>
            <Match when={props.status!.type === "claimDraw"}>
              <p>Claim draw?</p>
              <div class={props.styles.btn_ctn}>
                <FlatBtn
                  icon={<CloseIcon />}
                  size="small"
                  onClick={() => {
                    try {
                      denyDraw(gameId!);
                      props.resetStatus();
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
            <Match when={props.status!.type === "offeredDraw"}>
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
    </Show>
  );
}
