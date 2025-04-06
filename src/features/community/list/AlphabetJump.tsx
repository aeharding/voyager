import { ImpactStyle } from "@capacitor/haptics";
import { IonIcon } from "@ionic/react";
import { compact } from "es-toolkit";
import { ellipseOutline, menuOutline, star } from "ionicons/icons";
import { MouseEvent, RefObject, TouchEvent, useMemo, useRef } from "react";
import { VListHandle } from "virtua";

import { findCurrentPage } from "#/helpers/ionic";
import useHapticFeedback from "#/helpers/useHapticFeedback";

import styles from "./AlphabetJump.module.css";

const alphabetUpperCase = Array.from({ length: 26 }, (_, i) =>
  String.fromCharCode(65 + i),
);

const SpecialSection = {
  Home: 0,
  Favorited: 1,
  Moderated: 2,
} as const;

type SpecialSectionType = (typeof SpecialSection)[keyof typeof SpecialSection];

type JumpValue = SpecialSectionType | string;

type JumpItem = [JumpValue, number];

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

const LOOKUP: Record<string, SpecialSectionType> = {
  Moderator: SpecialSection.Moderated,
  Favorites: SpecialSection.Favorited,
} as const;

function mapSeparatorsToJumpSections(
  separators: { label: string; index: number }[],
): JumpItem[] {
  return compact(
    separators.map(({ label, index }) => [LOOKUP[label] ?? label, index]),
  );
}

interface AlphabetJumpProps {
  virtuaRef: RefObject<VListHandle | null>;
  separators: { label: string; index: number }[];
}

export default function AlphabetJump({
  virtuaRef,
  separators,
}: AlphabetJumpProps) {
  const containerElTopRef = useRef<DOMRect>(undefined);
  const scrollViewRef = useRef<HTMLElement>(undefined);

  const jumpTableLookup = useMemo(
    () =>
      buildJumpToTable(
        compact(mapSeparatorsToJumpSections(separators)),
        compact(
          [
            SpecialSection.Home,
            SpecialSection.Favorited,
            SpecialSection.Moderated,
            ...alphabetUpperCase,
            "#",
          ].map((value, index) => [value, index]),
        ),
      ),
    [separators],
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
    <div
      className={styles.container}
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
    </div>
  );
}

function buildJumpToTable(partial: JumpItem[], all: JumpItem[]): number[] {
  const jumpToTable: number[] = [];

  let lastFound = 0;

  for (let i = 0; i < all.length; i++) {
    const foundItem = partial.find((p) => p[0] === all[i]![0]);
    if (foundItem) lastFound = foundItem[1];
    jumpToTable.push(lastFound);
  }

  return jumpToTable;
}
