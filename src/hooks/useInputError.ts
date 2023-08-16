import { createStore } from "solid-js/store";
import { dynamicValidation } from "../utils/formValidation";

export default function useInputError(inputNames: string[]) {
  const [inputError, setInputError] = createStore(
    inputNames.reduce((acc: { [key: string]: string }, curr: string) => {
      acc[curr] = "";
      return acc;
    }, {})
  );

  function validateInput(el: HTMLInputElement) {
    const validationStatus = dynamicValidation(el);

    const value = validationStatus.error ? validationStatus.error : "";
    setInputError({
      [el.name]: value,
    });

    return !validationStatus.error;
  }

  async function submitForm(
    form: HTMLFormElement,
    submitAction: (() => Promise<void>) | (() => void),
    cleanUp: () => void
  ) {
    const { elements } = form;

    let errors = false;
    for (const fname of inputNames) {
      // iterate through each input field and validate
      const currEl = elements.namedItem(fname);
      if (!(currEl instanceof HTMLInputElement)) {
        continue;
      }
      const valid = validateInput(currEl);
      if (!valid) errors = true;
    }

    if (errors) return;
    await submitAction();
    cleanUp();
  }

  return { inputError, validateInput, submitForm };
}
