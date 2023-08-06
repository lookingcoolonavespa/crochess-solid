import Piece from "./Piece";
import styles from "../../styles/Game/Promotion.module.scss";
import { Colors, PromotePieceType, Square } from "../../types/types";
import { ClientGameInterface } from "rust_engine";
import { JSX } from "solid-js";

interface PromotionProps {
  onPromote: JSX.EventHandler<HTMLDivElement, MouseEvent>;
  square: Square;
  view: Colors;
}

const WHITE_PROMOTION_RANK = 7;

export default function Promotion({ onPromote, square, view }: PromotionProps) {
  const promotePieces: PromotePieceType[] = ["q", "r", "n", "b"];
  const color: Colors =
    ClientGameInterface.rank_of_square(square) == WHITE_PROMOTION_RANK
      ? "white"
      : "black";
  const positioning: {
    left?: string;
    right?: string;
    top?: string;
    bottom?: string;
  } = view === "white" ? { left: "100%" } : { right: "100%" };
  if (color === "white") {
    if (view === "black") positioning.bottom = "0";
  } else {
    if (view === "white") positioning.bottom = "0";
  }
  return (
    <div class={styles.main} style={positioning}>
      {promotePieces.map((p, i) => {
        return (
          <div
            class={styles["piece-wrapper"] + " hover-highlight"}
            onClick={onPromote}
            data-piece={p}
          >
            <Piece color={color} type={p} />
          </div>
        );
      })}
    </div>
  );
}
