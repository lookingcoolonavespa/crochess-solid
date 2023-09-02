import { FlagIcon } from "../../icons/FlagIcon";
import { Controls, createControlBtnObj } from "./Controls";

type GameStatusControlsProps = {
  offerDraw: () => void;
  resign: () => void;
  offeredDraw: boolean;
};

export function GameStatusControls(props: GameStatusControlsProps) {
  const mainControls = [
    createControlBtnObj(
      undefined,
      "offer a draw",
      "1/2",
      props.offerDraw,
      props.offeredDraw ? "background-action-secondary no_events" : ""
    ),
    createControlBtnObj(<FlagIcon />, "resign game", undefined, props.resign),
  ];
  return <Controls className="game_status_controls" list={mainControls} />;
}
