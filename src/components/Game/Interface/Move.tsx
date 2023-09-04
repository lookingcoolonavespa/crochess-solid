import { Accessor } from "solid-js";
import { on } from "solid-js";
import { createEffect } from "solid-js";

type MoveProps = {
  moveIsBeingViewed: Accessor<boolean>;
  move: string;
  styles: CSSModuleClasses;
};
export function Move(props: MoveProps) {
  let ref: HTMLParagraphElement;

  createEffect(
    on(props.moveIsBeingViewed, () => {
      if (props.moveIsBeingViewed())
        ref.scrollIntoView({
          behavior: "auto",
          block: "end",
          inline: "center",
        });
    })
  );

  return (
    <p
      ref={ref!}
      classList={{
        [props.styles.active_move]: props.moveIsBeingViewed(),
      }}
    >
      {props.move}
    </p>
  );
}
