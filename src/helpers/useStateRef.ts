import { useCallback, useRef, useState } from "react";

export default function useStateRef<T>(defaultValue: T) {
  const [stateValue, setStateValue] = useState(defaultValue);
  const stateRef = useRef(stateValue);

  const setState: typeof setStateValue = useCallback((newValueOrSetter) => {
    if (newValueOrSetter instanceof Function) {
      // using `instanceof` to avoid https://github.com/microsoft/TypeScript/issues/46066
      setStateValue((prevState) => {
        const _newValue = newValueOrSetter(prevState);
        stateRef.current = _newValue;
        return _newValue;
      });
    } else {
      stateRef.current = newValueOrSetter;
      setStateValue(newValueOrSetter);
    }
  }, []);

  return [stateRef, stateValue, setState] as const;
}
