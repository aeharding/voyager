import type { IonActionSheetCustomEvent } from "@ionic/core";
import {
  ActionSheetButton,
  IonActionSheet,
  IonButton,
  IonIcon,
} from "@ionic/react";
import { OverlayEventDetail } from "@ionic/react/dist/types/components/react-component-lib/interfaces";
import { startCase } from "es-toolkit";
import {
  earthOutline,
  homeOutline,
  peopleOutline,
  shieldCheckmarkOutline,
} from "ionicons/icons";
import { useState } from "react";
import { ListingType } from "threadiverse";

import { scrollUpIfNeeded } from "#/helpers/scrollUpIfNeeded";
import useGetAppScrollable from "#/helpers/useGetAppScrollable";

export const LISTING_TYPES = [
  "All",
  "Local",
  "Subscribed",
  "ModeratorView",
] as const;

const BUTTONS: ActionSheetButton<ListingType>[] = LISTING_TYPES.map(
  (listingType) => ({
    text: startCase(listingType),
    data: listingType,
    icon: getListingTypeIcon(listingType),
  }),
);

interface CommentSortProps {
  listingType: ListingType | undefined;
  setListingType: (listingType: ListingType) => void;
}

export default function ListingTypeFilter({
  listingType,
  setListingType,
}: CommentSortProps) {
  const [open, setOpen] = useState(false);
  const getAppScrollable = useGetAppScrollable();

  if (!listingType) return;

  return (
    <>
      <IonButton onClick={() => setOpen(true)}>
        <IonIcon icon={getListingTypeIcon(listingType)} slot="icon-only" />
      </IonButton>
      <IonActionSheet
        cssClass="left-align-buttons"
        isOpen={open}
        onDidDismiss={() => setOpen(false)}
        onWillDismiss={(
          e: IonActionSheetCustomEvent<OverlayEventDetail<ListingType>>,
        ) => {
          if (!e.detail.data) return;

          setListingType(e.detail.data);
          scrollUpIfNeeded(getAppScrollable(), 1, "auto");
        }}
        header="Filter by..."
        buttons={BUTTONS.map((b) => ({
          ...b,
          role: listingType === b.data ? "selected" : undefined,
        }))}
      />
    </>
  );
}

export function getListingTypeIcon(listingType: ListingType): string {
  switch (listingType) {
    case "All":
      return earthOutline;
    case "Local":
      return peopleOutline;
    case "Subscribed":
      return homeOutline;
    case "ModeratorView":
      return shieldCheckmarkOutline;
  }
}
