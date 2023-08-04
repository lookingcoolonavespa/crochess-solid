import { JSX } from "solid-js";
import { IconBtn } from "../../ui-elements/buttons/IconBtn";

export interface ControlBtnDetails {
  icon?: JSX.Element;
  alt?: string;
  text?: string;
  onClick?: () => void;
  className?: string;
}

export function createControlBtnObj(
  icon?: JSX.Element,
  alt?: string,
  text?: string,
  onClick?: () => void,
  className?: string
): ControlBtnDetails {
  return { icon, alt, text, onClick, className };
}

interface ControlsProps {
  className?: string;
  list: ControlBtnDetails[];
}

export function Controls({ className, list }: ControlsProps) {
  return (
    <div class={className}>
      {list.map((c) => {
        return (
          <IconBtn
            className={c.className}
            icon={c.icon}
            altText={c.alt}
            btnText={c.text}
            onClick={c.onClick}
          />
        );
      })}
    </div>
  );
}
