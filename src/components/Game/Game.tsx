import { socket } from "../../globalState";
import styles from "../../styles/Game/Game.module.scss";
import { useParams } from "@solidjs/router";
import {
  batch,
  createEffect,
  createMemo,
  createSignal,
  onCleanup,
  Show,
} from "solid-js";
import { createStore } from "solid-js/store";
import {
  Board,
  Colors,
  DrawRecord,
  GameState,
  HistoryArr,
  InterfaceStatus,
  MoveNotation,
  Option,
  Square,
  TimeOutPayload,
  Tuple,
  UpdateOnGameOver,
  UpdateOnMove,
} from "../../types/types";
import { ClientGameInterface as GameInterface } from "rust_engine";
import {
  GameOverDetails,
  GameSchema,
  TimeDetails,
} from "../../types/interfaces";
import { OPP_COLOR } from "../../constants";
import { Gameboard } from "./Gameboard";
import { History } from "./Interface/History";
import Interface from "./Interface/Interface";
import { useScreenSize } from "../../hooks/useScreenSize";
import Timer from "./Interface/Timer";
import { getActivePlayer } from "../../utils/game/activePlayer";
import { makeEngineMove } from "../../utils/game/ingameActions";
import { GameStatusControls } from "./Interface/GameStatusControls";
import GameStatusDisplay from "./Interface/GameStatusDisplay";

let defaultGameState: GameState = {
  active: false,
  activeColor: "white",
  history: [] as HistoryArr,
  moves: [] as string[],
  playingAgainstEngine: false,
};

