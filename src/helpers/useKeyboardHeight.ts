import { useEffect, useState } from "react";

export default function useKeyboardHeight() {
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  useEffect(() => {
    const updateViewport = () => {
      // For the rare legacy browsers that don't support it
      if (!window.visualViewport) {
        return;
      }
      setKeyboardHeight(window.innerHeight - window.visualViewport.height);
    };

    const onResize = () => {
      updateViewport();
    };

    updateViewport();

    window.visualViewport?.addEventListener("resize", onResize);

    return () => {
      window.visualViewport?.removeEventListener("resize", onResize);
    };
  }, []);

  return keyboardHeight;
}
