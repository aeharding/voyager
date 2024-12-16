import { IonList } from "@ionic/react";
import { compact, sortBy } from "es-toolkit";
import { Community } from "lemmy-js-client";
import {
  createContext,
  memo,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  CustomContainerComponent,
  CustomItemComponentProps,
  Virtualizer,
  VListHandle,
} from "virtua";

import { jwtSelector } from "#/features/auth/authSelectors";
import { cx } from "#/helpers/css";
import { getHandle } from "#/helpers/lemmy";
import { isSafariFeedHackEnabled } from "#/routes/pages/shared/FeedContent";
import { useAppSelector } from "#/store";

import AlphabetJump from "./AlphabetJump";
import Item from "./Item";
import useShowModeratorFeed from "./useShowModeratorFeed";

import styles from "./ResolvedCommunitiesList.module.css";

const OVERSCAN_AMOUNT = 3;

interface SeparatorItem {
  type: "separator";
  value: string;
}

interface SpecialItem {
  type: "home" | "all" | "local" | "mod";
}

interface CommunityItem {
  type: "community";
  value: Community;
}

interface FavoriteItem {
  type: "favorite";
  value: string | Community;
}

export type ItemType =
  | SeparatorItem
  | SpecialItem
  | CommunityItem
  | FavoriteItem;

interface CommunitiesListParams {
  actor: string;
  communities: Community[];
  onListAtTopChange?: (isAtTop: boolean) => void;
}

function ResolvedCommunitiesList({
  actor,
  communities,
  onListAtTopChange,
}: CommunitiesListParams) {
  const jwt = useAppSelector(jwtSelector);

  const virtuaRef = useRef<VListHandle>(null);
  const [shift, setShift] = useState(false);

  const moderates = useAppSelector(
    (state) => state.site.response?.my_user?.moderates,
  );

  const showModeratorFeed = useShowModeratorFeed();

  const favorites = useAppSelector((state) => state.community.favorites);

  const favoritesAsCommunitiesIfFound = useMemo(
    () =>
      favorites.map(
        (community) =>
          communities.find((c) => community === getHandle(c)) || community,
      ),
    [communities, favorites],
  );

  const communitiesGroupedByLetter = useMemo(() => {
    return sortBy(
      Object.entries(
        communities.reduce<Record<string, Community[]>>((acc, community) => {
          const firstLetter = /[0-9]/.test(community.name[0]!)
            ? "#"
            : community.name[0]!.toUpperCase();

          acc[firstLetter] ??= [];
          acc[firstLetter]!.push(community);

          return acc;
        }, {}),
      ),
      [([letter]) => (letter === "#" ? "\uffff" : letter)], // sort # at bottom
    );
  }, [communities]);

  const { items, throughFavoritesCount } = useMemo(() => {
    const favoriteItems: (FavoriteItem | SeparatorItem)[] = favorites?.length
      ? [
          { type: "separator", value: "Favorites" },
          ...favoritesAsCommunitiesIfFound.map(
            (c) => ({ type: "favorite", value: c }) as const,
          ),
        ]
      : [];

    const modItems = moderates?.length
      ? [
          { type: "separator", value: "Moderator" } as const,
          ...moderates.map(
            (c) => ({ type: "community", value: c.community }) as const,
          ),
        ]
      : [];

    const alphabetItems = communitiesGroupedByLetter.flatMap(
      ([letter, communities]) => [
        { type: "separator", value: letter } as const,
        ...communities.map((c) => ({ type: "community", value: c }) as const),
      ],
    );

    const upThroughFavorites: ItemType[] = compact([
      jwt && { type: "home" },
      { type: "all" },
      { type: "local" },
      showModeratorFeed && { type: "mod" },
      ...favoriteItems,
    ]);

    const throughFavoritesCount = upThroughFavorites.length;

    const items: ItemType[] = compact([
      ...upThroughFavorites,
      ...modItems,
      ...alphabetItems,
    ]);

    return {
      items,
      throughFavoritesCount,
    };
  }, [
    communitiesGroupedByLetter,
    favorites?.length,
    favoritesAsCommunitiesIfFound,
    jwt,
    moderates,
    showModeratorFeed,
  ]);

  const stickyIndexes = useMemo(() => {
    const indexes = new Set<number>();
    for (const [index, item] of items.entries()) {
      if ("type" in item && item.type === "separator") {
        indexes.add(index);
      }
    }
    return indexes;
  }, [items]);

  const [activeIndex, setActiveIndex] = useState(-1);

  const updateActiveIndex = useCallback(() => {
    if (!virtuaRef.current) return;
    const start = virtuaRef.current.findStartIndex();
    const activeStickyIndex =
      [...stickyIndexes].reverse().find((index) => start >= index) ?? -1;
    setActiveIndex(activeStickyIndex);
  }, [stickyIndexes]);

  useEffect(() => {
    updateActiveIndex();
  }, [updateActiveIndex]);

  return (
    <StickyIndexContext.Provider value={activeIndex}>
      <div
        className={cx(
          styles.virtualizerScrollView,
          isSafariFeedHackEnabled
            ? "virtual-scroller"
            : "ion-content-scroll-host virtual-scroller",
        )}
      >
        <Virtualizer
          shift={shift}
          ref={virtuaRef}
          overscan={OVERSCAN_AMOUNT}
          onScroll={(offset) => {
            onListAtTopChange?.(offset < 10);

            if (virtuaRef.current) {
              setShift(
                virtuaRef.current.findStartIndex() >
                  throughFavoritesCount + OVERSCAN_AMOUNT, // overscan
              );
            } else {
              setShift(false);
            }

            updateActiveIndex();
          }}
          as={IonList as CustomContainerComponent}
          keepMounted={activeIndex >= 0 ? [activeIndex] : []}
          item={StickyItem}
        >
          {items.map((item, index) => (
            <Item
              item={item}
              key={index}
              actor={actor}
              line={items[index + 1] && items[index + 1]!.type !== "separator"}
            />
          ))}
        </Virtualizer>
      </div>

      <AlphabetJump
        virtuaRef={virtuaRef}
        separators={compact(
          items.map((item, index) =>
            item.type === "separator" ? { label: item.value, index } : null,
          ),
        )}
      />
    </StickyIndexContext.Provider>
  );
}

export default memo(ResolvedCommunitiesList);

const StickyIndexContext = createContext(-1);
function StickyItem({ style, index, ...props }: CustomItemComponentProps) {
  const activeIndex = useContext(StickyIndexContext);
  return (
    <div
      {...props}
      style={{
        ...style,
        ...(activeIndex === index && {
          position: "sticky",
          top: 0,
          zIndex: 10,
        }),
      }}
    />
  );
}
