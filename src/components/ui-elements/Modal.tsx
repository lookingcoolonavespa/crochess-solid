import { children, createEffect, JSXElement } from "solid-js";
import { Portal } from "solid-js/web";

interface ModalProps {
  close: () => void;
  children: JSXElement;
}

export function Modal(props: ModalProps) {
  let dialog: HTMLDialogElement | undefined;
  createEffect(() => {
    if (dialog) dialog.showModal();
  });
  const c = children(() => props.children);
  return (
    <Portal>
      <dialog ref={dialog} id="modal" onClick={props.close}>
        {c()}
      </dialog>
    </Portal>
  );
}
