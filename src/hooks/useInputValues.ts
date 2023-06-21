import { JSX } from "solid-js";
import { createStore } from "solid-js/store";

export default function useInputValues<
  T extends {
    [key: string]: string | number;
  }
>(init?: T) {
  const [inputValues, setInputValues] = createStore<T>(init || ({} as T));

  const handleInputChange: JSX.EventHandler<HTMLInputElement, InputEvent> =
    function (e) {
      const { name, value } = e.currentTarget;
      setInputValues((prev) => ({
        ...prev,
        [name]: value,
      }));
    };

  const handleSelectChange: JSX.EventHandler<HTMLSelectElement, InputEvent> =
    function (e) {
      const { name } = e.currentTarget;
      const { value } = e.target as HTMLOptionElement;
      setInputValues((prev) => ({
        ...prev,
        [name]: value,
      }));
    };

  function resetInputValues() {
    setInputValues(init || ({} as T));
  }

  return {
    inputValues,
    setInputValues,
    handleInputChange,
    handleSelectChange,
    resetInputValues,
  };
}
