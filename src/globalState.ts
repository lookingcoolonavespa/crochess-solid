import { createSignal } from "solid-js";
import { Option } from "./types/types";
import { CroChessWebSocket } from "./websocket/websocket";

export type User = Option<string>;
export type Socket = Option<CroChessWebSocket>;

export const [socket, setSocket] = createSignal<Socket>(null);
export const [user, setUser] = createSignal<User>(null);
