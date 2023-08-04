import { UserContext } from "../../../utils/contexts/UserContext";
import styles from "../../../styles/Home/GameDoor.module.scss";
import { Index, useContext } from "solid-js";
import { fromMillisecondsToMinutes } from "../../../utils/time";
import { GameSeek } from "../../../types/types";
import { createGame } from "../../../utils/game";

type GameDoorProps = {
  gameSeek: GameSeek;
};

export default function GameDoor(props: GameDoorProps) {
  const { user, socket } = useContext(UserContext) || {
    user: "user",
    socket: null,
  };

  const rootClasses = [
    styles.main,
    "foreground",
    "hover-highlight",
    "space-evenly",
  ];
  if (props.gameSeek.seeker === user) rootClasses.push(styles.my_seek);

  return (
    <div
      class={rootClasses.join(" ")}
      onClick={(e) => {
        e.stopPropagation();
        try {
          if (!user) return;
          createGame(socket!, user, props.gameSeek);
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
