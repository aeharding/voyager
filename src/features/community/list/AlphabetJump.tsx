import styled from "@emotion/styled";
import React, {
  MouseEvent,
  RefObject,
  TouchEvent,
  useMemo,
  useRef,
} from "react";
import { VListHandle } from "virtua";
import useHapticFeedback from "../../../helpers/useHapticFeedback";
import { ImpactStyle } from "@capacitor/haptics";
import { ellipseOutline, menuOutline, star } from "ionicons/icons";
import { IonIcon } from "@ionic/react";
import { notEmpty } from "../../../helpers/array";
import { findCurrentPage } from "../../../helpers/ionic";

const alphabetUpperCase = Array.from({ length: 26 }, (_, i) =>
  String.fromCharCode(65 + i),
);

const Container = styled.div`
  --line-height: 16px;

  /* position: absolute; */
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
  padding-right: 3px;

  white-space: pre;
  line-height: var(--line-height);

  ion-icon {
    height: var(--line-height);
  }
`;

interface AlphabetJumpProps {
  virtuaRef: RefObject<VListHandle>;
  hasModerated: boolean;
  hasFavorited: boolean;
  letters: string[];
}

enum SpecialSection {
  Home = 0,
  Favorited = 1,
  Moderated = 2,
}

type JumpItem = SpecialSection | string;

export default function AlphabetJump({
  virtuaRef,
  hasFavorited,
  hasModerated,
  letters,
}: AlphabetJumpProps) {
  const jumpTableLookup = useMemo(
    () =>
      buildJumpToTable(
        [
          SpecialSection.Home,
          hasFavorited ? SpecialSection.Favorited : undefined,
          hasModerated ? SpecialSection.Moderated : undefined,
          ...letters,
        ].filter(notEmpty),
        [
          SpecialSection.Home,
          SpecialSection.Favorited,
          SpecialSection.Moderated,
          ...alphabetUpperCase,
          "#",
        ].filter(notEmpty),
      ),
    [hasFavorited, hasModerated, letters],
  );

  const sections = useMemo(
    () =>
      [
        <IonIcon icon={menuOutline} key={0} />,
        <IonIcon icon={star} key={1} />,
        <IonIcon icon={ellipseOutline} key={2} />,
        ...alphabetUpperCase,
        "#",
      ].filter(notEmpty),
    [],
  );

  // Joins adjacent strings with \n to reduce items rendered
  const simplifiedSections = useMemo(
    () =>
      sections.reduce<typeof sections>((result, item, index) => {
        if (index === 0) {
          result.push(item);
        } else {
          const previousItem = result[result.length - 1];
          if (typeof previousItem === "string" && typeof item === "string") {
            // Assert that previousItem and item are strings
            result[result.length - 1] = `${previousItem}\n${item}`;
          } else {
            result.push(item);
          }
        }
        return result;
      }, []),
    [sections],
  );

  const containerRef = useRef<HTMLDivElement>(null);
  const vibrate = useHapticFeedback();

  const onDrag = (e: MouseEvent | TouchEvent) => {
    const y = "touches" in e ? e.touches[0].clientY : e.clientY;
    const bbox = containerRef.current?.getBoundingClientRect();
    if (!bbox) return;

    const sectionIndex = Math.min(
      jumpTableLookup.length,
      Math.max(
        0,
        Math.floor((y - bbox.top) / (bbox.height / jumpTableLookup.length)),
      ),
    );

    const section =
      jumpTableLookup[
        Math.max(0, Math.min(sectionIndex, jumpTableLookup.length - 1))
      ];

    const scrollView = findCurrentPage()?.querySelector(
      ".ion-content-scroll-host",
    );
    const currentScrollOfset = scrollView?.scrollTop;
    virtuaRef.current?.scrollToIndex(section);
    if (currentScrollOfset !== scrollView?.scrollTop)
      vibrate({ style: ImpactStyle.Light });
  };

  return (
    <Container
      ref={containerRef}
      onTouchMove={onDrag}
      onTouchStart={onDrag}
      onClick={onDrag}
      onMouseMove={onDrag}
      slot="fixed"
    >
      {simplifiedSections}
    </Container>
  );
}

function buildJumpToTable(partial: JumpItem[], all: JumpItem[]): number[] {
  const jumpToTable: number[] = [];

  let lastFound = 0;

  for (let i = 0; i < all.length; i++) {
    const foundIndex = partial.findIndex((p) => p === all[i]);
    if (foundIndex !== -1) lastFound = foundIndex;
    jumpToTable.push(lastFound);
  }

  return jumpToTable;
}
