import { socket } from "../../globalState";
import styles from "../../styles/Game/Game.module.scss";
import { useParams } from "@solidjs/router";
import { batch, createEffect, createSignal, onCleanup } from "solid-js";
import { createStore, unwrap } from "solid-js/store";
import {
  Colors,
  DrawRecord,
  HistoryArr,
  MoveNotation,
  Option,
  Square,
} from "../../types/types";
import { ClientGameInterface as GameInterface } from "rust_engine";
import {
  GameOverDetails,
  GameOverGameState,
  GameSchema,
  GameStateSchema,
  TimeDetails,
} from "../../types/interfaces";
import { getActivePlayer } from "../../utils/game";
import { OPP_COLOR } from "../../constants";
import { Gameboard } from "./Gameboard";
import Interface from "./Interface/Interface";

function getBoardStates(moves: MoveNotation[]): string[] {
  let game = GameInterface.from_history("");

  let movesIteratedOver = "";
  return moves.length === 0
    ? [game.to_string()]
    : moves.map((move) => {
        movesIteratedOver += move;
        game.make_move(move);
        return game.to_string();
      });
}

type GameState = {
  activeColor: Colors;
  history: HistoryArr;
  moves: string[];
  drawRecord: Record<Colors, boolean>;
  gameOverDetails: GameOverDetails;
};
let defaultGameState: GameState = {
  activeColor: "white",
  history: [] as HistoryArr,
  moves: [] as string[],
  drawRecord: { white: false, black: false },
  gameOverDetails: {
    result: null,
    winner: null,
  },
};

let defaultTimeDetails: Record<Colors, TimeDetails> = {
  white: {
    time: null,
    timeLeftAtTurnStart: null,
    stampAtTurnStart: null,
  },
  black: {
    time: null,
    timeLeftAtTurnStart: null,
    stampAtTurnStart: null,
  },
};

function parseHistory(history: string): HistoryArr {
  return history === ""
    ? []
    : history.split(" ").reduce(function parseIntoPairs(acc, curr, i) {
        if (i % 2 === 0) {
          acc.push([curr as MoveNotation, ""]);
        } else acc[acc.length - 1][1] = curr as MoveNotation;

        return acc;
      }, [] as HistoryArr);
}

