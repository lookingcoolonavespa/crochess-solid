import { createEffect, createRenderEffect, on, onMount } from "solid-js";

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
    console.log("scrolled");
  }

  onMount(() => {
    console.log(scrollEndRef);
    setTimeout(() => {
      scrollToBottom();
    }, 100);
  });
}
