/* @refresh reload */
import { render } from "solid-js/web";
import initRustChess, { set_console_error_panic_hook } from "crochess_engine";

import "./styles/index.scss";
import App from "./App";
import { hashIntegration, Route, Router, Routes } from "@solidjs/router";
import { Game } from "./components/Game/Game";
import { onCleanup, onMount } from "solid-js";
import { setUser, socket, setSocket } from "./globalState";
import { CroChessWebSocket } from "./websocket/websocket";

const root = document.getElementById("root");

if (import.meta.env.DEV && !(root instanceof HTMLElement)) {
  throw new Error(
    "Root element not found. Did you forget to add it to your index.html? Or maybe the id attribute got mispelled?",
  );
}

(async function () {
  await initRustChess();
  set_console_error_panic_hook();

  useConnectToSocket();
  function useConnectToSocket() {
    onMount(function connectToSocket() {
      if (socket()?.active()) return;

      const userId = Number(sessionStorage.getItem("user")) || getRdmInt();
      function getRdmInt() {
        return Math.floor(2147483647 * Math.random());
      }

      const socketConnection = new CroChessWebSocket(
        `${import.meta.env.VITE_BACKEND_WS_URL}?uid=${userId}`,
        () => {
          setUser(`${userId}`);
          sessionStorage.setItem("user", `${userId}`);
          // used to identify user if they refresh or disconnect
          setSocket(socketConnection);
        },
        function onDisconnect() {
          setUser(null);
          setSocket(null);
        },
      );

      onCleanup(function deactivateSocket() {
        socket()?.close();
        setUser(null);
      });
    });
  }

  render(
    () => (
      <Router source={hashIntegration()}>
        <Routes>
          <Route path="/" component={App} />
          <Route path="/:id" component={Game} />
        </Routes>
      </Router>
    ),
    root!,
  );
})();
