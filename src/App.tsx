import type { Component } from "solid-js";

import logo from "./logo.svg";
import styles from "./App.module.css";
import { GameGrid } from "./components/GameGrid/GameGrid";

const App: Component = () => {
  return <GameGrid active={true} createCustomGame={() => {}} />;
};

export default App;
