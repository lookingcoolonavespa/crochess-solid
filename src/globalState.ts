import { createSignal } from "solid-js";
import { Client } from "@stomp/stompjs";
import { Option } from "./types/types";

export type User = Option<string>;
export type Socket = Option<Client>;

export const [socket, setSocket] = createSignal<Socket>(null);
export const [user, setUser] = createSignal<User>(null);
