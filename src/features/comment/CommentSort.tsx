import type { IonActionSheetCustomEvent } from "@ionic/core";
import {
  ActionSheetButton,
  IonActionSheet,
  IonButton,
  IonIcon,
} from "@ionic/react";
import { OverlayEventDetail } from "@ionic/react/dist/types/components/react-component-lib/interfaces";
import {
  arrowUpCircleOutline,
  flameOutline,
  hourglassOutline,
  skullOutline,
  timeOutline,
} from "ionicons/icons";
import { useContext, useState } from "react";
import { startCase } from "lodash";
import { CommentSortType } from "lemmy-js-client";
import { scrollUpIfNeeded } from "../../helpers/scrollUpIfNeeded";
import { AppContext } from "../auth/AppContext";
import useSupported, { is019Sort } from "../../helpers/useSupported";

export const COMMENT_SORTS = [
  "Hot",
  "Top",
  "New",
  "Controversial",
  "Old",
] as const;

const BUTTONS: ActionSheetButton<CommentSortType>[] = COMMENT_SORTS.map(
  (sortType) => ({
    text: startCase(sortType),
    data: sortType,
    icon: getSortIcon(sortType),
  }),
);

interface CommentSortProps {
  sort: CommentSortType;
  setSort: (sort: CommentSortType) => void;
}

export default function CommentSort({ sort, setSort }: CommentSortProps) {
  const [open, setOpen] = useState(false);
  const { activePageRef } = useContext(AppContext);
  const controversialSupported = useSupported("v0.19 Sorts");

  const supportedSortButtons = controversialSupported
    ? BUTTONS
    : BUTTONS.filter(({ data }) => !is019Sort(data));

  return (
    <>
      <IonButton onClick={() => setOpen(true)}>
        <IonIcon icon={getSortIcon(sort)} slot="icon-only" />
      </IonButton>
      <IonActionSheet
        cssClass="left-align-buttons"
        isOpen={open}
        onDidDismiss={() => setOpen(false)}
        onWillDismiss={(
          e: IonActionSheetCustomEvent<OverlayEventDetail<CommentSortType>>,
        ) => {
          if (!e.detail.data) return;

          setSort(e.detail.data);
          scrollUpIfNeeded(activePageRef?.current, 1, "auto");
        }}
        header="Sort by..."
        buttons={supportedSortButtons.map((b) => ({
          ...b,
          role: sort === b.data ? "selected" : undefined,
        }))}
      />
    </>
  );
}

export function getSortIcon(sort: CommentSortType): string {
  switch (sort) {
    case "Hot":
      return flameOutline;
    case "Top":
      return arrowUpCircleOutline;
    case "New":
      return timeOutline;
    case "Old":
      return hourglassOutline;
    case "Controversial":
      return skullOutline;
  }
}
