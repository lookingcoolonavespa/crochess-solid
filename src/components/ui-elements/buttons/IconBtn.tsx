import { JSXElement, Show } from "solid-js";

interface IconBtnProps {
  className?: string;
  icon?: JSXElement;
  altText?: string;
  btnText?: string;
  onClick?: () => void;
}

export function IconBtn({ className, icon, btnText, onClick }: IconBtnProps) {
  return (
    <button
      class={["icon-btn", "btn", "hover-highlight", className].join(" ")}
      onClick={onClick}
    >
      <Show when={icon}>{icon}</Show>
      <Show when={btnText}>{btnText}</Show>
    </button>
  );
}
