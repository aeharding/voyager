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
  barChartOutline,
  calendarOutline,
  chatbubbleEllipsesOutline,
  chatbubblesOutline,
  flameOutline,
  helpCircleOutline,
  timeOutline,
} from "ionicons/icons";
import { useAppDispatch, useAppSelector } from "../../store";
import { updateSortType } from "../post/postSlice";
import { useState } from "react";
import { startCase } from "lodash";
import { SortType } from "lemmy-js-client";

type ExtendedSortType = SortType | "Top";

export const POST_SORTS = [
  "Active",
  "Hot",
  "Top",
  "New",
  "MostComments",
  "NewComments",
] as const;

export const TOP_POST_SORTS = [
  "TopHour",
  "TopSixHour",
  "TopTwelveHour",
  "TopDay",
  "TopWeek",
  "TopMonth",
  "TopYear",
  "TopAll",
] as const;

const BUTTONS: ActionSheetButton<ExtendedSortType>[] = POST_SORTS.map(
  (sortType) => ({
    text: startCase(sortType),
    data: sortType,
    icon: getSortIcon(sortType),
  })
);

const TOP_BUTTONS: ActionSheetButton<SortType>[] = TOP_POST_SORTS.map(
  (sortType) => ({
    text: formatTopLabel(sortType),
    data: sortType,
    icon: getSortIcon(sortType),
  })
);

export default function PostSort() {
  const dispatch = useAppDispatch();
  const sort = useAppSelector((state) => state.post.sort);
  const [open, setOpen] = useState(false);
  const [topOpen, setTopOpen] = useState(false);

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
          e: IonActionSheetCustomEvent<OverlayEventDetail<ExtendedSortType>>
        ) => {
          if (e.detail.data === "Top") {
            setTopOpen(true);
            return;
          }
          if (e.detail.data) {
            dispatch(updateSortType(e.detail.data));
          }
        }}
        header="Sort by..."
        buttons={BUTTONS.map((b) => ({
          ...b,
          cssClass: b.data === "Top" ? "detail" : undefined,
          role:
            sort === b.data || (sort.startsWith("Top") && b.data === "Top")
              ? "selected"
              : undefined,
        }))}
      />
      <IonActionSheet
        cssClass="left-align-buttons"
        isOpen={topOpen}
        onDidDismiss={() => setTopOpen(false)}
        onWillDismiss={(
          e: IonActionSheetCustomEvent<OverlayEventDetail<SortType>>
        ) => {
          if (e.detail.data) {
            dispatch(updateSortType(e.detail.data));
          }
        }}
        header="Sort by Top for..."
        buttons={TOP_BUTTONS.map((b) => ({
          ...b,
          role: sort === b.data ? "selected" : undefined,
        }))}
      />
    </>
  );
}

function getSortIcon(sort: ExtendedSortType): string {
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
    case "TopHour":
    case "TopSixHour":
    case "TopTwelveHour":
    case "TopDay":
    case "TopMonth":
    case "TopWeek":
    case "TopYear":
    case "TopAll":
      return calendarOutline;
    case "Top":
      return barChartOutline;
    case "Old":
      return helpCircleOutline;
  }
}

function formatTopLabel(sort: (typeof TOP_POST_SORTS)[number]): string {
  switch (sort) {
    case "TopHour":
      return "Hour";
    case "TopSixHour":
      return "6 Hours";
    case "TopTwelveHour":
      return "12 Hours";
    case "TopDay":
      return "Day";
    case "TopMonth":
      return "Month";
    case "TopWeek":
      return "Week";
    case "TopYear":
      return "Year";
    case "TopAll":
      return "All Time";
  }
}
