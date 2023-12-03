import {
  ActionSheetButton,
  IonButton,
  IonIcon,
  useIonActionSheet,
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
import { useContext } from "react";
import { startCase } from "lodash";
import { SortType } from "lemmy-js-client";
import { scrollUpIfNeeded } from "../../helpers/scrollUpIfNeeded";
import { AppContext } from "../auth/AppContext";
import useSupported, { is019Sort } from "../../helpers/useSupported";
import {
  calendarNineMonths,
  calendarSingleDay,
  calendarSixMonths,
  calendarThreeMonths,
  calendarWeek,
  calendarYear,
  clockBadgeOne,
  clockBadgeSix,
  clockBadgeTwelve,
} from "../icons";
import { arrayOfAll } from "../../helpers/array";

type ExtendedSortType = SortType | "Top";

export const ALL_POST_SORTS = arrayOfAll<SortType>()([
  "Active",
  "Hot",
  "New",
  "Old",
  "TopDay",
  "TopWeek",
  "TopMonth",
  "TopYear",
  "TopAll",
  "MostComments",
  "NewComments",
  "TopHour",
  "TopSixHour",
  "TopTwelveHour",
  "TopThreeMonths",
  "TopSixMonths",
  "TopNineMonths",
  "Controversial",
  "Scaled",
]);

const POST_SORTS = [
  "Active",
  "Hot",
  "Top",
  "New",
  "Controversial",
  "Scaled",
  "MostComments",
  "NewComments",
] as const;

const TOP_POST_SORTS = [
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

interface PostSortProps {
  sort: SortType;
  setSort: (sort: SortType) => void;
}

export default function PostSort({ sort, setSort }: PostSortProps) {
  const { activePageRef } = useContext(AppContext);

  const present = useSelectPostSort((newValue) => {
    setSort(newValue);
    scrollUpIfNeeded(activePageRef?.current, 0, "auto");
  });

  return (
    <IonButton fill="default" onClick={() => present(sort)}>
      <IonIcon icon={getSortIcon(sort)} color="primary" />
    </IonButton>
  );
}

export function useSelectPostSort(onSelected: (sort: SortType) => void) {
  const [presentInitialSortActionSheet] = useIonActionSheet();
  const [presentTopSortActionSheet] = useIonActionSheet();

  const newSorts = useSupported("v0.19 Sorts");

  const supportedSortButtons = newSorts
    ? BUTTONS
    : BUTTONS.filter(({ data }) => !is019Sort(data));

  const supportedTopSortButtons = newSorts
    ? TOP_BUTTONS
    : TOP_BUTTONS.filter(({ data }) => !is019Sort(data));

  function present(sort: SortType) {
    presentInitialSortActionSheet({
      header: "Sort by...",
      cssClass: "left-align-buttons",
      buttons: supportedSortButtons.map((b) => ({
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
      })),
      onWillDismiss: (e: CustomEvent<OverlayEventDetail<ExtendedSortType>>) => {
        if (e.detail.data === "Top") {
          presentSelectTop(sort);
          return;
        }

        if (e.detail.data) {
          onSelected(e.detail.data);
        }
      },
    });
  }

  function presentSelectTop(sort: SortType) {
    presentTopSortActionSheet({
      header: "Sort by Top for...",
      cssClass: "left-align-buttons",
      buttons: supportedTopSortButtons.map((b) => ({
        ...b,
        role: sort === b.data ? "selected" : undefined,
      })),
      onWillDismiss: (e: CustomEvent<OverlayEventDetail<SortType>>) => {
        if (e.detail.data) {
          onSelected(e.detail.data);
        }
      },
    });
  }

  return present;
}

export function getSortIcon(sort: ExtendedSortType): string {
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
      return clockBadgeOne;
    case "TopSixHour":
      return clockBadgeSix;
    case "TopTwelveHour":
      return clockBadgeTwelve;
    case "TopDay":
      return calendarSingleDay;
    case "TopMonth":
      return calendarOutline;
    case "TopWeek":
      return calendarWeek;
    case "TopYear":
      return calendarYear;
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
      return calendarNineMonths;
    case "TopSixMonths":
      return calendarSixMonths;
    case "TopThreeMonths":
      return calendarThreeMonths;
  }
}

export function formatTopLabel(sort: (typeof TOP_POST_SORTS)[number]): string {
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

export function isTopSort(
  sort: SortType,
): sort is (typeof TOP_POST_SORTS)[number] {
  return (TOP_POST_SORTS as unknown as string[]).includes(sort as string);
}
