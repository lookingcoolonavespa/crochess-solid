import styles from "../../styles/Game/Piece.module.scss";
import KingB from "../../icons/chess_pieces/king-b.svg";
import QueenB from "../../icons/chess_pieces/queen-b.svg";
import RookB from "../../icons/chess_pieces/rook-b.svg";
import BishopB from "../../icons/chess_pieces/bishop-b.svg";
import KnightB from "../../icons/chess_pieces/knight-b.svg";
import PawnB from "../../icons/chess_pieces/pawn-b.svg";
import KingW from "../../icons/chess_pieces/king-w.svg";
import QueenW from "../../icons/chess_pieces/queen-w.svg";
import RookW from "../../icons/chess_pieces/rook-w.svg";
import BishopW from "../../icons/chess_pieces/bishop-w.svg";
import KnightW from "../../icons/chess_pieces/knight-w.svg";
import PawnW from "../../icons/chess_pieces/pawn-w.svg";
import { Colors, PieceType } from "../../types/types";

const piecesSVG = {
  white: {
    k: KingW,
    q: QueenW,
    r: RookW,
    b: BishopW,
    n: KnightW,
    p: PawnW,
  },
  black: {
    k: KingB,
    q: QueenB,
    r: RookB,
    b: BishopB,
    n: KnightB,
    p: PawnB,
  },
};

interface PieceProps {
  type: PieceType;
  color: Colors;
  square?: string;
  onClick?: () => void;
}

export default function Piece(props: PieceProps) {
  return (
    <div
      class={`${styles.main} ${styles[props.type]} ${styles[props.color]}`}
      style={{ "grid-area": props.square }}
      onClick={props.onClick}
    >
      <img
        src={piecesSVG[props.color][props.type]}
        alt={`${props.type} ${props.color}`}
      />
    </div>
  );
}
