import { ClientGameInterface } from "crochess_engine";
import initRustChess, { set_console_error_panic_hook } from "crochess_engine";

self.onmessage = async (msg) => {
  await initRustChess();
  set_console_error_panic_hook();

  const board = ClientGameInterface.from_moves_str(msg.data.moves);
  const engineMove = board.engine_move();
  self.postMessage({ engineMove });
};
