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
  skullOutline,
  timeOutline,
  trendingUpOutline,
  trophyOutline,
} from "ionicons/icons";

import calendarWeekIconSvg from "./icons/calendarWeek.svg";
import calendarSingleDaySvg from "./icons/calendarSingleDay.svg";
import calendarNineMonthsSvg from "./icons/calendarNineMonths.svg";
import calendarSixMonthsSvg from "./icons/calendarSixMonths.svg";
import calendarThreeMonthsSvg from "./icons/calendarThreeMonths.svg";
import clockBadgeOneSvg from "./icons/clockBadgeOne.svg";
import clockBadgeSixSvg from "./icons/clockBadgeSix.svg";
import clockBadgeTwelveSvg from "./icons/clockBadgeTwelve.svg";
import calendarYearSvg from "./icons/calendarYear.svg";

import { useAppDispatch, useAppSelector } from "../../store";
import { updateSortType } from "../post/postSlice";
import { useContext, useState } from "react";
import { startCase } from "lodash";
import { SortType } from "lemmy-js-client";
import { scrollUpIfNeeded } from "../../helpers/scrollUpIfNeeded";
import { AppContext } from "../auth/AppContext";
import useSupported, { is019Sort } from "../../helpers/useSupported";

type ExtendedSortType = SortType | "Top";

export const POST_SORTS = [
  "Active",
  "Hot",
  "Top",
  "New",
  "Controversial",
  "Scaled",
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
  "TopThreeMonths",
  "TopSixMonths",
  "TopNineMonths",
  "TopYear",
  "TopAll",
] as const;

const BUTTONS: ActionSheetButton<ExtendedSortType>[] = POST_SORTS.map(
  (sortType) => ({
    text: startCase(sortType),
    data: sortType,
    icon: getSortIcon(sortType),
  }),
);

const TOP_BUTTONS: ActionSheetButton<SortType>[] = TOP_POST_SORTS.map(
  (sortType) => ({
    text: formatTopLabel(sortType),
    data: sortType,
    icon: getSortIcon(sortType),
  }),
);

export default function PostSort() {
  const dispatch = useAppDispatch();
  const sort = useAppSelector((state) => state.post.sort);
  const [open, setOpen] = useState(false);
  const [topOpen, setTopOpen] = useState(false);
  const { activePageRef } = useContext(AppContext);
  const newSorts = useSupported("v0.19 Sorts");

  const supportedSortButtons = newSorts
    ? BUTTONS
    : BUTTONS.filter(({ data }) => !is019Sort(data));

  const supportedTopSortButtons = newSorts
    ? TOP_BUTTONS
    : TOP_BUTTONS.filter(({ data }) => !is019Sort(data));

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
          e: IonActionSheetCustomEvent<OverlayEventDetail<ExtendedSortType>>,
        ) => {
          if (e.detail.data === "Top") {
            setTopOpen(true);
            return;
          }

          if (e.detail.data) {
            dispatch(updateSortType(e.detail.data));

            scrollUpIfNeeded(activePageRef?.current, 0, "auto");
          }
        }}
        header="Sort by..."
        buttons={supportedSortButtons.map((b) => ({
          ...b,
          cssClass: b.data === "Top" ? "detail" : undefined,
          text:
            isTopSort(sort) && b.data === "Top"
              ? `${b.text} (${formatTopLabel(sort)})`
              : b.text,
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
          e: IonActionSheetCustomEvent<OverlayEventDetail<SortType>>,
        ) => {
          if (e.detail.data) {
            dispatch(updateSortType(e.detail.data));
            scrollUpIfNeeded(activePageRef?.current, 0, "auto");
          }
        }}
        header="Sort by Top for..."
        buttons={supportedTopSortButtons.map((b) => ({
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
      return clockBadgeOneSvg;
    case "TopSixHour":
      return clockBadgeSixSvg;
    case "TopTwelveHour":
      return clockBadgeTwelveSvg;
    case "TopDay":
      return calendarSingleDaySvg;
    case "TopMonth":
      return calendarOutline;
    case "TopWeek":
      return calendarWeekIconSvg;
    case "TopYear":
      return calendarYearSvg;
    case "TopAll":
      return trophyOutline;
    case "Top":
      return barChartOutline;
    case "Old":
      return helpCircleOutline;

    // lemmy v0.19 below
    case "Controversial":
      return skullOutline;
    case "Scaled":
      return trendingUpOutline;
    case "TopNineMonths":
      return calendarNineMonthsSvg;
    case "TopSixMonths":
      return calendarSixMonthsSvg;
    case "TopThreeMonths":
      return calendarThreeMonthsSvg;
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
    case "TopWeek":
      return "Week";
    case "TopMonth":
      return "Month";
    case "TopThreeMonths":
      return "3 Months";
    case "TopSixMonths":
      return "6 Months";
    case "TopNineMonths":
      return "9 Months";
    case "TopYear":
      return "Year";
    case "TopAll":
      return "All Time";
  }
}

function isTopSort(sort: SortType): sort is (typeof TOP_POST_SORTS)[number] {
  return (TOP_POST_SORTS as unknown as string[]).includes(sort as string);
}
