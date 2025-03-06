import React, { useRef } from "react";
import { ExtraProps } from "react-markdown";

import styles from "./Table.module.css";

export default function Table(
  props: React.JSX.IntrinsicElements["table"] & ExtraProps,
) {
  const tableContainerRef = useRef<HTMLDivElement | null>(null);

  return (
    <div className={styles.tableContainer} ref={tableContainerRef}>
      <table
        {...props}
        // Prevent swiping item to allow scrolling table
        onTouchMoveCapture={(e) => {
          const el = tableContainerRef.current;

          // Only prevent swipe actions if table is scrollable
          if (el && el.scrollWidth > el.clientWidth) e.stopPropagation();

          return true;
        }}
      />
    </div>
  );
}
