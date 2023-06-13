type Validation = { error: null | string };
export function dynamicValidation(el: HTMLInputElement): Validation {
  switch (el.name) {
    case "time": {
      const val = el.value;
      const num = parseInt(val);
      if (typeof num !== "number") {
        return { error: "not a number" };
      }
      if (!num || num > 60) return { error: "must be between 1 and 60" };
      break;
    }

    case "increment": {
      const val = el.value;
      const num = parseInt(val);
      if (typeof num !== "number") {
        return { error: "not a number" };
      }
      if (num > 60) return { error: "must be between 0 and 60" };
      if (num < 0) return { error: "must be between 0 and 60" };
      break;
    }

    case "color": {
      const val = el.value;
      if (val !== "black" && val !== "white") {
        return { error: "not a valid color" };
      }
      break;
    }

    default:
      return { error: null };
  }

  return { error: null };
}
