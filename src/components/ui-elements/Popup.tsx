import { Form, FormProps } from "./Form";

import { CloseSvg } from "../../assets/svg/close-line";
import styles from "../../styles/Popup.module.scss";
import { children, JSXElement, Show } from "solid-js";
import { IconBtn } from "./buttons/IconBtn";

interface PopupProps extends FormProps {
  className?: string;
  title: string;
  subheader?: string;
  children?: JSXElement;
  footerContent?: JSXElement;
  close: () => void;
  isMobile: boolean;
}

export function Popup({
  className,
  title,
  subheader,
  fields,
  footerContent,
  close,
  isMobile,
  ...props
}: PopupProps) {
  const baseClass = [styles.main, "hi"];
  if (className) baseClass.push(className);

  const c = children(() => props.children);

  return (
    <div
      class={baseClass.join(" ")}
      onClick={(e) => {
        e.stopPropagation();
      }}
    >
      <header>
        <h3>{title}</h3>
        <Show when={subheader}>
          <div class="subheader">
            <span>{subheader}</span>
          </div>
        </Show>
        <IconBtn icon={<CloseSvg />} onClick={close} className="close-btn" />
      </header>
      <Show when={fields}>
        <Form fields={fields} close={close} {...props} />
      </Show>
      <Show when={props.children}>
        <>
          <div class="content">{c()}</div>
          {footerContent && <footer>{footerContent}</footer>}
        </>
      </Show>
    </div>
  );
}
