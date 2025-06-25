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
  hourglassOutline,
  peopleCircleOutline,
  personCircleOutline,
  skullOutline,
  timeOutline,
  trendingUpOutline,
  trophyOutline,
} from "ionicons/icons";
import { ThreadiverseMode } from "threadiverse";

import { VgerCommentSortType } from "#/features/comment/CommentSort";
import { isControversialSort } from "#/features/feed/sort/controversialSorts";
import { VgerPostSortType } from "#/features/feed/sort/PostSort";
import { VgerSearchSortType } from "#/features/feed/sort/SearchSort";
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
import { OPTIMISTIC_MODE, useMode } from "#/helpers/threadiverse";
import useGetAppScrollable from "#/helpers/useGetAppScrollable";
import { VgerCommunitySortType } from "#/routes/pages/search/results/CommunitySort";

export type SortOptionsByMode<S> = Record<ThreadiverseMode, SortOptions<S>>;

export type SortOptions<S> = readonly (ChildrenSortOption<S, S> | S)[];

type HydratedSortOptions<S> = RootSortOption<S>[];

type RootSortOption<S> = SelectableSortOption<S> | ChildrenSortOption<S>;

interface ChildrenSortOption<S, C = SelectableSortOption<S>>
  extends ActionSheetButton {
  label: string;
  children: readonly C[];
}

interface SelectableSortOption<S> extends ActionSheetButton {
  label: string;
  value: S;
}

interface UseSortOptions {
  title?: string;
}

export default function buildSort<S extends AnyVgerSort>(
  sortOptionsByMode: SortOptionsByMode<S>,
) {
  const allSortOptions = hydrateSortOptions(
    Object.values(sortOptionsByMode).flat(),
  );

  return { Sort, useSelectSort, formatSort };

  function useSortOptions(defaultMode?: ThreadiverseMode) {
    const mode = useMode() ?? defaultMode;

    if (!mode) return [];

    return hydrateSortOptions(sortOptionsByMode[mode]);
  }

  interface SortProps<S> {
    sort: S | null | undefined;
    setSort: (sort: S) => void;
  }

  function Sort({ sort, setSort }: SortProps<S>) {
    const getAppScrollable = useGetAppScrollable();

    // Proactively assume for render until site software is resolved
    const sortOptions = useSortOptions(OPTIMISTIC_MODE);

    const present = useSelectSort((newValue) => {
      setSort(newValue);
      scrollUpIfNeeded(getAppScrollable(), 0, "auto");
    });

    if (!sort) return;

    const sortIcon = findSortOption(sort, sortOptions)?.icon;

    return (
      <IonButton onClick={() => sort && present(sort)}>
        <IonIcon icon={sortIcon ?? helpCircleOutline} slot="icon-only" />
      </IonButton>
    );
  }

  function useSelectSort(
    onSelected: (sort: S) => void,
    options?: UseSortOptions,
  ) {
    const [presentInitialSortActionSheet] = useIonActionSheet();
    const [presentTopSortActionSheet] = useIonActionSheet();

    const sortOptions = useSortOptions();

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
    for (const option of allSortOptions) {
      if ("children" in option) {
        const child = option.children.find((child) => child.value === sort);
        if (child) return `${option.label}: ${child.label}`;
      }

      if ("value" in option && option.value === sort) return option.label;
    }
  }
}

function findSortOption<S>(sort: S, sortOptions: HydratedSortOptions<S>) {
  for (const option of sortOptions) {
    if ("value" in option) {
      if (option.value === sort) return option;
    } else if ("children" in option) {
      const matchingChild = option.children.find(
        (child) => child.value === sort,
      );
      if (matchingChild) return matchingChild;
    }
  }
}

export function findSortOptionUnhydrated<S>(
  sort: S,
  sortOptions: SortOptions<S>,
) {
  for (const option of sortOptions) {
    if (typeof option === "string") {
      if (option === sort) return option;
    } else if (
      typeof option === "object" &&
      option !== null &&
      "children" in option
    ) {
      const matchingChild = option.children.find((child) => child === sort);
      if (matchingChild) return matchingChild;
    }
  }
}

export type AnyVgerSort =
  | VgerPostSortType
  | VgerCommentSortType
  | VgerSearchSortType
  | VgerCommunitySortType;

function hydrateSortOptions<S extends AnyVgerSort>(
  _sortOptions: SortOptions<S>,
): HydratedSortOptions<S> {
  return _sortOptions.map((option) => {
    if (typeof option === "string") return hydrateSortOption(option);

    return {
      ...option,
      icon: option.icon ?? getSortIcon(option.label as AnyVgerSort),
      children: option.children.map((child) => hydrateSortOption(child, true)),
    };
  }) as HydratedSortOptions<S>;
}

function hydrateSortOption(
  option: AnyVgerSort,
  nested = false,
): SelectableSortOption<AnyVgerSort> {
  return {
    label: formatSortLabel(option, nested),
    icon: getSortIcon(option),
    value: option,
  } as SelectableSortOption<AnyVgerSort>;
}

export function getSortIcon(sort: AnyVgerSort): string {
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
      return hourglassOutline;
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

  if (isControversialSort(sort)) {
    return skullOutline;
  }

  sort satisfies never;

  return helpCircleOutline;
}

export function formatSortLabel(sort: AnyVgerSort, nested = false): string {
  switch (sort) {
    case "TopHour":
    case "ControversialHour":
      return "Hour";
    case "TopSixHour":
      return "6 Hours";
    case "TopTwelveHour":
      return "12 Hours";
    case "TopDay":
    case "ActiveDaily":
    case "ControversialDay":
      return "Day";
    case "TopWeek":
    case "ActiveWeekly":
    case "ControversialWeek":
      return "Week";
    case "TopMonth":
    case "ControversialMonth":
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
    case "ControversialYear":
      return "Year";
    case "TopAll":
    case "ControversialAll":
      return nested ? "All Time" : "Controversial";
    default:
      return startCase(sort);
  }
}

// Preserve explicit array tuple (ex: Arr[0] = specific string)
export type FlattenSortOptions<T> = T extends readonly [
  infer First,
  ...infer Rest,
]
  ? First extends { children: readonly unknown[] }
    ? [...FlattenSortOptions<First["children"]>, ...FlattenSortOptions<Rest>]
    : [First, ...FlattenSortOptions<Rest>]
  : [];

export function flattenSortOptions<T extends SortOptions<unknown>>(
  options: T,
): FlattenSortOptions<T> {
  return options.flatMap((option) => {
    if (typeof option === "object" && option !== null && "children" in option) {
      return option.children;
    }

    return option;
  }) as FlattenSortOptions<T>;
}
