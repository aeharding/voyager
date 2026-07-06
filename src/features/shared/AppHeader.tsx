// eslint-disable-next-line no-restricted-imports
import { IonHeader, IonToolbar } from "@ionic/react";
import {
  Children,
  cloneElement,
  ComponentProps,
  isValidElement,
  ReactNode,
  use,
  useState,
} from "react";
import { LongPressCallback, useLongPress } from "use-long-press";

import WindowButtons from "#/core/tauri/WindowButtons";
import { setUserDarkMode } from "#/features/settings/settingsSlice";
import { isTauri } from "#/helpers/device";
import { onFinishStopClick } from "#/helpers/longPress";
import { OutletContext } from "#/routes/OutletProvider";
import { useIsSecondColumn } from "#/routes/twoColumn/useIsSecondColumn";
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

  if (isTauri()) return <TauriAppHeader {...props} {...bind()} />;

  return <IonHeader {...props} {...bind()} />;
}

/**
 * The Tauri desktop app has no native titlebar, so the header of the
 * rightmost column hosts the window management buttons
 */
function TauriAppHeader(props: ComponentProps<typeof IonHeader>) {
  const { isTwoColumnLayout } = use(OutletContext);
  const isSecondColumn = useIsSecondColumn();

  // Skip headers in modals — the underlying page header keeps the buttons
  const [el, setEl] = useState<HTMLElement | null>(null);
  const inModal = el ? !!el.closest("ion-modal") : true;

  const showWindowButtons = !inModal && (isSecondColumn || !isTwoColumnLayout);

  return (
    <IonHeader ref={setEl} {...props}>
      {showWindowButtons ? injectWindowButtons(props.children) : props.children}
    </IonHeader>
  );
}

function injectWindowButtons(children: ReactNode): ReactNode {
  let injected = false;

  return Children.map(children, (child) => {
    if (injected || !isValidElement(child) || child.type !== IonToolbar)
      return child;

    injected = true;

    const toolbarChildren = (child.props as ComponentProps<typeof IonToolbar>)
      .children;

    return cloneElement(
      child,
      undefined,
      ...Children.toArray(toolbarChildren),
      <WindowButtons key="window-buttons" />,
    );
  });
}

const onLongPressHeader: LongPressCallback = (e) => {
  if (e.target instanceof HTMLElement && e.target.tagName === "INPUT") return;

  const { usingSystemDarkMode, userDarkMode, quickSwitch } =
    store.getState().settings.appearance.dark;

  if (!quickSwitch) return;
  if (usingSystemDarkMode) return;

  store.dispatch(setUserDarkMode(!userDarkMode));
};
