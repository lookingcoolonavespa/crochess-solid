import IconBtn from "./IconBtn";
import { Form, FormProps } from "./Form";

import closeSVG from "../icons/close-line.svg";
import styles from "../styles/Popup.module.scss";
import { JSXElement } from "solid-js";

interface PopupProps extends FormProps {
  className?: string;
  title: string;
  subheader?: string;
  children?: JSXElement;
  footerContent?: JSXElement;
  close: () => void;
  isMobile: boolean;
}

export default function Popup({
  className,
  title,
  subheader,
  fields,
  children,
  footerContent,
  close,
  isMobile,
  ...props
}: PopupProps) {
  const baseClass = [styles.main];
  if (className) baseClass.push(className);

  return (
    <div class={baseClass.join(" ")} onClick={(e) => e.stopPropagation()}>
      <header>
        <h3>{title}</h3>
        {subheader && (
          <div class="subheader">
            <span>{subheader}</span>
          </div>
        )}
        <IconBtn icon={closeSVG} onClick={close} class="close-btn" />
      </header>
      {fields && <Form fields={fields} close={close} {...props} />}
      {children && (
        <>
          <div class="content">{children}</div>
          {footerContent && <footer>{footerContent}</footer>}
        </>
      )}
    </div>
  );
}
