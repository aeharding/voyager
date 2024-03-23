import { useEffect, useState } from "react";

export default function useLatch<V>(value: V): V {
  const [latchedValue, setLatchedValue] = useState(value);

  useEffect(() => {
    if (!value) return;

    setLatchedValue(value);
  }, [value]);

  return latchedValue;
}
