import { createContext } from "react";
import type { ModalOptions } from "@ionic/core/components";
import { HookOverlayOptions } from "@ionic/react/dist/types/hooks/HookOverlayOptions";

type ModalHandler = (
  options?: Omit<ModalOptions, "component" | "componentProps"> &
    HookOverlayOptions
) => void;

interface ModalContext {
  login: ModalHandler;
}
// todo
export const ModalContext = createContext<ModalContext>({
  login: () => {},
}); // the login modal needs to be (almost?) everywhere, so it is easier to simply provide it from the App level
