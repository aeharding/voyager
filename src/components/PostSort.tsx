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
import { SortType } from "lemmy-js-client";
import { useAppDispatch, useAppSelector } from "../store";
import { updateSortType } from "../features/post/postSlice";
import { startCase } from "lodash";
import { useState } from "react";

export const POST_SORTS = [
  SortType.Active,
  SortType.Hot,
  SortType.New,
  SortType.MostComments,
  SortType.NewComments,
];

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
    case SortType.Hot:
      return flameOutline;
    case SortType.Active:
      return arrowUpCircleOutline;
    case SortType.New:
      return timeOutline;
    case SortType.MostComments:
      return chatbubblesOutline;
    case SortType.NewComments:
      return chatbubbleEllipsesOutline;
    case SortType.Old:
    case SortType.TopAll:
    case SortType.TopDay:
    case SortType.TopMonth:
    case SortType.TopWeek:
    case SortType.TopYear:
      return helpCircleOutline;
  }
}
