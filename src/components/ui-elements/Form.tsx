import styles from "../../styles/Form.module.scss";
import { JSX, Match, Switch } from "solid-js";
import useInputError from "../../hooks/useInputError";
import { FlatBtn } from "./buttons/FlatBtn";
import InputField from "./inputs/InputField";
import RadioList from "./inputs/RadioList";
import Select from "./inputs/Select";

export type Option = {
  value: string;
  display?: string;
};

type UnitsDisplay = Omit<Partial<Fields>, "unitsDisplay">;

export type Fields = {
  label: string;
  name: string;
  type: "text" | "number" | "dropdown" | "radioList";
  defaultValue?: string | number;
  options?: Option[];
  unitsDisplay?: UnitsDisplay;
};

export interface FormProps {
  fields: Fields[];
  inputValues: { [key: string]: string | number };
  actionBtnText?: string;
  noCancelBtn: boolean;
  cancelBtnText?: string;
  handleInputChange: JSX.EventHandler<HTMLInputElement, InputEvent>;
  handleSelectChange: JSX.EventHandler<HTMLSelectElement, InputEvent>;
  submitAction: (() => Promise<void>) | (() => void);
  cleanUp?: () => void;
  close: () => void;
  setError: (string: string) => void;
}

export function Form({
  fields,
  inputValues,
  actionBtnText,
  noCancelBtn,
  cancelBtnText,
  handleInputChange,
  handleSelectChange,
  submitAction,
  cleanUp,
  close,
}: FormProps) {
  const fieldNames = fields.map((f) => f.name);
  const { inputError, validateInput, submitForm } = useInputError(fieldNames);

  return (
    <form
      onSubmit={async (e) => {
        cleanUp = cleanUp || close;
        await submitForm(e.currentTarget, submitAction, cleanUp);
      }}
      class={styles.main}
    >
      <div class="content">
        <input type="password" hidden />
        {/* need this to turn off autocomplete */}
        {fields.map((f: Fields, idx) => {
          switch (f.type) {
            case "dropdown":
              return (
                <Select
                  onInput={handleSelectChange}
                  value={(inputValues[f.name] as string) || ""}
                  {...f}
                />
              );
            case "radioList": {
              return (
                <RadioList
                  onInput={handleInputChange}
                  value={(inputValues[f.name] as string) || ""}
                  {...f}
                />
              );
            }
            default: {
              const onInput: JSX.EventHandler<HTMLInputElement, InputEvent> = (
                e
              ) => {
                validateInput(e.currentTarget as HTMLInputElement);
                handleInputChange(e);
              };
              const onBlur: JSX.FocusEventHandler<
                HTMLInputElement,
                FocusEvent
              > = (e) => validateInput(e.currentTarget);

              return (
                <Switch>
                  <Match when={f.unitsDisplay}>
                    <div class={styles.with_units}>
                      <InputField
                        autoFocus={idx === 0}
                        onBlur={onBlur}
                        error={inputError()[f.name]}
                        onInput={onInput}
                        value={inputValues[f.name] ?? ""}
                        {...f}
                        type={f.type}
                      />
                      <Select
                        onInput={handleSelectChange}
                        value={
                          (inputValues[
                            f.unitsDisplay?.name as string
                          ] as string) || ""
                        }
                        {...f.unitsDisplay}
                      />
                    </div>
                  </Match>
                  <Match when={!f.unitsDisplay}>
                    <InputField
                      autoFocus={idx === 0}
                      onBlur={onBlur}
                      error={inputError()[f.name]}
                      onInput={onInput}
                      value={inputValues[f.name] || ""}
                      {...f}
                      type={f.type}
                    />
                  </Match>
                </Switch>
              );
            }
          }
        })}
      </div>
      <footer>
        <div class={styles["btn-ctn"]}>
          {!noCancelBtn && (
            <FlatBtn
              text={cancelBtnText || "Cancel"}
              underline={true}
              onClick={close}
              size="small"
            />
          )}
          <FlatBtn
            type="submit"
            text={actionBtnText || "Done"}
            filled={true}
            size="small"
          />
        </div>
      </footer>
    </form>
  );
}
