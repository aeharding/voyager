import { useEffect, useState } from "react";

export default function useKeyPressed() {
  const [pressed, setPressed] = useState(false);

  useEffect(() => {
    const handleDown = () => {
      setPressed(true);
    };
    const handleUp = () => {
      setPressed(false);
    };
    const handleVisibilityChange = () => {
      if (document.hidden) {
        setPressed(false);
      }
    };

    window.addEventListener("keydown", handleDown);
    window.addEventListener("keyup", handleUp);
    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("blur", handleUp);

    return () => {
      window.removeEventListener("keydown", handleDown);
      window.removeEventListener("keyup", handleUp);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("blur", handleUp);
    };
  }, []);

  return pressed;
}
