self.onmessage = (msg) => {
  const engineMove = msg.data.board.engine_move();

  self.postMessage(engineMove);
};

export {};