export function Game() {
  const [gameboardView, setGameboardView] = createSignal<Colors>("white");
  const [boardBeingViewed, setBoardBeingViewed] =
    createSignal<Option<number>>(null);
  const [squareToMove, setSquareToMove] = createSignal<Square | null>(null);

  const [gameState, setGameState] = createStore(defaultGameState);
  const [timeDetails, setTimeDetails] = createStore(defaultTimeDetails);
  let maxTime: number | undefined;

  const { id: gameId } = useParams();
  let activePlayerRef: Option<Colors> = null;
  function activePlayer() {
    return activePlayerRef;
  }

  let board: GameInterface = GameInterface.from_history("");
  let boardStates: string[] = [];

  createEffect(function onFirstLoad() {
    if (!socket) return;
    socket()?.unsubscribe("/topic/api/gameseeks");
  });

  createEffect(function subscribeToGame() {
    if (!socket) return;
    const outputSubscription = socket()?.subscribe(
      // this subscription allows the client to send messages to the server
      `/app/api/game/${gameId}`,
      () => {}
    );
    const inputSubscription = socket()?.subscribe(
      // this subscription allows the client to receive messages from the server
      `/topic/api/game/${gameId}`,
      (message) => {
        interface Init {
          event: "init";
          payload: GameSchema;
        }
        interface UpdateOnGameOver {
          event: "game over";
          payload: GameOverGameState;
        }
        interface UpdateOnMove {
          event: "update";
          payload: GameStateSchema;
        }
        interface UpdateDraw {
          event: "update draw";
          payload: DrawRecord;
        }
        type Message = Init | UpdateOnMove | UpdateOnGameOver | UpdateDraw;
        const data = JSON.parse(message.body) as Message;
        switch (data.event) {
          case "init": {
            const game: GameSchema = JSON.parse(message.body).payload;
            board = GameInterface.from_history(game.moves || "");
            let activeColor = board.active_side() as Colors;

            let tmpTimeDetails = unwrap(timeDetails);
            if (!game.result) {
              tmpTimeDetails[activeColor] = {
                time: tmpTimeDetails[activeColor].time as number,
                timeLeftAtTurnStart: timeDetails[activeColor].time as number,
                stampAtTurnStart: game.time_stamp_at_turn_start || Date.now(),
              };
            }
            maxTime = game.time;
            activePlayerRef = getActivePlayer(gameId!, game.w_id, game.b_id);
            const history = game.history?.split(" ");

            let activeColorTime =
              activeColor === "white" ? game.w_time : game.b_time;
            let inactiveColorTime =
              activeColor === "white" ? game.b_time : game.w_time;
            // if fetch happens in middle of game
            const elapsedTime = Date.now() - game.time_stamp_at_turn_start;
            let timeLeft = activeColorTime - elapsedTime;
            if (timeLeft < 0) timeLeft = 0;

            tmpTimeDetails[activeColor].time = timeLeft;
            tmpTimeDetails[OPP_COLOR[activeColor]].time = inactiveColorTime;

            let moves = (game.moves || "").split(" ") as MoveNotation[];
            boardStates = getBoardStates(moves);

            batch(() => {
              setBoardBeingViewed(history ? history.length - 1 : 0);
              setGameboardView(() => activePlayer() || "white");
              setTimeDetails(tmpTimeDetails);
              setGameState({
                activeColor,
                moves,
                history: parseHistory(game.history || ""),
                drawRecord: game.drawRecord,
                gameOverDetails: {
                  winner: game.winner,
                  result: game.result,
                },
              });
            });
            break;
          }
          case "game over":
          case "update": {
            const game = data.payload;
            game.moves = game.moves || "";
            let activeColor = board.active_side() as Colors;

            let tmpTimeDetails = unwrap(timeDetails);

            const history = parseHistory(game.history || "");
            let moves = game.moves.split(" ");
            board.make_move(moves[moves.length - 1]);
            boardStates.push(board.to_string());
            console.log(boardStates);

            let activeColorTime =
              activeColor === "white" ? game.w_time : game.b_time;
            let inactiveColorTime =
              activeColor === "white" ? game.b_time : game.w_time;
            // if fetch happens in middle of game
            const elapsedTime = Date.now() - game.time_stamp_at_turn_start;
            let timeLeft = activeColorTime - elapsedTime;
            if (timeLeft < 0) timeLeft = 0;

            tmpTimeDetails[activeColor].time = timeLeft;
            tmpTimeDetails[OPP_COLOR[activeColor]].time = inactiveColorTime;

            let newGameState: Partial<GameState> = {};
            if (data.event === "game over") {
              const gs = data.payload;
              newGameState = {
                activeColor,
                moves,
                history,
                gameOverDetails: {
                  winner: gs.winner,
                  result: gs.result,
                },
              };
            } else {
              newGameState = {
                activeColor,
                moves,
                history,
              };
            }

            batch(() => {
              setBoardBeingViewed((prev) => {
                if (prev === moves.length - 2) return moves.length - 1;
                else return prev;
              });
              setTimeDetails(tmpTimeDetails);
              setGameState(newGameState);
            });

            break;
          }

          case "update draw": {
            setGameState({ drawRecord: data.payload });
          }
        }
      }
    );

    onCleanup(() => {
      outputSubscription?.unsubscribe();
      inputSubscription?.unsubscribe();
    });
  });

  function updateTime(color: Colors, time: number) {
    setTimeDetails(color, "time", time);
  }

  const flipBoard = () => {
    setGameboardView((prev) => {
      return OPP_COLOR[prev];
    });
  };

  const moveListControls = {
    goBackToStart: () => {
      if (!gameState.moves.length) return;
      setBoardBeingViewed(0);
    },
    goBackOneMove: () => {
      if (!gameState.moves.length) return;
      setBoardBeingViewed((prev) => {
        if (prev === null) return prev;
        if (prev === 0) return prev;
        return prev - 1;
      });
    },
    goForwardOneMove: () => {
      if (!gameState.moves.length) return;
      setBoardBeingViewed((prev) => {
        if (prev === null) return prev;
        if (prev === gameState.moves.length - 1) return prev;
        return prev + 1;
      });
    },
    goToCurrentMove: () => {
      if (!gameState.moves.length) return;
      setBoardBeingViewed(gameState.moves.length - 1);
    },
  };

  function validateMove(to: number): boolean {
    let from = squareToMove();
    if (from === null) return false;
    return board.validate_move.call(
      board,
      from,
      to,
      gameState.activeColor === "white"
    );
  }

  function currentBoard() {
    return boardStates[boardBeingViewed() || 0]?.split("");
  }

  return (
    <main class={styles.main}>
      <div class={styles["game-contents"]}>
        <Gameboard
          view={gameboardView()}
          board={currentBoard()}
          squareToMove={squareToMove()}
          setSquareToMove={setSquareToMove}
          getLegalMoves={board.legal_moves_at_sq.bind(board)}
          validateMove={validateMove}
          activePlayer={activePlayer}
        />
        <Interface
          activePlayer={activePlayer()}
          claimDraw={!!activePlayer() && gameState.drawRecord[activePlayer()!]}
          offeredDraw={
            !!activePlayer() &&
            !gameState.drawRecord[activePlayer()!] &&
            gameState.drawRecord[OPP_COLOR[activePlayer()!]]
          }
          gameOverDetails={gameState.gameOverDetails}
          whiteDetails={{
            time: timeDetails.white.time,
            timeLeftAtTurnStart: timeDetails.white.timeLeftAtTurnStart,
            stampAtTurnStart: timeDetails.white.stampAtTurnStart,
            maxTime: maxTime as number,
            setTime: (time: number) => updateTime("white", time),
            active:
              !gameState.gameOverDetails.result &&
              gameState.activeColor === "white",
          }}
          blackDetails={{
            time: timeDetails.black.time,
            timeLeftAtTurnStart: timeDetails.black.timeLeftAtTurnStart,
            stampAtTurnStart: timeDetails.black.stampAtTurnStart,
            maxTime: maxTime as number,
            setTime: (time: number) => updateTime("black", time),
            active:
              !gameState.gameOverDetails.result &&
              gameState.activeColor === "black",
          }}
          history={gameState.history}
          historyControls={moveListControls}
          view={gameboardView()}
          flipBoard={flipBoard}
        />
      </div>
    </main>
  );
}
