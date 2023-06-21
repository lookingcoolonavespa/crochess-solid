import { useNavigate } from "@solidjs/router";
import { createEffect, createSignal, JSX, Show, useContext } from "solid-js";
import { UserContext } from "../utils/contexts/UserContext";
import { GameGrid } from "./GameGrid/GameGrid";
import styles from "../styles/Home.module.scss";
import { Modal } from "./ui-elements/Modal";
import useInputValues from "../hooks/useInputValues";
import { GameSeekColors } from "../types/types";
import { toMilliseconds } from "../utils/time";
import { createGameSeek } from "../utils/game";
import { Layout } from "./ui-elements/Layout";
import { Popup } from "./ui-elements/Popup";
import { OPP_COLOR } from "../constants";

export const Home = () => {
  const { user, socket } = useContext(UserContext) || {
    user: null,
    socket: null,
  };
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
    // useEffect([navigate, user, socket]);
    if (!socket || !user) return;
    const subscription = socket.subscribe(
      "/user/queue/gameseeks",
      (message) => {
        type GameIdMsg = {
          gameId: string;
          playerColor: "W" | "B";
        };
        const { gameId, playerColor } = JSON.parse(message.body) as GameIdMsg;
        // setIdToCookie(gameId, playerColor.toLowerCase() as Colors, user);
        navigate(`/${gameId}`);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  });

  function closePopup() {
    resetInputValues();
    setPopup(false);
  }
  function showPopup() {
    setPopup(true);
  }

  const moveToTab: JSX.EventHandler<HTMLLIElement, MouseEvent> = function (e) {
    if (!e.currentTarget.dataset.tab) return;
    let elementPosition = Array.from(e.currentTarget.children).findIndex(
      (el) => el === e.currentTarget
    );
    if (elementPosition == -1) return;
    setActiveTabIndex(elementPosition);
  };
  return (
    <>
      <Layout className={styles.main}>
        <div class={styles["tabbed-content"]}>
          <nav class={styles.tabs}>
            <ul>
              <li
                class={activeTabIndex() !== 0 ? styles.inactive : ""}
                onClick={moveToTab}
                data-tab="Create a game"
              >
                <span>Create a game</span>
              </li>
              <li
                class={activeTabIndex() !== 1 ? styles.inactive : ""}
                onClick={moveToTab}
                data-tab="Game list"
              >
                <span>Game list</span>
              </li>
              <li
                class={styles.inactive}
                onClick={() => {
                  if (!user) return;
                  // initPlayEngine(socket!, user);
                }}
              >
                Play against engine
              </li>
            </ul>
          </nav>
          <div class={styles.content}>
            <GameGrid active={true} createCustomGame={showPopup} />
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
              close={closePopup}
              inputValues={popupInputValues}
              handleInputChange={handleInputChange}
              handleSelectChange={handleSelectChange}
              isMobile={false}
              actionBtnText="Create game"
              noCancelBtn={false}
              submitAction={() => {
                const gameTime = toMilliseconds({
                  [popupInputValues.time_unit]: popupInputValues.time as number,
                });
                if (user && socket)
                  createGameSeek(
                    socket,
                    gameTime,
                    popupInputValues.increment as number,
                    popupInputValues.color === "random"
                      ? "random"
                      : OPP_COLOR[popupInputValues.color],
                    user
                  );
              }}
              setError={setError}
            />
          </Modal>
        </Show>
      </Layout>
    </>
  );
};
