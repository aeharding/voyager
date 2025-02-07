import { ActionSheetButton, OverlayEventDetail } from "@ionic/core";
import { IonIcon, useIonActionSheet } from "@ionic/react";
import { IonButton } from "@ionic/react";
import { startCase } from "es-toolkit";
import {
  albumsOutline,
  arrowUpCircleOutline,
  barChartOutline,
  calendarOutline,
  chatbubbleEllipsesOutline,
  chatbubblesOutline,
  flameOutline,
  helpCircleOutline,
  peopleCircleOutline,
  personCircleOutline,
  skullOutline,
  timeOutline,
  trendingUpOutline,
  trophyOutline,
} from "ionicons/icons";
import { CommentSortType, PostSortType } from "lemmy-js-client";
import { useContext } from "react";

import { AppContext } from "#/features/auth/AppContext";
import { SearchSortType } from "#/features/feed/sort/SearchSort";
import {
  alphabeticalAsc,
  alphabeticalDesc,
  calendarNineMonths,
  calendarSingleDay,
  calendarSixMonths,
  calendarThreeMonths,
  calendarWeek,
  calendarYear,
  clockBadgeOne,
  clockBadgeSix,
  clockBadgeTwelve,
} from "#/features/icons";
import { scrollUpIfNeeded } from "#/helpers/scrollUpIfNeeded";
import { CommunitySortType } from "#/routes/pages/search/results/CommunitySort";

export type SortOptions<S> = readonly (ChildrenSortOption<S, S> | S)[];

type HydratedSortOptions<S> = RootSortOption<S>[];

type RootSortOption<S> = SelectableSortOption<S> | ChildrenSortOption<S>;

interface ChildrenSortOption<S, C = SelectableSortOption<S>>
  extends ActionSheetButton {
  label: string;
  children: C[];
}

interface SelectableSortOption<S> extends ActionSheetButton {
  label: string;
  value: S;
}

interface UseSortOptions {
  title?: string;
}

export default function buildSort<S extends AnySort>(
  _sortOptions: SortOptions<S>,
) {
  const sortOptions = hydrateSortOptions(_sortOptions);

  return { Sort, useSelectSort, formatSort };

  interface SortProps<S> {
    sort: S | undefined;
    setSort: (sort: S) => void;
  }

  function Sort({ sort, setSort }: SortProps<S>) {
    const { activePageRef } = useContext(AppContext);

    const present = useSelectSort((newValue) => {
      setSort(newValue);
      scrollUpIfNeeded(activePageRef?.current, 0, "auto");
    });

    const sortIcon = findSortOption(sort, sortOptions)?.icon;

    return (
      <IonButton onClick={() => sort && present(sort)}>
        <IonIcon icon={sortIcon || " "} slot="icon-only" />
      </IonButton>
    );
  }

  function useSelectSort(
    onSelected: (sort: S) => void,
    options?: UseSortOptions,
  ) {
    const [presentInitialSortActionSheet] = useIonActionSheet();
    const [presentTopSortActionSheet] = useIonActionSheet();

    function present(sort: S) {
      presentInitialSortActionSheet({
        header: options?.title ?? "Sort by...",
        cssClass: "left-align-buttons",
        buttons: sortOptions.map((sortOption) => {
          const selectedChild =
            "children" in sortOption &&
            sortOption.children.find((child) => child.value === sort);
          const isSelected =
            "value" in sortOption ? sort === sortOption.value : selectedChild;

          return {
            ...sortOption,
            cssClass: "children" in sortOption ? "detail" : undefined,
            text: selectedChild
              ? `${sortOption.label} (${selectedChild.label})`
              : sortOption.label,
            role: isSelected ? "selected" : undefined,
            data: sortOption,
          };
        }),
        onWillDismiss: (
          e: CustomEvent<OverlayEventDetail<RootSortOption<S>>>,
        ) => {
          if (!e.detail.data) return;

          if ("children" in e.detail.data) {
            presentSub(e.detail.data);
          } else {
            onSelected(e.detail.data.value);
          }
        },
      });

      function presentSub(rootSort: ChildrenSortOption<S>) {
        presentTopSortActionSheet({
          header: `Sort by ${rootSort.label} for...`,
          cssClass: "left-align-buttons",
          buttons: rootSort.children.map((b) => ({
            ...b,
            data: b.value,
            text: b.label,
            role: sort === b.value ? "selected" : undefined,
          })),
          onWillDismiss: (e: CustomEvent<OverlayEventDetail<S>>) => {
            if (!e.detail.data) return;

            onSelected(e.detail.data);
          },
        });
      }
    }

    return present;
  }

  function formatSort(sort: S) {
    for (const option of sortOptions) {
      if ("children" in option) {
        const child = option.children.find((child) => child.value === sort);
        if (child) return `${option.label}: ${child.label}`;
      }

      if ("value" in option && option.value === sort) return option.label;
    }
  }
}

