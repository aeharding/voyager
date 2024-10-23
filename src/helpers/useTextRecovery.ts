import { useIonAlert } from "@ionic/react";
import { useEffect, useRef } from "react";

export const TEXT_RECOVERY_KEY = "text-recovery";

export function getRecoveredText() {
  return localStorage.getItem(TEXT_RECOVERY_KEY);
}

export function clearRecoveredText() {
  localStorage.removeItem(TEXT_RECOVERY_KEY);
}

export default function useTextRecovery(
  text: string,
  setText: (text: string) => void,
  disabled = false,
) {
  const initializedRef = useRef(false);
  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;

    if (text || disabled) return;

    setText(getRecoveredText() ?? "");
  }, [disabled, setText, text]);

  useEffect(() => {
    if (!text || disabled) return;

    localStorage.setItem(TEXT_RECOVERY_KEY, text);
  }, [text, disabled]);
}

export function TextRecoveryStartupPrompt() {
  const presentedRef = useRef(false);
  const [presentAlert] = useIonAlert();

  useEffect(() => {
    if (presentedRef.current || !getRecoveredText()) return;

    presentedRef.current = true;

    presentAlert({
      header: "Text Recovered",
      message:
        "Apologies! It seems like the app quit and you had text partially composed. The text was saved, so just begin composing again and it'll be there waiting for you.",
      buttons: [
        {
          text: "Delete",
          role: "destructive",
          handler: () => {
            clearRecoveredText();
          },
        },
        {
          text: "OK",
        },
      ],
    });
  }, [presentAlert]);

  return null;
}
