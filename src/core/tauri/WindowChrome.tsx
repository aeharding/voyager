import { IonIcon } from "@ionic/react";
import { getCurrentWindow } from "@tauri-apps/api/window";
import {
  closeOutline,
  copyOutline,
  removeOutline,
  squareOutline,
} from "ionicons/icons";
import { useEffect, useState } from "react";

import { isTauri } from "#/helpers/device";

import styles from "./WindowChrome.module.css";

/**
 * Client-side window decorations for the Tauri desktop app.
 *
 * The native titlebar is disabled (`decorations: false` in tauri.conf.json)
 * so the app header doubles as the titlebar. This renders the window
 * controls overlay and (since Linux doesn't natively resize undecorated
 * windows — tauri#8519) invisible resize zones along the window edges.
 */
export default function WindowChrome() {
  if (!isTauri()) return;

  return <TauriWindowChrome />;
}

function TauriWindowChrome() {
  const maximized = useWindowMaximized();

  return (
    <>
      <div className={styles.controls}>
        <button
          className={styles.button}
          aria-label="Minimize"
          onClick={() => getCurrentWindow().minimize()}
        >
          <IonIcon icon={removeOutline} />
        </button>
        <button
          className={styles.button}
          aria-label={maximized ? "Restore" : "Maximize"}
          onClick={toggleMaximize}
        >
          <IonIcon
            className={styles.maximizeIcon}
            icon={maximized ? copyOutline : squareOutline}
          />
        </button>
        <button
          className={styles.button}
          aria-label="Close"
          onClick={() => getCurrentWindow().close()}
        >
          <IonIcon icon={closeOutline} />
        </button>
      </div>
      {!maximized && <ResizeEdges />}
    </>
  );
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

function useWindowMaximized() {
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
