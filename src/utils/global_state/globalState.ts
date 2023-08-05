import { createSignal } from "solid-js";
import { Option } from "../../types/types";
import { Client } from "@stomp/stompjs";

export type User = Option<string>;

export const [socket, setSocket] = createSignal<Option<Client>>(null);
export const [user, setUser] = createSignal<User>(null);
