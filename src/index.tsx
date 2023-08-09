/* @refresh reload */
import { render } from "solid-js/web";
import initRustChess, { set_console_error_panic_hook } from "rust_engine";

import "./styles/index.scss";
import App from "./App";
import { Route, Router, Routes } from "@solidjs/router";
import { Game } from "./components/Game/Game";
import { onCleanup, onMount } from "solid-js";
import { Client, IStompSocket } from "@stomp/stompjs";
import SockJS from "sockjs-client/dist/sockjs";
import { setUser, socket, setSocket } from "./globalState";

const root = document.getElementById("root");

if (import.meta.env.DEV && !(root instanceof HTMLElement)) {
  throw new Error(
    "Root element not found. Did you forget to add it to your index.html? Or maybe the id attribute got mispelled?"
  );
}

(async function () {
  await initRustChess();
  set_console_error_panic_hook();

  useConnectToSocket();
  function useConnectToSocket() {
    onMount(function connectToSocket() {
      if (socket()?.active) return;

      const stompClient = new Client();
      stompClient.webSocketFactory = () => {
        return new SockJS(
          `${import.meta.env.VITE_BACKEND_URL}/websocket`
        ) as IStompSocket;
      };

      const userId = sessionStorage.getItem("user") || getRdmInt().toString();
      function getRdmInt() {
        return Math.floor(2147483647 * Math.random());
      }

      stompClient.connectHeaders = { name: userId };
      stompClient.activate();
      stompClient.onConnect = () => {
        setUser(userId);
        sessionStorage.setItem("user", userId);
        // used to identify user if they refresh or disconnect
        setSocket(stompClient);
      };
    });

    onCleanup(function deactivateSocket() {
      socket()?.deactivate();
      setUser(null);
    });

    return socket;
  }

  render(
    () => (
      <Router>
        <Routes>
          <Route path="/" component={App} />
          <Route path="/:id" component={Game} />
        </Routes>
      </Router>
    ),
    root!
  );
})();
