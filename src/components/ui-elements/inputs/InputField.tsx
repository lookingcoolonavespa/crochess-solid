import { JSX } from "solid-js";
import { Fields } from "../Form";
import styles from "../../../styles/InputField.module.scss";

interface InputFieldProps extends Fields {
  error: string;
  type: "text" | "number";
  autoFocus: boolean;
  onBlur: JSX.FocusEventHandler<HTMLInputElement, FocusEvent>;
  onInput: JSX.EventHandler<HTMLInputElement, InputEvent>;
  value: string | number;
}

export default function InputField({
  label,
  error,
  unitsDisplay,
  ...inputProps
}: InputFieldProps) {
  const rootClasses = [styles.main, "form-group"];
  if (error) rootClasses.push("error");

  return (
    <div class={rootClasses.join(" ")}>
      <div class={styles.content}>
        {label && (
          <label class="label">
            <span>{label}</span>
          </label>
        )}
        <div class={styles["input-wrapper"]}>
          <input {...inputProps} />
        </div>
      </div>
      {error && <span class={styles.error_msg}>{error}</span>}
    </div>
  );
}
