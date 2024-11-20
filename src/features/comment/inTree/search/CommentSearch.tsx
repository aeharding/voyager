import { styled } from "@linaria/react";
import { useEffect, useRef } from "react";

const SearchContainer = styled.div`
  width: 100%;
  height: 100%;

  --highlight-color: #ffc40066;
  --highlight-color-focused: #ffc400cc;

  ::highlight(search-results) {
    background-color: var(--highlight-color);
  }

  ::highlight(search-result-focused) {
    background-color: var(--highlight-color-focused);
  }
`;

export default function CommentSearchProvider({
  children,
}: React.PropsWithChildren) {
  const elRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = elRef.current;
    if (!el) return;

    const allTextNodes: Node[] = [];
    const str = "and";

    el.querySelectorAll(".collapse-md-margins").forEach((comment) => {
      const treeWalker = document.createTreeWalker(
        comment,
        NodeFilter.SHOW_TEXT,
      );

      // https://developer.mozilla.org/en-US/docs/Web/API/CSS_Custom_Highlight_API
      let currentNode = treeWalker.nextNode();
      while (currentNode) {
        allTextNodes.push(currentNode);
        currentNode = treeWalker.nextNode();
      }
    });

    const ranges = allTextNodes
      .map((el) => {
        return { el, text: el.textContent!.toLowerCase() };
      })
      .map(({ text, el }) => {
        const indices = [];
        let startPos = 0;
        while (startPos < text.length) {
          const index = text.indexOf(str, startPos);
          if (index === -1) break;
          indices.push(index);
          startPos = index + str.length;
        }

        // Create a range object for each instance of
        // str we found in the text node.
        return indices.map((index) => {
          const range = new Range();
          range.setStart(el, index);
          range.setEnd(el, index + str.length);
          return range;
        });
      })
      .flat();

    const focusedRangeIndex = 3;

    const focusedRange = ranges[focusedRangeIndex];
    if (!focusedRange) return;
    const unfocusedRanges = ranges.filter((r) => r !== focusedRange);

    // Create a Highlight object for the ranges.
    const searchResultsHighlight = new Highlight(...unfocusedRanges);
    const searchResultsHighlightFocus = new Highlight(focusedRange);

    CSS.highlights.set("search-results", searchResultsHighlight);
    CSS.highlights.set("search-result-focused", searchResultsHighlightFocus);

    return () => {
      CSS.highlights.clear();
    };
  });

  return <SearchContainer ref={elRef}>{children}</SearchContainer>;
}
