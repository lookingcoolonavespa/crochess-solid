import { createEffect } from "solid-js";

export default function useScrollToBottom(
  scrollEndRef: HTMLElement,
  list: any[]
) {
  function scrollToBottom() {
    scrollEndRef!.scrollIntoView({
      behavior: "auto",
      block: "end",
      inline: "center",
    });
  }

  createEffect(() => {
    scrollToBottom();
  }, [list]);
}
