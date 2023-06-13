import { useNavigate } from "@solidjs/router";
import { createEffect, createSignal, useContext } from "solid-js";
import { UserContext } from "../utils/contexts/UserContext";
import { GameGrid } from "./GameGrid/GameGrid";
import { Layout } from "./Layout";
import styles from "../styles/Home.module.scss";

export const Home = () => {
  const { user, socket } = useContext(UserContext) || {
    user: null,
    socket: null,
  };
  const [popup, setPopup] = createSignal(false);
  const [error, setError] = createSignal("");
  // const {
  //   inputValues: popupInputValues,
  //   handleInputChange,
  //   handleSelectChange,
  //   resetInputValues,
  // } = useInputValues<{
  //   increment: number;
  //   time_unit: "seconds" | "minutes" | "hours";
  //   color: seekColor;
  //   time: number;
  // }>({
  //   increment: 0,
  //   time_unit: "minutes",
  //   color: "random",
  //   time: 5,
  // });
  // const [activeTab, setActiveTab] = useState("Create a game");
  //
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

  // function moveToTab(e: React.MouseEvent<HTMLElement>) {
  //   if (!e.currentTarget.dataset.tab) return;
  //   setActiveTab(e.currentTarget.dataset.tab);
  // }
  return (
    <>
      <Layout className={styles.main}>
        <div class={styles["tabbed-content"]}>
          <nav class={styles.tabs}>
            <ul>
              <li
                class={activeTab !== "Create a game" ? styles.inactive : ""}
                onClick={moveToTab}
                data-tab="Create a game"
              >
                <span>Create a game</span>
              </li>
              <li
                class={activeTab !== "Game list" ? styles.inactive : ""}
                onClick={moveToTab}
                data-tab="Game list"
              >
                <span>Game list</span>
              </li>
            </ul>
          </nav>
          <div class={styles.content}>
            <GameGrid
              active={activeTab === "Create a game"}
              createCustomGame={() => setPopup(true)}
            />
            <ListOfGames active={activeTab === "Game list"} />
          </div>
        </div>
        {popup && (
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
              close={() => {
                resetInputValues();
                setPopup(false);
              }}
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
        )}
        <button
          class={styles.underline_btn}
          type="button"
          onClick={() => {
            if (!user) return;
            initPlayEngine(socket!, user);
          }}
        >
          Play against engine
        </button>
      </Layout>
    </>
  );
};
