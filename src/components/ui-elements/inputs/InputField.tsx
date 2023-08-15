import { JSX, Show } from "solid-js";
import { Fields } from "../Form";
import styles from "../../../styles/ui-elements/InputField.module.scss";

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
        <span class={styles.error_msg}>{props.error}</span>
      </Show>
    </div>
  );
}
