import { useParams } from "@solidjs/router";
import { Match, Setter, Show, Switch } from "solid-js";
import { GameStatusInterface } from "../../../types/interfaces";
import { Colors } from "../../../types/types";
import { claimDraw, denyDraw, offerDraw, resign } from "../../../utils/game";
import { CheckIcon } from "../../icons/CheckIcon";
import { CloseIcon } from "../../icons/CloseIcon";
import { FlatBtn } from "../../ui-elements/buttons/FlatBtn";
import { IconBtn } from "../../ui-elements/buttons/IconBtn";
import { socket } from "../../../globalState";

interface GameStatusDisplayProps {
  styles: { [key: string]: string };
  setStatus: Setter<GameStatusInterface | undefined>;
  status: GameStatusInterface | undefined;
  activePlayer: Colors;
}

export default function GameStatusDisplay(props: GameStatusDisplayProps) {
  const { id: gameId } = useParams();

  return (
    <div class={props.styles.game_over_display}>
      <IconBtn
        className="close-btn"
        icon={<CloseIcon />}
        altText="hide game over message"
        onClick={props.status?.close || (() => props.setStatus(undefined))}
      />
      <div>
        <Show when={props.status}>
          <Switch>
            <Match when={props.status?.type === "gameOver"}>
              <Show when={props.status?.payload}>
                <p>Game over</p>
                <Show
                  when={props.status!.payload!.winner != null}
                  fallback={<p>Game is a draw</p>}
                >
                  <p>
                    {props.status!.payload!.winner === "white"
                      ? "White "
                      : "Black "}
                    won by {props.status!.payload!.result}
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
                  onClick={props.status!.close}
                />
                <FlatBtn
                  icon={<CheckIcon />}
                  size="small"
                  onClick={() => {
                    try {
                      if (!socket) return;
                      let socketClient = socket();
                      if (!socketClient) return;
                      resign(socketClient, gameId!, props.activePlayer);
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
                      if (!socket) return;
                      let socketClient = socket();
                      if (!socketClient) return;
                      denyDraw(socketClient, gameId!);
                      props.setStatus(undefined);
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
                      if (!socket) return;
                      let socketClient = socket();
                      if (!socketClient) return;
                      claimDraw(socketClient, gameId!);
                    } catch (err) {
                      console.log(err);
                    }
                  }}
                />
              </div>
            </Match>
            <Match when={props.status!.type === "offeredDraw"}>
              <p>You have offered a draw</p>,
            </Match>
            <Match when={props.status!.type === "offerDrawConfirmation"}>
              <p>Are you sure you want to offer a draw?</p>
              <div class={props.styles.btn_ctn}>
                <FlatBtn
                  icon={<CloseIcon />}
                  size="small"
                  onClick={props.status!.close}
                />
                <FlatBtn
                  icon={<CheckIcon />}
                  size="small"
                  onClick={() => {
                    try {
                      if (!socket) return;
                      let socketClient = socket();
                      if (!socketClient) return;
                      offerDraw(socketClient, gameId!, props.activePlayer);
                    } catch (err) {
                      console.log(err);
                    }
                  }}
                />
              </div>
            </Match>
          </Switch>
        </Show>
      </div>
    </div>
  );
}
