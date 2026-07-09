import { getCurrentWindow } from "@tauri-apps/api/window";
import { useEffect, useState } from "react";

import { getPlatform } from "#/helpers/device";
import { useAppSelector } from "#/store";

import styles from "./WindowChrome.module.css";

/**
 * Client-side window decorations for the Tauri desktop app.
 *
 * The native titlebar is disabled by default (`decorations: false` in
 * tauri.conf.json) so the app header doubles as the titlebar (drag +
 * double-click to maximize — see TauriListener). Since Linux doesn't
 * natively resize undecorated windows (tauri#8519), this renders invisible
 * resize zones along the window edges.
 *
 * There are intentionally no window management buttons. Users who want
 * them can enable the "Show System Titlebar" setting, applied at runtime
 * via setDecorations.
 */
export default function WindowChrome() {
  if (getPlatform() !== "tauri") return;

  return <TauriWindowChrome />;
}

function TauriWindowChrome() {
  const maximized = useWindowMaximized();
  const showSystemTitlebar = useAppSelector(
    (state) => state.settings.appearance.general.showSystemTitlebar,
  );

  useEffect(() => {
    getCurrentWindow().setDecorations(showSystemTitlebar);
  }, [showSystemTitlebar]);

  if (showSystemTitlebar || maximized) return;

  return <ResizeEdges />;
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
