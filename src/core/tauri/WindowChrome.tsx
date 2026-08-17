import { getCurrentWindow } from "@tauri-apps/api/window";
import { useEffect, useState } from "react";

import { getPlatform } from "#/helpers/device";
import store, { useAppSelector } from "#/store";

import styles from "./WindowChrome.module.css";

/**
 * Client-side window decorations for the Tauri desktop app.
 *
 * The native titlebar is shown by default. Users can disable the
 * "Show System Titlebar" setting (applied at runtime via setDecorations),
 * in which case the app header doubles as the titlebar (drag +
 * double-click to maximize — see TauriListener) with no window management
 * buttons. Since Linux doesn't natively resize undecorated windows
 * (tauri#8519), this renders invisible resize zones along the window
 * edges.
 */
export default function WindowChrome() {
  if (getPlatform() !== "tauri") return;

  return <TauriWindowChrome />;
}

function TauriWindowChrome() {
  const maximized = useWindowMaximized();
  const ready = useAppSelector((state) => state.settings.ready);
  const showSystemTitlebar = useAppSelector(
    (state) => state.settings.appearance.general.showSystemTitlebar,
  );

  useEffect(() => {
    if (!ready) return;

    getCurrentWindow().setDecorations(showSystemTitlebar);
  }, [ready, showSystemTitlebar]);

  if (showSystemTitlebar || maximized) return;

  return <ResizeEdges />;
}

/**
 * Tauri equivalent of Capacitor's SplashScreen.hide(): the window starts
 * hidden (visible: false in tauri.conf.json) and is revealed once the app
 * has actually mounted. No-op on other platforms, so call it wherever the
 * splash screen is hidden.
 */
export async function showAppWindow() {
  if (getPlatform() !== "tauri") return;

  const win = getCurrentWindow();

  // Apply the stored titlebar preference before first paint of the window
  await win.setDecorations(
    store.getState().settings.appearance.general.showSystemTitlebar,
  );

  await win.show();
}

/**
 * Explicit maximize/unmaximize instead of toggleMaximize
 * (restore-by-toggle is buggy on Linux — tauri#11945)
 */
export async function toggleMaximize() {
  const win = getCurrentWindow();

  if (await win.isMaximized()) win.unmaximize();
  else win.maximize();
}

export function useWindowMaximized() {
  const [maximized, setMaximized] = useState(false);

  useEffect(() => {
    const win = getCurrentWindow();

    win.isMaximized().then(setMaximized);

    const unlistenPromise = win.onResized(async () => {
      setMaximized(await win.isMaximized());
    });

    return () => {
      unlistenPromise.then((unlisten) => unlisten());
    };
  }, []);

  return maximized;
}

const EDGES = [
  { direction: "North", className: styles.n },
  { direction: "South", className: styles.s },
  { direction: "East", className: styles.e },
  { direction: "West", className: styles.w },
  { direction: "NorthEast", className: styles.ne },
  { direction: "NorthWest", className: styles.nw },
  { direction: "SouthEast", className: styles.se },
  { direction: "SouthWest", className: styles.sw },
] as const;

function ResizeEdges() {
  return EDGES.map(({ direction, className }) => (
    <div
      key={direction}
      className={className}
      onMouseDown={(event) => {
        if (event.button !== 0) return;

        getCurrentWindow().startResizeDragging(direction);
      }}
    />
  ));
}
