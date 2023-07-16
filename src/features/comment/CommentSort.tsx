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
  timeOutline,
} from "ionicons/icons";
import { useContext, useState } from "react";
import { startCase } from "lodash";
import { CommentSortType } from "lemmy-js-client";
import { scrollUpIfNeeded } from "../../helpers/scrollUpIfNeeded";
import { AppContext } from "../auth/AppContext";

export const COMMENT_SORTS = ["Hot", "Top", "New", "Old"] as const;

const BUTTONS: ActionSheetButton<CommentSortType>[] = COMMENT_SORTS.map(
  (sortType) => ({
    text: startCase(sortType),
    data: sortType,
    icon: getSortIcon(sortType),
  })
);

interface CommentSortProps {
  sort: CommentSortType;
  setSort: (sort: CommentSortType) => void;
}

export default function CommentSort({ sort, setSort }: CommentSortProps) {
  const [open, setOpen] = useState(false);
  const { activePage } = useContext(AppContext);

  return (
    <>
      <IonButton fill="default" onClick={() => setOpen(true)}>
        <IonIcon icon={getSortIcon(sort)} color="primary" />
      </IonButton>
      <IonActionSheet
        cssClass="left-align-buttons"
        isOpen={open}
        onDidDismiss={() => setOpen(false)}
        onWillDismiss={(
          e: IonActionSheetCustomEvent<OverlayEventDetail<CommentSortType>>
        ) => {
          if (e.detail.data) {
            setSort(e.detail.data);
          }

          scrollUpIfNeeded(activePage, 1, "auto");
        }}
        header="Sort by..."
        buttons={BUTTONS.map((b) => ({
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
  }
}
