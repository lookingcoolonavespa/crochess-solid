import { Accessor, createContext, createSignal, Setter } from "solid-js";
import { Option } from "../../types/types";
import { Client } from "@stomp/stompjs";

export type User = Option<string>;

const [socket, setSocket] = createSignal<Option<Client>>(null);
const [user, setUser] = createSignal<User>(null);

export const UserContext = createContext<{
  user: Accessor<User>;
  setUser: Setter<User>;
  socket: Accessor<Option<Client>>;
}>({
  user,
  setUser: setUser,
  socket: socket,
});
