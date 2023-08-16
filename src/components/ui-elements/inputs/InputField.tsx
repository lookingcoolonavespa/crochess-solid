import { createEffect, JSX, Show } from "solid-js";
import { Fields } from "../Form";
import styles from "../../../styles/ui-elements/InputField.module.scss";
import { Tooltip } from "../Tooltip";
import { Position, Option } from "../../../types/types";

interface InputFieldProps extends Fields {
  error: string;
  type: "text" | "number";
  autoFocus: boolean;
  onBlur: JSX.FocusEventHandler<HTMLInputElement, FocusEvent>;
  onInput: JSX.EventHandler<HTMLInputElement, InputEvent>;
  value: string | number;
}

export default function InputField(props: InputFieldProps) {
  return (
    <div
      class={["form-group", styles.main].join(" ")}
      classList={{ error: !!props.error }}
    >
      <div class={["input-wrapper", styles.content].join(" ")}>
        {props.label && (
          <label class="label">
            <span>{props.label}</span>
          </label>
        )}
        <input {...props} />
      </div>
      <Show when={props.error}>
        <Tooltip text={props.error} />
      </Show>
    </div>
  );
}
