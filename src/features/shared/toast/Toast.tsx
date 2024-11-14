import { Color } from "@ionic/core";
import { css } from "@linaria/core";
import { styled } from "@linaria/react";
import { useTimeout } from "@mantine/hooks";
import { noop } from "es-toolkit";
import { motion, useAnimate, useMotionValue } from "framer-motion";
import {
  MouseEvent,
  useEffect,
  experimental_useEffectEvent as useEffectEvent,
  useImperativeHandle,
  useState,
} from "react";
import { createPortal } from "react-dom";

const Container = styled.div`
  position: absolute;
  top: calc(44px + var(--ion-safe-area-top, 0px));
  left: 0;
  right: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;

  pointer-events: none;
`;

const toastStyles = css`
  pointer-events: auto;

  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  z-index: 200;
`;

const ToastContent = styled.div`
  height: 50px;
  border-radius: 16px;
  margin: 8px;

  display: flex;
  align-items: center;
  justify-content: center;

  gap: 8px;
`;

export interface ToastHandler {
  open: (options: OpenToastOptions) => void;
  close: () => void;
}

interface ToastProps extends React.PropsWithChildren {
  ref: React.RefObject<ToastHandler>;
  onClose?: () => void;
}

interface OpenToastOptions {
  content: React.ReactNode;
  duration?: number;
  onClick?: (e: MouseEvent) => void;
  fullscreen?: boolean;
  color?: Color;
}

export default function Toast({ ref, onClose }: ToastProps) {
  const [open, setOpen] = useState(false);
  const [scope, animate] = useAnimate();
  const y = useMotionValue(0);
  const [options, setOptions] = useState<OpenToastOptions>();

  const { start, clear } = useTimeout(handleClose, options?.duration ?? 3_000);

  const onCloseEvent = useEffectEvent(onClose ?? noop);

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

    const yEnd = -scope.current.clientHeight;

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
    <Container>
      <motion.div
        ref={scope}
        className={toastStyles}
        initial={{ y: "-100%" }}
        animate={{ y: "0%" }}
        style={{ y }}
        transition={{ ease: "easeInOut" }}
        onDragEnd={() => {
          if (y.get() < -10) {
            handleClose();
          } else {
            start();
          }
        }}
        onDragStart={clear}
        drag="y"
        dragConstraints={{ top: 0, bottom: 0 }}
        dragElastic={{ top: 0.5, bottom: 0 }}
      >
        <ToastContent
          onClick={options?.onClick}
          style={
            {
              backgroundColor: `var(--ion-color-${color}-shade)`,
              color: `var(--ion-color-${color}-contrast)`,
            } as React.CSSProperties
          }
        >
          {options?.content}
        </ToastContent>
      </motion.div>
    </Container>,
    document.querySelector("ion-router-outlet")!,
  );
}
