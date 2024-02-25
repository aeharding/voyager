import { ComponentProps, useCallback } from "react";
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
  const onLongPress = useCallback(() => {
    const { usingSystemDarkMode, userDarkMode, quickSwitch } =
      store.getState().settings.appearance.dark;

    if (!quickSwitch) return;
    if (usingSystemDarkMode) return;

    store.dispatch(setUserDarkMode(!userDarkMode));
  }, []);

  const bind = useLongPress(onLongPress, {
    cancelOnMovement: true,
    onFinish: (e) => {
      e.stopPropagation();
      e.preventDefault();
    },
  });

  return <IonHeader {...props} {...bind()} />;
}
