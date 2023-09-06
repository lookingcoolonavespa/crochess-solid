import { ClientGameInterface } from "rust_engine";
import initRustChess, { set_console_error_panic_hook } from "rust_engine";

self.onmessage = async (msg) => {
  console.log(msg.data);
  await initRustChess();
  set_console_error_panic_hook();

  const board = ClientGameInterface.from_history(msg.data.moves);
  const engineMove = board.engine_move();
  self.postMessage({ engineMove });
};