function findSortOption<S>(sort: S, sortOptions: HydratedSortOptions<S>) {
  return sortOptions.find((option) => {
    if ("children" in option) {
      return option.children.find((child) => child.value === sort);
    }

    return option.value === sort;
  });
}

type AnySort =
  | PostSortType
  | CommentSortType
  | SearchSortType
  | CommunitySortType;

function hydrateSortOptions<S extends AnySort>(
  _sortOptions: SortOptions<S>,
): HydratedSortOptions<S> {
  return _sortOptions.map((option) => {
    if (typeof option === "string") return hydrateSortOption(option);

    return {
      ...option,
      icon: option.icon ?? getSortIcon(option.label as AnySort),
      children: option.children.map(hydrateSortOption),
    };
  }) as HydratedSortOptions<S>;
}

function hydrateSortOption(option: AnySort): SelectableSortOption<AnySort> {
  return {
    label: formatSortLabel(option),
    icon: getSortIcon(option),
    value: option,
  } as SelectableSortOption<AnySort>;
}

export function getSortIcon(sort: AnySort): string {
  switch (sort) {
    case "Hot":
      return flameOutline;
    case "Active":
      return arrowUpCircleOutline;
    case "New":
      return timeOutline;
    case "MostComments":
    case "Comments":
      return chatbubblesOutline;
    case "NameAsc":
      return alphabeticalAsc;
    case "NameDesc":
      return alphabeticalDesc;
    case "NewComments":
      return chatbubbleEllipsesOutline;
    case "Posts":
      return albumsOutline;
    case "Subscribers":
      return peopleCircleOutline;
    case "SubscribersLocal":
      return personCircleOutline;
    case "TopHour":
      return clockBadgeOne;
    case "TopSixHour":
      return clockBadgeSix;
    case "TopTwelveHour":
      return clockBadgeTwelve;
    case "TopDay":
    case "ActiveDaily":
      return calendarSingleDay;
    case "TopMonth":
    case "ActiveMonthly":
      return calendarOutline;
    case "TopWeek":
    case "ActiveWeekly":
      return calendarWeek;
    case "TopYear":
      return calendarYear;
    case "TopAll":
      return trophyOutline;
    case "Top":
      return barChartOutline;
    case "Old":
      return helpCircleOutline;
    case "Controversial":
      return skullOutline;
    case "Scaled":
      return trendingUpOutline;
    case "TopNineMonths":
      return calendarNineMonths;
    case "TopSixMonths":
    case "ActiveSixMonths":
      return calendarSixMonths;
    case "TopThreeMonths":
      return calendarThreeMonths;
  }
}

export function formatSortLabel(sort: AnySort): string {
  switch (sort) {
    case "TopHour":
      return "Hour";
    case "TopSixHour":
      return "6 Hours";
    case "TopTwelveHour":
      return "12 Hours";
    case "TopDay":
    case "ActiveDaily":
      return "Day";
    case "TopWeek":
    case "ActiveWeekly":
      return "Week";
    case "TopMonth":
    case "ActiveMonthly":
      return "Month";
    case "TopThreeMonths":
      return "3 Months";
    case "TopSixMonths":
    case "ActiveSixMonths":
      return "6 Months";
    case "TopNineMonths":
      return "9 Months";
    case "TopYear":
      return "Year";
    case "TopAll":
      return "All Time";
    default:
      return startCase(sort);
  }
}
