import { createContext } from "solid-js";
import { Option } from "../../types/types";
import { Client } from "@stomp/stompjs";

export const UserContext = createContext<{
  user: string | undefined;
  setUser: Option<string>;
  socket: Client | null;
}>();
