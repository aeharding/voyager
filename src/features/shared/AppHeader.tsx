import { ComponentProps, useCallback, useEffect, useRef } from "react";
import { useLongPress } from "use-long-press";
import store from "../../store";
import { setUserDarkMode } from "../settings/settingsSlice";

// eslint-disable-next-line no-restricted-imports
import { IonHeader } from "@ionic/react";

export default function AppHeader(props: ComponentProps<typeof IonHeader>) {
  if (props.collapse) return <IonHeader {...props} />;

  return <UncondensedAppHeader {...props} />;
}

function UncondensedAppHeader(props: ComponentProps<typeof AppHeader>) {
  const headerRef = useRef<HTMLIonHeaderElement>(null);
  const cancelledTimeRef = useRef(0);

  const onLongPress = useCallback(() => {
    const { usingSystemDarkMode, userDarkMode, quickSwitch } =
      store.getState().settings.appearance.dark;

    if (!quickSwitch) return;
    if (usingSystemDarkMode) return;

    store.dispatch(setUserDarkMode(!userDarkMode));
  }, []);

  const bind = useLongPress(onLongPress, {
    cancelOnMovement: true,
    onCancel: () => {
      cancelledTimeRef.current = Date.now();
    },
  });

  useEffect(() => {
    const header = headerRef.current;
    if (!header) return;

    const onClick = (e: MouseEvent) => {
      // this isn't great, but I don't have a better solution atm
      if (Date.now() - cancelledTimeRef.current < 150) return;

      e.stopImmediatePropagation();
    };

    // can't simply react onClick. Synthetic doesn't work properly (Ionic issue?)
    header.addEventListener("click", onClick);

    return () => {
      header.removeEventListener("click", onClick);
    };
  });

  return <IonHeader {...props} {...bind()} ref={headerRef} />;
}
