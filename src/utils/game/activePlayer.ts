import { Colors } from "../../types/types";

export function parseCookies(cookie: string): { [key: string]: string } {
  const cookies = cookie.split("; ");
  return cookies
    .map((c) => c.split("="))
    .reduce<{ [key: string]: string }>((acc, curr) => {
      const [key, value] = curr;
      acc[key] = value;
      return acc;
    }, {});
}

export function getActivePlayer(
  gameId: string,
  whiteId: string,
  blackId: string
): Colors | null {
  const cookieObj = parseCookies(document.cookie);
  switch (true) {
    case cookieObj[`${gameId}(w)`] === whiteId &&
      cookieObj[`${gameId}(b)`] === blackId: {
      // player is playing on two separate tabs
      const user = sessionStorage.getItem("user");
      if (user === whiteId) return "white";
      if (user === blackId) return "black";
      return null;
    }
    case cookieObj[`${gameId}(w)`] === whiteId: {
      return "white";
    }
    case cookieObj[`${gameId}(b)`] === blackId: {
      return "black";
    }
    default:
      return null;
  }
}
