import { JSXElement, Show } from "solid-js";

interface IconBtnProps {
  className?: string;
  icon?: JSXElement;
  altText?: string;
  btnText?: string;
  onClick?: () => void;
}

export function IconBtn({ className, icon, btnText, onClick }: IconBtnProps) {
  const rootClasses = ["icon-btn", "btn", "hover-highlight"];
  if (className) rootClasses.push(className);

  return (
    <div class={rootClasses.join(" ")} onClick={onClick}>
      <Show when={icon}>{icon}</Show>
      <Show when={btnText}>{btnText}</Show>
    </div>
  );
}
