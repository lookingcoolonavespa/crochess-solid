import { useNavigate } from "@solidjs/router";
import { createEffect, createSignal, JSX, onCleanup, Show } from "solid-js";
import { GameGrid } from "./GameGrid/GameGrid";
import styles from "../../styles/Home/Home.module.scss";
import { Modal } from "../ui-elements/Modal";
import useInputValues from "../../hooks/useInputValues";
import { GameSeekColors } from "../../types/types";
import { toMilliseconds } from "../../utils/time";
import { Layout } from "../ui-elements/Layout";
import { Popup } from "../ui-elements/Popup";
import { OPP_COLOR } from "../../constants";
import { GameList } from "./GameList/GameList";
import { Tab } from "./Tab";
import CustomGameFormStyles from "../../styles/Home/CustomGameForm.module.scss";
import { FlatBtn } from "../ui-elements/buttons/FlatBtn";
import { wasmSupported } from "../../utils/wasmSupported";
import { createGameSeek } from "../../utils/game/createGameSeek";
import { initPlayEngine } from "../../utils/game/acceptGameseek";

const GAME_GRID_INDEX = 0;
const GAME_LIST_INDEX = 1;
const PLAY_ENGINE_INDEX = 2;

const wasmIsSupported = wasmSupported();

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
    function onAcceptedGameseek(e: CustomEvent) {
      navigate(`/${e.detail.gameId}`);
    }
    window.addEventListener("acceptedGameseek", onAcceptedGameseek);

    onCleanup(() => {
      window.removeEventListener("acceptedGameseek", onAcceptedGameseek);
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
      e.currentTarget.parentNode?.children,
    ).findIndex((el) => el === e.currentTarget);
    if (elementPosition == -1) return;
    setActiveTabIndex(elementPosition);
  };
  return (
    <Layout className={styles.main}>
      <Show when={!wasmIsSupported}>
        <div class={styles.overlay}>
          <p>
            Your browser does not support wasm which is required for the app to
            run. <br /> Please update your browser to continue.
          </p>
        </div>
      </Show>
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
              active={activeTabIndex() === PLAY_ENGINE_INDEX}
              onClick={moveToTab}
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
          <div
            class={[styles.tab_content, styles.play_engine_tab_content].join(
              " ",
            )}
            classList={{
              inactive: activeTabIndex() != PLAY_ENGINE_INDEX,
            }}
          >
            <FlatBtn
              type="button"
              text="Start Game"
              filled={true}
              size="medium"
              onClick={() => initPlayEngine()}
            />
          </div>
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
              createGameSeek(
                gameTime,
                popupInputValues.increment as number,
                popupInputValues.color === "random"
                  ? "random"
                  : OPP_COLOR[popupInputValues.color],
              );
              setActiveTabIndex(1);
            }}
            setError={setError}
          />
        </Modal>
      </Show>
    </Layout>
  );
};