let defaultTimeDetails: Record<Colors, TimeDetails> & {
  maxTime: Option<number>;
} = {
  maxTime: null,
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
  let engine: {
    active: boolean;
    color: Option<Colors>;
  } = {
    active: false,
    color: null,
  };
  const [gameboardView, setGameboardView] = createSignal<Colors>("white");
  const [squareToMove, setSquareToMove] = createSignal<Square | null>(null);
  const { smallerThanDesktop } = useScreenSize();

  const [gameState, setGameState] = createStore(defaultGameState);
  const {
    boardStates,
    boardBeingViewed,
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

  const { id: gameId } = useParams();
  const [activePlayer, setActivePlayer] = createSignal<Option<Colors>>(null);

  let board: GameInterface = GameInterface.from_history("");

  createEffect(function subscribeToGame() {
    if (!socket) return;
    const subscription = socket()?.subscribe(`game/${gameId}`, (message) => {
      switch (message.event) {
        case "init": {
          initState(message.payload);
          break;
        }

        case "game over":
        case "make move": {
          const event = message.event;
          onGameUpdate(
            { event, payload: message.payload },
            gameState.moves.length,
          );
          break;
        }

        case "time out": {
          onTimeOut(message.payload);
          break;
        }

        case "update result": {
          onUpdateResult(message.payload);
          break;
        }

        case "update draw": {
          onUpdateDraw(
            {
              white: message.payload.white_draw_status,
              black: message.payload.black_draw_status,
            },
            activePlayer(),
          );
        }
      }
    });

    onCleanup(() => {
      subscription?.unsubscribe();
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
    return board.validate_move.call(
      board,
      from,
      to,
      gameState.activeColor === "white",
    );
  }

  function isPromotion(to: number): boolean {
    let from = squareToMove();
    if (from === null) return false;
    return board.is_promotion.call(board, from, to);
  }

  const whiteTimeDetails = () => ({
    time: timeDetails.white.time,
    timeLeftAtTurnStart: timeDetails.white.timeLeftAtTurnStart,
    stampAtTurnStart: timeDetails.white.stampAtTurnStart,
    maxTime: timeDetails.maxTime as number,
    setTime: (time: number) => updateTime("white", time),
    active: gameState.active && gameState.activeColor === "white",
  });

  const blackTimeDetails = () => ({
    time: timeDetails.black.time,
    timeLeftAtTurnStart: timeDetails.black.timeLeftAtTurnStart,
    stampAtTurnStart: timeDetails.black.stampAtTurnStart,
    maxTime: timeDetails.maxTime as number,
    setTime: (time: number) => updateTime("black", time),
    active: gameState.active && gameState.activeColor === "black",
  });

  const topTimer = createMemo(() =>
    gameboardView() === "white" ? blackTimeDetails() : whiteTimeDetails(),
  );

  const bottomTimer = createMemo(() =>
    gameboardView() === "white" ? whiteTimeDetails() : blackTimeDetails(),
  );

  return (
    <main class={styles.main}>
      <div class={styles["game-contents"]}>
        <Show
          when={!smallerThanDesktop()}
          fallback={
            <>
              <History
                moveList={gameState.history}
                controls={moveListControls}
                flipBoard={flipBoard}
                moveBeingViewed={
                  boardBeingViewed() -
                  (boardStates().length - gameState.moves.length)
                }
              />
              <div class={styles.mobile_main_content}>
                <div class={styles.board_ctn}>
                  <Show when={!gameState.playingAgainstEngine}>
                    <Timer
                      className={`${styles.timer} ${styles.top}`}
                      {...topTimer()}
                    />
                  </Show>
                  <Gameboard
                    gameActive={gameState.active}
                    latestBoardBeingViewed={
                      boardBeingViewed() ===
                      boardStates().length -
                        (boardStates().length - gameState.moves.length)
                    }
                    view={gameboardView()}
                    board={currentBoard()}
                    squareToMove={squareToMove()}
                    setSquareToMove={setSquareToMove}
                    getLegalMoves={board.legal_moves_at_sq.bind(board)}
                    validateMove={validateMove}
                    isPromotion={isPromotion}
                    activePlayer={activePlayer}
                  />
                  <Show when={!gameState.playingAgainstEngine}>
                    <Timer
                      className={`${styles.timer} ${styles.bottom}`}
                      {...bottomTimer()}
                    />
                  </Show>
                </div>
                <Show when={activePlayer() && gameState.active}>
                  <GameStatusControls
                    offerDraw={offerDraw}
                    resign={resign}
                    offeredDraw={interfaceStatus()?.type === "offeredDraw"}
                  />
                </Show>
                <Show when={interfaceStatus()}>
                  <GameStatusDisplay
                    setStatus={setInterfaceStatus}
                    resetStatus={resetStatus}
                    styles={styles}
                    status={interfaceStatus()}
                    activePlayer={activePlayer()}
                  />
                </Show>
              </div>
            </>
          }
        >
          <Gameboard
            gameActive={gameState.active}
            latestBoardBeingViewed={
              boardBeingViewed() ===
              boardStates().length -
                (boardStates().length - gameState.moves.length)
            }
            view={gameboardView()}
            board={currentBoard()}
            squareToMove={squareToMove()}
            setSquareToMove={setSquareToMove}
            getLegalMoves={board.legal_moves_at_sq.bind(board)}
            validateMove={validateMove}
            isPromotion={isPromotion}
            activePlayer={activePlayer}
          />
          <Interface
            timersVisible={!gameState.playingAgainstEngine}
            gameActive={gameState.active}
            status={interfaceStatus()}
            setStatus={setInterfaceStatus}
            resign={resign}
            offerDraw={offerDraw}
            resetStatus={resetStatus}
            activePlayer={activePlayer()}
            topTimer={topTimer()}
            bottomTimer={bottomTimer()}
            history={gameState.history}
            historyControls={moveListControls}
            flipBoard={flipBoard}
            moveBeingViewed={
              boardBeingViewed() -
              (boardStates().length - gameState.moves.length)
            }
          />
        </Show>
      </div>
    </main>
  );

  function initState(game: GameSchema) {
    board = GameInterface.from_history(game.moves || "");
    let activeColor = board.active_side() as Colors;

    let tmpTimeDetails = {
      maxTime: game.time,
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
    let activePlayer = getActivePlayer(gameId!, game.white_id, game.black_id);

    let activeColorTime =
      activeColor === "white" ? game.white_time : game.black_time;
    let inactiveColorTime =
      activeColor === "white" ? game.black_time : game.white_time;
    // if fetch happens in middle of game
    const elapsedTime =
      Date.now() - (game.time_stamp_at_turn_start || Date.now());
    let timeLeft = activeColorTime - elapsedTime;
    if (timeLeft < 0) timeLeft = 0;

    tmpTimeDetails[activeColor].time = timeLeft;
    tmpTimeDetails[activeColor].timeLeftAtTurnStart = activeColorTime;
    tmpTimeDetails[OPP_COLOR[activeColor]].time = inactiveColorTime;

    let moves: MoveNotation[] = [];
    if (game.moves) {
      moves = game.moves.split(" ") as MoveNotation[];
    }

    batch(() => {
      setActivePlayer(activePlayer);
      let gameOverDetails = {
        method: game.method,
        result: game.result,
      };
      setBoardStates(getBoardStates(moves));
      setBoardBeingViewed(moves?.length || 0);
      setGameboardView(() => activePlayer || "white");
      setTimeDetails(tmpTimeDetails);
      setGameState({
        activeColor,
        playingAgainstEngine:
          game.white_id === "engine" || game.black_id === "engine",
        active: !game.result,
        moves: moves,
        history: parseHistory(game.history || ""),
      });

      const drawRecord = {
        white: game.white_draw_status,
        black: game.black_draw_status,
      };

      let isActivePlayerAndOfferedDraw =
        !!activePlayer &&
        !drawRecord[activePlayer!] &&
        drawRecord[OPP_COLOR[activePlayer!]];
      let isActivePlayerAndCanClaimDraw =
        !!activePlayer && drawRecord[activePlayer!];

      if (game.result) {
        setInterfaceStatus({
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

    const engineColor =
      game.white_id === "engine"
        ? "white"
        : game.black_id === "engine"
        ? "black"
        : null;
    if (engineColor) {
      engine.active = true;
      engine.color = engineColor;
    }

    if (activeColor === engineColor) {
      makeEngineMove(gameId, moves);
    }
  }

  function onGameUpdate(
    data: UpdateOnGameOver | UpdateOnMove,
    movesSoFar: number,
  ) {
    const game = data.payload;
    game.moves = game.moves || "";

    const history = parseHistory(game.history || "");
    let moves = game.moves.split(" ");
    if (moves.length != movesSoFar) board.make_move(moves[moves.length - 1]);

    let activeColor = board.active_side() as Colors;

    let tmpTimeDetails = {
      white: { ...timeDetails.white },
      black: { ...timeDetails.black },
    };

    tmpTimeDetails[activeColor].timeLeftAtTurnStart =
      tmpTimeDetails[activeColor].time;
    tmpTimeDetails[activeColor].stampAtTurnStart =
      game.time_stamp_at_turn_start || Date.now();
    tmpTimeDetails[OPP_COLOR[activeColor]].time =
      activeColor === "white" ? game.black_time : game.white_time;

    batch(() => {
      setBoardBeingViewed((prev) => {
        if (prev === moves.length - 1) return prev + 1;
        else return prev;
      });
      setTimeDetails(tmpTimeDetails);
      setGameState((prev) => ({
        ...prev,
        active: data.event != "game over",
        activeColor,
        moves,
        history,
      }));
      setBoardStates((prev) => [...prev, board.to_string()]);

      if (data.event == "game over") {
        setInterfaceStatus({
          type: "gameOver",
          payload: {
            method: data.payload.method,
            result: data.payload.result,
          },
        });
      }
    });

    if (engine.active && activeColor === engine.color) {
      makeEngineMove(gameId, moves);
    }
  }

  function onUpdateDraw(drawRecord: DrawRecord, activePlayer: Option<Colors>) {
    if (!activePlayer) return;

    let isActivePlayerAndOfferedDraw =
      !drawRecord[activePlayer] && drawRecord[OPP_COLOR[activePlayer]];

    let isActivePlayerAndCanClaimDraw = drawRecord[activePlayer];

    if (isActivePlayerAndOfferedDraw) {
      setInterfaceStatus({
        type: "offeredDraw",
      });
    } else if (isActivePlayerAndCanClaimDraw) {
      setInterfaceStatus({ type: "claimDraw" });
    } else {
      setInterfaceStatus(null);
    }
  }

  function onTimeOut(payload: TimeOutPayload) {
    const activeColor = gameState.activeColor;
    let tmpTimeDetails = {
      white: { ...timeDetails.white },
      black: { ...timeDetails.black },
    };

    tmpTimeDetails[activeColor].time = 0;
    batch(() => {
      setTimeDetails(tmpTimeDetails);
      onUpdateResult(payload);
    });
  }

  function onUpdateResult(payload: GameOverDetails) {
    batch(() => {
      setGameState((prev) => ({
        ...prev,
        active: false,
      }));
      setInterfaceStatus({
        type: "gameOver",
        payload: {
          method: payload.method,
          result: payload.result,
        },
      });
    });
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
      : history
          .split(".")
          .slice(1)
          .reduce(function parseIntoPairs(acc, curr) {
            const pair = curr.split(" ").slice(1, -1) as Tuple<MoveNotation, 2>;
            acc.push(pair);

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
    const [boardBeingViewed, setBoardBeingViewed] = createSignal<number>(0);
    const [boardStates, setBoardStates] = createSignal<string[]>([]);

    // storing the board in boardArr so currentBoard returns the same array but just with the contents changed
    let boardArr: Option<Board> = null;
    function currentBoard(): Board {
      let boardIdx = boardBeingViewed();
      if (Array.isArray(boardArr)) {
        boardArr.splice(
          0,
          64,
          ...(boardStates()[boardIdx || 0]?.split("") as Board),
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
          if (prev === gameState.moves.length) return prev;
          return prev + 1;
        });
      },
      goToCurrentMove: () => {
        if (!gameState.moves.length) return;
        setBoardBeingViewed(gameState.moves.length);
      },
    };

    return {
      boardStates,
      boardBeingViewed,
      currentBoard,
      moveListControls,
      setBoardStates,
      setBoardBeingViewed,
    };
  }
}
