import { useNavigate } from "@solidjs/router";
import { createEffect, createSignal, JSX, onCleanup, Show } from "solid-js";
import { GameGrid } from "./GameGrid/GameGrid";
import styles from "../../styles/Home/Home.module.scss";
import { Modal } from "../ui-elements/Modal";
import useInputValues from "../../hooks/useInputValues";
import { ColorsChar, GameSeekColors } from "../../types/types";
import { toMilliseconds } from "../../utils/time";
import { createGameSeek } from "../../utils/game";
import { Layout } from "../ui-elements/Layout";
import { Popup } from "../ui-elements/Popup";
import { OPP_COLOR } from "../../constants";
import { GameList } from "./GameList/GameList";
import { Tab } from "./Tab";
import { user, socket } from "../../globalState";
import CustomGameFormStyles from "../../styles/Home/CustomGameForm.module.scss";

const GAME_GRID_INDEX = 0;
const GAME_LIST_INDEX = 1;

export const Home = () => {
  const [popup, setPopup] = createSignal(false);
  const [error, setError] = createSignal("");
  const [activeTabIndex, setActiveTabIndex] = createSignal(0);

  const {
    inputValues: popupInputValues,
    handleInputChange,
    handleSelectChange,
    resetInputValues,
  } = useInputValues<{
    increment: number;
    time_unit: "seconds" | "minutes" | "hours";
    color: GameSeekColors;
    time: number;
  }>({
    increment: 0,
    time_unit: "minutes",
    color: "random",
    time: 5,
  });
  const navigate = useNavigate();

  createEffect(function listenToAcceptedGameSeeks() {
    let userId = user();
    let socketClient = socket();
    if (!socketClient || !userId) return;
    const subscription = socketClient.subscribe(
      "/user/queue/gameseeks",
      (message) => {
        type GameIdMsg = {
          gameId: string;
          playerColor: "W" | "B";
        };
        const { gameId, playerColor } = JSON.parse(message.body) as GameIdMsg;
        setIdToCookie(gameId, playerColor.toLowerCase() as ColorsChar);
        function setIdToCookie(gameId: string, color: ColorsChar) {
          // set the active playerIds to a cookie so we can tell between active players and spectators
          document.cookie = `${gameId}(${color})=${userId};max-age=${
            60 * 60 * 24
          };samesite=strict`;
        }

        navigate(`/${gameId}`);
      }
    );

    onCleanup(() => {
      subscription?.unsubscribe();
    });
  });

  function closePopup() {
    resetInputValues();
    setPopup(false);
  }
  function showPopup() {
    setPopup(true);
  }

  const moveToTab: JSX.EventHandler<HTMLLIElement, MouseEvent> = function (e) {
    if (!e.currentTarget.parentNode?.children) return;

    let elementPosition = Array.from(
      e.currentTarget.parentNode?.children
    ).findIndex((el) => el === e.currentTarget);
    if (elementPosition == -1) return;
    setActiveTabIndex(elementPosition);
  };
  return (
    <Layout className={styles.main}>
      <div class={styles["tabbed-content"]}>
        <nav class={styles.tabs}>
          <ul>
            <Tab
              underlineSlideDirection="left"
              active={activeTabIndex() === GAME_GRID_INDEX}
              onClick={moveToTab}
              text="Create a game"
            />
            <Tab
              underlineSlideDirection="right"
              active={activeTabIndex() === GAME_LIST_INDEX}
              onClick={moveToTab}
              text="Join a game"
            />
            <Tab
              active={false}
              onClick={() => {
                if (!user) return;
                // initPlayEngine(socket!, user);
              }}
              text="Play against engine"
            />
          </ul>
        </nav>
        <div class={styles.content}>
          <GameGrid
            active={activeTabIndex() === GAME_GRID_INDEX}
            createCustomGame={showPopup}
          />
          <GameList active={activeTabIndex() === GAME_LIST_INDEX} />
        </div>
      </div>
      <Show when={popup()}>
        <Modal
          close={() => {
            resetInputValues();
            setPopup(false);
          }}
        >
          <Popup
            title="Create a game"
            fields={[
              {
                label: "Time",
                name: "time",
                type: "number",
                unitsDisplay: {
                  label: "",
                  name: "time_unit",
                  type: "dropdown",
                  options: [
                    { value: "seconds", display: "seconds" },
                    {
                      value: "minutes",
                      display: "minutes",
                    },
                    { value: "hours", display: "hours" },
                  ],
                },
              },
              {
                label: "Increment",
                name: "increment",
                type: "number",
                unitsDisplay: { label: "seconds" },
              },
              {
                label: "Choose your color",
                name: "color",
                type: "radioList",
                options: [
                  { value: "black" },
                  { value: "random" },
                  { value: "white" },
                ],
              },
            ]}
            customStyles={CustomGameFormStyles}
            close={closePopup}
            inputValues={popupInputValues}
            handleInputChange={handleInputChange}
            handleSelectChange={handleSelectChange}
            isMobile={false}
            actionBtnText="Create game"
            isCancelBtn={true}
            submitAction={() => {
              const gameTime = toMilliseconds({
                [popupInputValues.time_unit]: popupInputValues.time as number,
              });
              if (user() && socket()) {
                createGameSeek(
                  gameTime,
                  popupInputValues.increment as number,
                  popupInputValues.color === "random"
                    ? "random"
                    : OPP_COLOR[popupInputValues.color]
                );
              }
            }}
            setError={setError}
          />
        </Modal>
      </Show>
    </Layout>
  );
};
