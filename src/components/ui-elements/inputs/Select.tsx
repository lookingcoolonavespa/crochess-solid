import { JSX } from "solid-js";
import { Option } from "../Form";

interface SelectProps {
  options?: Option[];
  name?: string;
  label?: string;
  value: string;
  onInput: JSX.EventHandler<HTMLSelectElement, InputEvent>;
}

export default function Select({
  options,
  name,
  label,
  value,
  onInput,
}: SelectProps) {
  return (
    <div class="select-wrapper">
      {label && <label>{label}</label>}
      {options && (
        <select name={name} value={value} onInput={onInput}>
          {options.map((o) => (
            <option value={o.value}>{o.display}</option>
          ))}
        </select>
      )}
    </div>
  );
}
