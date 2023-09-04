import { socket } from "../../globalState";
import styles from "../../styles/Game/Game.module.scss";
import { useParams } from "@solidjs/router";
import {
  batch,
  createEffect,
  createSignal,
  onCleanup,
  Setter,
  Show,
} from "solid-js";
import { createStore, SetStoreFunction } from "solid-js/store";
import {
  Board,
  Colors,
  ColorsBackend,
  DrawRecordBackend,
  GameState,
  HistoryArr,
  InterfaceStatus,
  Message,
  MoveNotation,
  Option,
  Square,
  UpdateOnGameOver,
  UpdateOnMove,
} from "../../types/types";
import { ClientGameInterface as GameInterface } from "rust_engine";
import { GameSchema, TimeDetails } from "../../types/interfaces";
import { getActivePlayer } from "../../utils/game";
import { COLORS_FROM_CHAR, OPP_COLOR } from "../../constants";
import { Gameboard } from "./Gameboard";
import { History } from "./Interface/History";
import Interface from "./Interface/Interface";
import { useScreenSize } from "../../hooks/useScreenSize";

let defaultGameState: GameState = {
  active: false,
  activeColor: "white",
  history: [] as HistoryArr,
  moves: [] as string[],
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

export function Game() {
  const [gameboardView, setGameboardView] = createSignal<Colors>("white");
  const [squareToMove, setSquareToMove] = createSignal<Square | null>(null);
  const { smallerThanTablet } = useScreenSize();

  const [gameState, setGameState] = createStore(defaultGameState);
  const {
    currentBoard,
    moveListControls,
    setBoardStates,
    setBoardBeingViewed,
  } = useBoardBeingViewed(gameState);
  const {
    offerDraw,
    resign,
    interfaceStatus,
    resetStatus,
    setInterfaceStatus,
  } = useInterfaceStatus();
  const [timeDetails, setTimeDetails] = createStore(defaultTimeDetails);
  let maxTime: number | undefined;

  const { id: gameId } = useParams();
  const [activePlayer, setActivePlayer] = createSignal<Option<Colors>>(null);

  let board: GameInterface = GameInterface.from_history("");

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
        const data = JSON.parse(message.body) as Message;
        switch (data.event) {
          case "init": {
            const state = initState(
              JSON.parse(message.body).payload,
              gameId!,
              timeDetails,
              setTimeDetails,
              setActivePlayer,
              setBoardBeingViewed,
              setGameState,
              setInterfaceStatus,
              setGameboardView,
              setBoardStates
            );

            board = state.board;
            maxTime = state.maxTime;
            break;
          }

          case "game over":
          case "update": {
            onGameUpdate(
              data,
              board,
              gameState.moves.length,
              timeDetails,
              setTimeDetails,
              setBoardBeingViewed,
              setGameState,
              setInterfaceStatus,
              setBoardStates
            );
            break;
          }

          case "update draw": {
            onUpdateDraw(data.payload, activePlayer(), setInterfaceStatus);
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

  function validateMove(to: number): boolean {
    let from = squareToMove();
    if (from === null) return false;
    const validity = board.validate_move.call(
      board,
      from,
      to,
      gameState.activeColor === "white"
    );

    return validity;
  }

  return (
    <main class={styles.main}>
      <div class={styles["game-contents"]}>
        <Show
          when={!smallerThanTablet()}
          fallback={
            <>
              <History
                moveList={gameState.history}
                controls={moveListControls}
                flipBoard={flipBoard}
                boardBeingViewed={boardBeingViewed()}
              />
              <Gameboard
                view={gameboardView()}
                board={currentBoard()}
                squareToMove={squareToMove()}
                setSquareToMove={setSquareToMove}
                getLegalMoves={board.legal_moves_at_sq.bind(board)}
                validateMove={validateMove}
                activePlayer={activePlayer}
              />
            </>
          }
        >
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
            gameActive={gameState.active}
            status={interfaceStatus()}
            setStatus={setInterfaceStatus}
            resign={resign}
            offerDraw={offerDraw}
            resetStatus={resetStatus}
            activePlayer={activePlayer()}
            whiteDetails={{
              time: timeDetails.white.time,
              timeLeftAtTurnStart: timeDetails.white.timeLeftAtTurnStart,
              stampAtTurnStart: timeDetails.white.stampAtTurnStart,
              maxTime: maxTime as number,
              setTime: (time: number) => updateTime("white", time),
              active: gameState.active && gameState.activeColor === "white",
            }}
            blackDetails={{
              time: timeDetails.black.time,
              timeLeftAtTurnStart: timeDetails.black.timeLeftAtTurnStart,
              stampAtTurnStart: timeDetails.black.stampAtTurnStart,
              maxTime: maxTime as number,
              setTime: (time: number) => updateTime("black", time),
              active: gameState.active && gameState.activeColor === "black",
            }}
            history={gameState.history}
            historyControls={moveListControls}
            view={gameboardView()}
            flipBoard={flipBoard}
          />
        </Show>
      </div>
    </main>
  );
}

function getBoardStates(moves: MoveNotation[]): string[] {
  let game = GameInterface.from_history("");

  return [
    game.to_string(),
    ...moves.map((move) => {
      game.make_move(move);
      return game.to_string();
    }),
  ];
}

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

function useInterfaceStatus() {
  const [interfaceStatus, setInterfaceStatus] =
    createSignal<Option<InterfaceStatus>>(null);

  function resetStatus() {
    setInterfaceStatus(null);
  }

  function resign() {
    setInterfaceStatus({
      type: "resignConfirmation",
    });
  }

  function offerDraw() {
    setInterfaceStatus({
      type: "offerDrawConfirmation",
    });
  }
  return {
    resetStatus,
    offerDraw,
    resign,
    interfaceStatus,
    setInterfaceStatus,
  };
}

function useBoardBeingViewed(gameState: GameState) {
  const [boardBeingViewed, setBoardBeingViewed] =
    createSignal<Option<number>>(null);
  const [boardStates, setBoardStates] = createSignal<string[]>([]);

  // storing the board in boardArr so currentBoard returns the same array but just with the contents changed
  let boardArr: Option<Board> = null;
  function currentBoard(): Board {
    let boardIdx = boardBeingViewed();
    if (Array.isArray(boardArr)) {
      boardArr.splice(
        0,
        64,
        ...(boardStates()[boardIdx || 0]?.split("") as Board)
      );
    } else {
      boardArr = boardStates()[boardIdx || 0]?.split("") as Board;
    }
    return boardArr;
  }

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

  return {
    boardBeingViewed,
    currentBoard,
    moveListControls,
    setBoardStates,
    setBoardBeingViewed,
  };
}

function initState(
  game: GameSchema,
  gameId: string,
  timeDetails: Record<Colors, TimeDetails>,
  setTimeDetails: SetStoreFunction<Record<Colors, TimeDetails>>,
  setActivePlayer: Setter<Option<Colors>>,
  setBoardBeingViewed: Setter<number>,
  setGameState: Setter<GameState>,
  setInterfaceStatus: Setter<InterfaceStatus>,
  setGameboardView: Setter<Colors>,
  setBoardStates: Setter<string[]>
): { board: GameInterface; maxTime: number } {
  let board = GameInterface.from_history(game.moves || "");
  let activeColor = board.active_side() as Colors;

  let tmpTimeDetails = {
    white: { ...timeDetails.white },
    black: { ...timeDetails.black },
  };

  if (!game.result) {
    tmpTimeDetails[activeColor] = {
      time: tmpTimeDetails[activeColor].time as number,
      timeLeftAtTurnStart: timeDetails[activeColor].time as number,
      stampAtTurnStart: game.time_stamp_at_turn_start || Date.now(),
    };
  }
  let activePlayer = getActivePlayer(gameId!, game.w_id, game.b_id);

  let activeColorTime = activeColor === "white" ? game.w_time : game.b_time;
  let inactiveColorTime = activeColor === "white" ? game.b_time : game.w_time;
  // if fetch happens in middle of game
  const elapsedTime =
    Date.now() - (game.time_stamp_at_turn_start || Date.now());
  let timeLeft = activeColorTime - elapsedTime;
  if (timeLeft < 0) timeLeft = 0;

  tmpTimeDetails[activeColor].time = timeLeft;
  tmpTimeDetails[activeColor].timeLeftAtTurnStart = timeLeft;
  tmpTimeDetails[OPP_COLOR[activeColor]].time = inactiveColorTime;

  let moves: MoveNotation[] = [];
  if (game.moves) {
    moves = game.moves.split(" ") as MoveNotation[];
  }

  batch(() => {
    setActivePlayer(activePlayer);
    let gameOverDetails = {
      winner: game.winner,
      result: game.result,
    };
    setBoardStates(getBoardStates(moves));
    setBoardBeingViewed(moves?.length || 0);
    setGameboardView(() => activePlayer || "white");
    setTimeDetails(tmpTimeDetails);
    setGameState({
      active: !game.result,
      activeColor,
      moves: moves,
      history: parseHistory(game.history || ""),
    });

    let isActivePlayerAndOfferedDraw =
      !!activePlayer &&
      !game.drawRecord[activePlayer!] &&
      game.drawRecord[OPP_COLOR[activePlayer!]];
    let isActivePlayerAndCanClaimDraw =
      !!activePlayer && game.drawRecord[activePlayer!];
    if (game.result) {
      setInterfaceStatus({
        close: undefined,
        type: "gameOver",
        payload: gameOverDetails,
      });
    } else if (isActivePlayerAndOfferedDraw) {
      setInterfaceStatus({
        type: "offeredDraw",
      });
    } else if (isActivePlayerAndCanClaimDraw) {
      setInterfaceStatus({ type: "claimDraw" });
    }
  });

  return { board, maxTime: game.time };
}
function onGameUpdate(
  data: UpdateOnGameOver | UpdateOnMove,
  board: GameInterface,
  movesSoFar: number,
  timeDetails: Record<Colors, TimeDetails>,
  setTimeDetails: SetStoreFunction<Record<Colors, TimeDetails>>,
  setBoardBeingViewed: Setter<number>,
  setGameState: Setter<GameState>,
  setInterfaceStatus: Setter<InterfaceStatus>,
  setBoardStates: Setter<string[]>
) {
  const game = data.payload;
  game.moves = game.moves || "";

  const history = parseHistory(game.history || "");
  let moves = game.moves.split(" ");
  if (moves.length != movesSoFar) board.make_move(moves[moves.length - 1]);

  let activeColor = board.active_side() as Colors;

  let activeColorTime = activeColor === "white" ? game.w_time : game.b_time;
  let inactiveColorTime = activeColor === "white" ? game.b_time : game.w_time;
  const elapsedTime =
    Date.now() - (game.time_stamp_at_turn_start || Date.now());
  let timeLeft = activeColorTime - elapsedTime;
  if (timeLeft < 0) timeLeft = 0;

  let tmpTimeDetails = {
    white: { ...timeDetails.white },
    black: { ...timeDetails.black },
  };
  tmpTimeDetails[activeColor].time = timeLeft;
  tmpTimeDetails[activeColor].timeLeftAtTurnStart = timeLeft;
  tmpTimeDetails[activeColor].stampAtTurnStart =
    game.time_stamp_at_turn_start || Date.now();
  tmpTimeDetails[OPP_COLOR[activeColor]].time = inactiveColorTime;

  batch(() => {
    setBoardBeingViewed((prev) => {
      if (prev === moves.length - 1) return prev + 1;
      else return prev;
    });
    setTimeDetails(tmpTimeDetails);
    setGameState({
      active: data.event != "game over",
      activeColor,
      moves,
      history,
    });
    setBoardStates((prev) => [...prev, board.to_string()]);

    if (data.event === "game over") {
      let winner = data.payload.winner
        ? COLORS_FROM_CHAR[data.payload.winner]
        : null;
      setInterfaceStatus({
        type: "gameOver",
        payload: {
          winner,
          result: data.payload.result,
        },
      });
    }
  });
}

function onUpdateDraw(
  drawRecord: DrawRecordBackend,
  activePlayer: Option<Colors>,
  setInterfaceStatus: Setter<InterfaceStatus>
) {
  let isActivePlayerAndOfferedDraw =
    !!activePlayer &&
    !drawRecord[activePlayer![0] as ColorsBackend] &&
    drawRecord[OPP_COLOR[activePlayer!][0] as ColorsBackend];
  let isActivePlayerAndCanClaimDraw =
    !!activePlayer && drawRecord[activePlayer![0] as ColorsBackend];
  if (isActivePlayerAndOfferedDraw) {
    setInterfaceStatus({
      type: "offeredDraw",
    });
  } else if (isActivePlayerAndCanClaimDraw) {
    setInterfaceStatus({ type: "claimDraw" });
  }
}
