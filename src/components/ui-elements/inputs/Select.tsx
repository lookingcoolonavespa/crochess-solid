import { JSX, Show } from "solid-js";
import { Option } from "../Form";

interface SelectProps {
  options?: Option[];
  name?: string;
  label?: string;
  value: string;
  onInput: JSX.EventHandler<HTMLSelectElement, InputEvent>;
}

export default function Select(props: SelectProps) {
  return (
    <div class="select-wrapper">
      <Show when={props.label}>
        <label>{props.label}</label>
      </Show>
      <Show when={props.options}>
        <select name={props.name} value={props.value} onInput={props.onInput}>
          {props.options!.map((o) => (
            <option value={o.value}>{o.display}</option>
          ))}
        </select>
      </Show>
    </div>
  );
}
