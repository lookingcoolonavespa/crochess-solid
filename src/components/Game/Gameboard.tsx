import styles from "../../styles/Game/Gameboard.module.scss";
import { createSignal, For, Setter, Show } from "solid-js";
import {
  Board,
  Colors,
  PieceType,
  PromotePieceType,
  Square,
} from "../../types/types";
import Piece from "./Piece";
import { FILES, PIECE_TYPES, RANKS } from "../../constants";
import { ClientGameInterface } from "rust_engine";
import Promotion from "./Promotion";

const H1 = 7;
const A8 = 56;
const FILE_BITS = 7;

type GameboardProps = {
  view: Colors;
  board: Board;
  makeMove: (move_notation: string) => void;
  squareToMove: Square | null;
  setSquareToMove: Setter<Square | null>;
  getLegalMoves: (square: Square) => Uint32Array;
  activePlayer: Colors | null;
  validateMove: (to: number) => boolean;
};

export function Gameboard(props: GameboardProps) {
  const [highlightedSquares, setHighlightedSquares] = createSignal<Uint32Array>(
    new Uint32Array()
  );
  const [promotePopupSquare, setPromotePopupSquare] =
    createSignal<Square | null>(null);

  function resetSquareToMove() {
    props.setSquareToMove(null);
    setHighlightedSquares(new Uint32Array());
  }

  const squares = Array(64)
    .fill(0)
    .map((_, i) => i)
    .map((s, i) => {
      // board needs to be flipped for black
      const evenFile = i % 2 != 0;
      const evenRank = Math.floor(i / 8) % 2 != 0;
      const startRank = props.view === "white" ? i <= H1 : i >= A8;
      const startFile = (i & FILE_BITS) === 0;

      const classNames = [styles.boardSquare];
      if (evenRank) classNames.push(styles["rank-even"]);
      else classNames.push(styles["rank-odd"]);
      if (evenFile) classNames.push(styles["file-even"]);
      else classNames.push(styles["file-odd"]);
      if (highlightedSquares().includes(s)) classNames.push(styles.active);

      return (
        <div
          class={classNames.join(" ")}
          style={{
            "grid-area": ClientGameInterface.name_of_square(s),
          }}
          onClick={() => onMakeMove(s, undefined)}
        >
          {startRank && (
            <div class={`${styles.file} label`}>
              {FILES[ClientGameInterface.file_of_square(s)]}
            </div>
          )}
          {startFile && (
            <div class={`${styles.rank} label`}>
              {RANKS[ClientGameInterface.rank_of_square(s)]}
            </div>
          )}
          {promotePopupSquare() === s && (
            <Promotion
              onPromote={(e) => {
                e.stopPropagation();
                const pieceSelectNode = e.currentTarget as HTMLElement;

                setPromotePopupSquare(null);
                onMakeMove(
                  promotePopupSquare() as Square,
                  pieceSelectNode.dataset.piece as PromotePieceType
                );
              }}
              square={promotePopupSquare() as number}
              view={props.view}
            />
          )}
        </div>
      );
    });
  function onMakeMove(to: number, promotePiece: string | undefined) {
    if (!props.squareToMove) return;
    let moveNotation = ClientGameInterface.make_move_notation(
      props.squareToMove,
      to,
      promotePiece
    );
    props.makeMove(moveNotation);
    resetSquareToMove();
  }

  return (
    <div class={`${styles.main} ${styles[props.view]}`}>
      {squares}
      <Show when={props.board}>
        <For each={props.board} fallback={[]}>
          {(char, i) => {
            if (char === ".") return;
            let isLowercase = char.toLowerCase() == char;
            char = char.toLowerCase();
            if (PIECE_TYPES.find((piece) => piece === char) === undefined)
              throw new Error(
                `encountered invalid piece (${char}) on the board.\nboard: ${props.board}\n`
              );

            let square = i();
            let colorOfPiece: Colors = isLowercase ? "black" : "white";

            return (
              <Piece
                color={colorOfPiece}
                square={ClientGameInterface.name_of_square(square)}
                type={char.toLowerCase() as PieceType}
                onClick={() => {
                  if (promotePopupSquare()) return;
                  if (
                    props.activePlayer !== null &&
                    colorOfPiece !== props.activePlayer
                  ) {
                    // if player is not spectator and piece doesnt belong to active player
                    if (!props.squareToMove) return;

                    const pawn = "p";
                    const onPromotionRank =
                      (colorOfPiece === "white" &&
                        ClientGameInterface.rank_of_square(square) === 7) ||
                      (colorOfPiece === "black" &&
                        ClientGameInterface.rank_of_square(square) === 0);
                    let isPromote =
                      char.toLowerCase() === pawn && onPromotionRank;

                    if (props.validateMove(square) && isPromote)
                      return setPromotePopupSquare(square);

                    onMakeMove(square, undefined);
                    return;
                  }

                  if (square === props.squareToMove) {
                    resetSquareToMove();
                  } else {
                    // display legal moves
                    props.setSquareToMove(square);
                    setHighlightedSquares(props.getLegalMoves(square) || []);
                  }
                }}
              />
            );
          }}
        </For>
      </Show>
    </div>
  );
}
