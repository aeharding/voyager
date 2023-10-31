import styled from "@emotion/styled";
import { MouseEvent, RefObject, TouchEvent, useRef } from "react";
import { VListHandle } from "virtua";
import useHapticFeedback from "../../../helpers/useHapticFeedback";
import { ImpactStyle } from "@capacitor/haptics";

const alphabetUpperCase = Array.from({ length: 26 }, (_, i) =>
  String.fromCharCode(65 + i),
);

const Container = styled.div`
  position: absolute;
  right: 0;
  z-index: 1;

  top: 50%;
  transform: translateY(-50%);

  display: flex;
  flex-direction: column;

  font-size: 0.75rem;
  font-weight: 500;
  color: var(--ion-color-primary);
  text-align: center;

  padding-left: 6px;
`;

interface AlphabetJumpProps {
  virtuaRef: RefObject<VListHandle>;
}

export default function AlphabetJump({ virtuaRef }: AlphabetJumpProps) {
  const sections = ["@", ".", "2", ...alphabetUpperCase];
  const containerRef = useRef<HTMLDivElement>(null);
  const prevItemRef = useRef(0);
  const vibrate = useHapticFeedback();

  const onDrag = (e: MouseEvent | TouchEvent) => {
    const y = "touches" in e ? e.touches[0].clientY : e.clientY;
    const bbox = containerRef.current?.getBoundingClientRect();
    if (!bbox) return;
    // console.log(y - bbox.top, bbox.height / sections.length);
    const section = Math.min(
      sections.length,
      Math.max(0, Math.floor((y - bbox.top) / (bbox.height / sections.length))),
    );
    if (section !== prevItemRef.current) vibrate({ style: ImpactStyle.Light });
    prevItemRef.current = section;
    virtuaRef.current?.scrollToIndex(section);
  };

  return (
    <Container ref={containerRef} onTouchMove={onDrag} onMouseMove={onDrag}>
      {sections.map((s, i) => (
        <div key={s}>{s}</div>
      ))}
    </Container>
  );
}
