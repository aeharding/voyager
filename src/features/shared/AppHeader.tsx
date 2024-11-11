// eslint-disable-next-line no-restricted-imports
import { IonHeader } from "@ionic/react";
import { ComponentProps } from "react";
import { LongPressCallback, useLongPress } from "use-long-press";

import { setUserDarkMode } from "#/features/settings/settingsSlice";
import { onFinishStopClick } from "#/helpers/longPress";
import store from "#/store";

export default function AppHeader(props: ComponentProps<typeof IonHeader>) {
  if (props.collapse) return <IonHeader {...props} />;

  return <UncollapsedAppHeader {...props} />;
}

function UncollapsedAppHeader(props: ComponentProps<typeof AppHeader>) {
  const bind = useLongPress(onLongPressHeader, {
    cancelOnMovement: 15,
    onFinish: onFinishStopClick,
  });

  return <IonHeader {...props} {...bind()} />;
}

const onLongPressHeader: LongPressCallback = (e) => {
  if (e.target instanceof HTMLElement && e.target.tagName === "INPUT") return;

  const { usingSystemDarkMode, userDarkMode, quickSwitch } =
    store.getState().settings.appearance.dark;

  if (!quickSwitch) return;
  if (usingSystemDarkMode) return;

  store.dispatch(setUserDarkMode(!userDarkMode));
};
