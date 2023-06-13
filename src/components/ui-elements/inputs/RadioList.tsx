import { JSX } from "solid-js";
import { Fields } from "../Form";

interface RadioListProps extends Fields {
  onInput: JSX.EventHandler<HTMLInputElement, InputEvent>;
  value: string;
}

export default function RadioList({
  label,
  name,
  onInput,
  value,
  options,
}: RadioListProps) {
  return (
    <div id={name} class="form-group">
      <p class="label">{label}</p>
      <div class="radio-ctn">
        {options &&
          options.map((o, i) => (
            <div class="radio-wrapper">
              <input
                type="radio"
                id={`${name}${i}`}
                name={name}
                onInput={onInput}
                checked={value === o.value}
                {...o}
              />
              {o.display && <label for={`${name}${i}`}>{o.display}</label>}
            </div>
          ))}
      </div>
    </div>
  );
}
