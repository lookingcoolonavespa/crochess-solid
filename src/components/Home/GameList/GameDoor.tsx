import styles from "../../../styles/Home/GameDoor.module.scss";
import { fromMillisecondsToMinutes } from "../../../utils/time";
import { GameSeek } from "../../../types/types";
import { createGame } from "../../../utils/game";
import { user, socket } from "../../../globalState";

type GameDoorProps = {
  gameSeek: GameSeek;
};

export default function GameDoor(props: GameDoorProps) {
  const rootClasses = () => {
    let rootClasses = [
      styles.main,
      "foreground",
      "hover-highlight",
      "space-evenly",
    ];
    if (props.gameSeek.seeker === user()) rootClasses.push(styles.my_seek);
    return rootClasses;
  };

  return (
    <div
      class={rootClasses().join(" ")}
      onClick={(e) => {
        e.stopPropagation();
        try {
          createGame(props.gameSeek);
        } catch (err) {
          console.log(err);
        }
      }}
    >
      {[
        props.gameSeek.color,
        `${fromMillisecondsToMinutes(props.gameSeek.time)}+${
          props.gameSeek.increment
        }`,
        props.gameSeek.gameType,
      ].map((t) => (
        <p class="text-center">{t}</p>
      ))}
    </div>
  );
}
