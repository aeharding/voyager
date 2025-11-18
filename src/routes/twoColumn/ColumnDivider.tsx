import { useEffect, useRef, useState } from "react";

import { useColumnWidth } from "./useColumnWidth";

import styles from "../Outlet.module.css";

interface ColumnDividerProps {
  onResize?: (width: number) => void;
}

export default function ColumnDivider({ onResize }: ColumnDividerProps) {
  const dividerRef = useRef<HTMLDivElement>(null);
  const [isResizing, setIsResizing] = useState(false);
  const [startX, setStartX] = useState(0);
  const [startWidth, setStartWidth] = useState(0);
  const { updateColumnWidth } = useColumnWidth();

  useEffect(() => {
    const handleMouseDown = (e: MouseEvent) => {
      if (e.target === dividerRef.current) {
        console.log("Mouse down on divider");
        setIsResizing(true);
        setStartX(e.clientX);

        // Get current width with fallback to default
        const currentWidthStr = getComputedStyle(
          document.documentElement,
        ).getPropertyValue("--first-column-width");
        const currentWidth = parseInt(currentWidthStr) || 520; // fallback to 520px
        console.log(
          "Current width:",
          currentWidth,
          "raw value:",
          currentWidthStr,
        );
        setStartWidth(currentWidth);

        document.body.style.cursor = "col-resize";
        document.body.style.userSelect = "none";
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return;

      const deltaX = e.clientX - startX;
      const newWidth = Math.max(300, Math.min(800, startWidth + deltaX));

      console.log("Resizing to:", newWidth, "delta:", deltaX);
      updateColumnWidth(newWidth);
      onResize?.(newWidth);
    };

    const handleMouseUp = () => {
      console.log("Mouse up, stopping resize");
      setIsResizing(false);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };

    const divider = dividerRef.current;
    if (divider) {
      divider.addEventListener("mousedown", handleMouseDown);
    }

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);

    return () => {
      if (divider) {
        divider.removeEventListener("mousedown", handleMouseDown);
      }
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isResizing, startX, startWidth, onResize, updateColumnWidth]);

  return (
    <div
      ref={dividerRef}
      className={styles.columnDivider}
      title="Drag to resize columns"
    />
  );
}
