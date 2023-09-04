import { createEffect, createSignal, onCleanup } from "solid-js";

export function useScreenSize() {
  const [browserWidth, setBrowserWidth] = createSignal(window.innerWidth);

  function handleWindowResize() {
    setBrowserWidth(window.innerWidth);
  }
  createEffect(() => {
    window.addEventListener("resize", handleWindowResize);
    onCleanup(() => window.removeEventListener("resize", handleWindowResize));
  });

  return {
    smallerThanDesktop: () => browserWidth() < 1024,
  };
}
