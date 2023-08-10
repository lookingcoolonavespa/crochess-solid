import { Form, FormProps } from "./Form";

import { CloseSvg } from "../../assets/svg/close-line";
import styles from "../../styles/ui-elements/Popup.module.scss";
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
  customStyles?: CSSModuleClasses;
}

export function Popup(props: PopupProps) {
  const baseClass = [styles.main];
  if (props.className) baseClass.push(props.className);

  const c = children(() => props.children);

  return (
    <div
      class={baseClass.join(" ")}
      onClick={(e) => {
        e.stopPropagation();
      }}
    >
      <header class={styles.header}>
        <h3>{props.title}</h3>
        <Show when={props.subheader}>
          <div class="subheader">
            <span>{props.subheader}</span>
          </div>
        </Show>
        <IconBtn icon={<CloseSvg />} onClick={close} className="close-btn" />
      </header>
      <Show when={props.fields}>
        <Form {...props} />
      </Show>
      <Show when={props.children}>
        <div class="content">{c()}</div>
        <Show when={props.footerContent}>
          <footer>{props.footerContent}</footer>
        </Show>
      </Show>
    </div>
  );
}
