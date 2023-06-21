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
  chatbubbleEllipsesOutline,
  chatbubblesOutline,
  flameOutline,
  helpCircleOutline,
  timeOutline,
} from "ionicons/icons";
import { useAppDispatch, useAppSelector } from "../../../store";
import { updateSortType } from "../postSlice";
import { useState } from "react";
import { startCase } from "lodash";
import { SortType } from "lemmy-js-client";

export const POST_SORTS = [
  "Active",
  "Hot",
  "New",
  "MostComments",
  "NewComments",
] as const;

const BUTTONS: ActionSheetButton<SortType>[] = POST_SORTS.map((sortType) => ({
  text: startCase(sortType),
  data: sortType,
  icon: getSortIcon(sortType),
}));

export default function PostSort() {
  const dispatch = useAppDispatch();
  const sort = useAppSelector((state) => state.post.sort);
  const [open, setOpen] = useState(false);

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
          e: IonActionSheetCustomEvent<OverlayEventDetail<SortType>>
        ) => {
          if (e.detail.data) {
            dispatch(updateSortType(e.detail.data));
          }
        }}
        header="Sort by..."
        buttons={BUTTONS}
      />
    </>
  );
}

function getSortIcon(sort: SortType): string {
  switch (sort) {
    case "Hot":
      return flameOutline;
    case "Active":
      return arrowUpCircleOutline;
    case "New":
      return timeOutline;
    case "MostComments":
      return chatbubblesOutline;
    case "NewComments":
      return chatbubbleEllipsesOutline;
    case "Old":
    case "TopAll":
    case "TopDay":
    case "TopMonth":
    case "TopWeek":
    case "TopYear":
      return helpCircleOutline;
  }
}
