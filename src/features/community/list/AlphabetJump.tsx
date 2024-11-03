import { ImpactStyle } from "@capacitor/haptics";
import { IonIcon } from "@ionic/react";
import { styled } from "@linaria/react";
import { ellipseOutline, menuOutline, star } from "ionicons/icons";
import { compact } from "lodash";
import { MouseEvent, RefObject, TouchEvent, useMemo, useRef } from "react";
import { VListHandle } from "virtua";

import { findCurrentPage } from "#/helpers/ionic";
import useHapticFeedback from "#/helpers/useHapticFeedback";

const alphabetUpperCase = Array.from({ length: 26 }, (_, i) =>
  String.fromCharCode(65 + i),
);

const SpecialSection = {
  Home: 0,
  Favorited: 1,
  Moderated: 2,
} as const;

type SpecialSectionType = (typeof SpecialSection)[keyof typeof SpecialSection];

type JumpItem = SpecialSectionType | string;

const SECTIONS = [
  <IonIcon icon={menuOutline} key={0} />,
  <IonIcon icon={star} key={1} />,
  <IonIcon icon={ellipseOutline} key={2} />,
  ...alphabetUpperCase,
  "#",
];

// Joins adjacent strings with \n to reduce items rendered
const SIMPLIFIED_SECTIONS = SECTIONS.reduce<typeof SECTIONS>(
  (result, item, index) => {
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
  },
  [],
);

export const HIDE_ALPHABET_JUMP =
  "(max-height: 600px) and (orientation: landscape)" as const;

const Container = styled.div`
  --line-height: 15px;

  position: absolute;
  right: env(safe-area-inset-right);
  z-index: 1;

  top: 50%;
  transform: translateY(-50%);

  display: flex;
  flex-direction: column;

  font-size: 0.7rem;
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

  @media ${HIDE_ALPHABET_JUMP} {
    display: none;
  }
`;

interface AlphabetJumpProps {
  virtuaRef: RefObject<VListHandle>;
  hasModerated: boolean;
  hasFavorited: boolean;
  letters: string[];
}

export default function AlphabetJump({
  virtuaRef,
  hasFavorited,
  hasModerated,
  letters,
}: AlphabetJumpProps) {
  const containerElTopRef = useRef<DOMRect | undefined>();
  const scrollViewRef = useRef<HTMLElement | undefined>();

  const jumpTableLookup = useMemo(
    () =>
      buildJumpToTable(
        compact([
          SpecialSection.Home,
          hasFavorited ? SpecialSection.Favorited : undefined,
          hasModerated ? SpecialSection.Moderated : undefined,
          ...letters,
        ]),
        compact([
          SpecialSection.Home,
          SpecialSection.Favorited,
          SpecialSection.Moderated,
          ...alphabetUpperCase,
          "#",
        ]),
      ),
    [hasFavorited, hasModerated, letters],
  );

  const containerRef = useRef<HTMLDivElement>(null);
  const vibrate = useHapticFeedback();

  const onStart = () => {
    containerElTopRef.current = containerRef.current?.getBoundingClientRect();
    scrollViewRef.current =
      findCurrentPage()?.querySelector(".ion-content-scroll-host") || undefined;
  };

  const onDrag = (e: MouseEvent | TouchEvent) => {
    const y = "touches" in e ? e.touches[0]!.clientY : e.clientY;
    if (!containerElTopRef.current) return;

    const sectionIndex = Math.min(
      jumpTableLookup.length,
      Math.max(
        0,
        Math.floor(
          (y - containerElTopRef.current.top) /
            (containerElTopRef.current.height / jumpTableLookup.length),
        ),
      ),
    );

    const section =
      jumpTableLookup[
        Math.max(0, Math.min(sectionIndex, jumpTableLookup.length - 1))
      ]!;

    const currentScrollOfset = scrollViewRef.current?.scrollTop;
    virtuaRef.current?.scrollToIndex(section);
    if (currentScrollOfset !== scrollViewRef.current?.scrollTop)
      vibrate({ style: ImpactStyle.Light });
  };

  return (
    <Container
      ref={containerRef}
      onTouchMove={onDrag}
      onTouchStart={(e) => {
        onStart();
        onDrag(e);
      }}
      onClick={(e) => {
        onStart();
        onDrag(e);
      }}
      onMouseOver={onStart}
      onMouseMove={onDrag}
      slot="fixed"
    >
      {SIMPLIFIED_SECTIONS}
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
