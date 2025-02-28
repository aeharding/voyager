import { Color } from "@ionic/core";
import { useTimeout } from "@mantine/hooks";
import { noop } from "es-toolkit";
import { motion, useAnimate, useMotionValue } from "motion/react";
import {
  MouseEvent,
  useEffect,
  experimental_useEffectEvent as useEffectEvent,
  useImperativeHandle,
  useState,
} from "react";
import { createPortal } from "react-dom";

import { cx } from "#/helpers/css";

import styles from "./Toast.module.css";

export interface ToastHandler {
  open: (options: OpenToastOptions) => void;
  close: () => void;
}

interface ToastProps extends React.PropsWithChildren {
  ref: React.RefObject<ToastHandler | undefined>;
  onClose?: () => void;
}

interface OpenToastOptions {
  content: React.ReactNode;
  duration?: number;
  onClick?: (e: MouseEvent) => void;
  fullscreen?: boolean;
  color?: Color;
  position?: "top" | "bottom";
}

export default function Toast({ ref, onClose }: ToastProps) {
  const [open, setOpen] = useState(false);
  const [scope, animate] = useAnimate();
  const y = useMotionValue(0);
  const [options, setOptions] = useState<OpenToastOptions>();

  const { start, clear } = useTimeout(handleClose, options?.duration ?? 3_000);

  const onCloseEvent = useEffectEvent(onClose ?? noop);
  const isBottom = options?.position === "bottom";

  useEffect(() => {
    if (open) {
      start();
    } else {
      onCloseEvent();
    }
  }, [open, start]);

  useImperativeHandle(ref, () => ({
    open: handleOpen,
    close: handleClose,
  }));

  async function handleClose() {
    clear();

    const yStart = typeof y.get() === "number" ? y.get() : 0;

    const yEnd = isBottom
      ? scope.current.clientHeight
      : -scope.current.clientHeight;

    await animate(scope.current, { y: [yStart, yEnd] }, { ease: "easeOut" });
    setOpen(false);
  }

  function handleOpen(options: OpenToastOptions) {
    setOptions(options);
    setOpen(true);
  }

  if (!open) return;

  const color = options?.color ?? "primary";

  return createPortal(
    <div
      className={cx(
        styles.container,
        options?.fullscreen && styles.fullscreen,
        isBottom && styles.bottom,
      )}
    >
      <motion.div
        ref={scope}
        className={styles.toast}
        initial={{ y: isBottom ? "100%" : "-100%" }}
        animate={{ y: "0%" }}
        style={{ y }}
        transition={{ ease: "easeInOut" }}
        onDragEnd={() => {
          if (!isBottom && y.get() < -10) {
            handleClose();
          } else if (isBottom && y.get() > 10) {
            handleClose();
          } else {
            start();
          }
        }}
        onDragStart={clear}
        drag="y"
        dragConstraints={{ top: 0, bottom: 0 }}
        dragElastic={
          isBottom ? { top: 0, bottom: 0.5 } : { top: 0.5, bottom: 0 }
        }
      >
        <div
          className={styles.toastContent}
          onClick={options?.onClick}
          style={
            {
              backgroundColor: `var(--ion-color-${color}-shade)`,
              color: `var(--ion-color-${color}-contrast)`,
            } as React.CSSProperties
          }
        >
          {options?.content}
        </div>
      </motion.div>
    </div>,
    options?.fullscreen
      ? document.body
      : document.querySelector("ion-router-outlet")!,
  );
}
