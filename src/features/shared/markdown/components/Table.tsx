import { styled } from "@linaria/react";
import { useRef } from "react";
import { ExtraProps } from "react-markdown";

const TableContainer = styled.div`
  display: flex;
  overflow-x: auto;
  margin: 15px -1rem;
  padding: 0 1rem;
  max-width: calc(100% + 2rem);

  tbody {
    border-collapse: collapse;
  }
  td,
  th {
    padding: 4px 6px;
  }
  td {
    border: 1px solid var(--ion-color-light);
  }
  tr:first-child td {
    border-top: 0;
  }
  tr td:first-child {
    border-left: 0;
  }
  tr:last-child td {
    border-bottom: 0;
  }
  tr td:last-child {
    border-right: 0;
  }
`;

export default function Table(
  props: JSX.IntrinsicElements["table"] & ExtraProps,
) {
  const tableContainerRef = useRef<HTMLDivElement | null>(null);

  return (
    <TableContainer ref={tableContainerRef}>
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
    </TableContainer>
  );
}
