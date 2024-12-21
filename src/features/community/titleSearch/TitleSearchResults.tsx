import { IonItem, IonList } from "@ionic/react";
import { useDebouncedValue } from "@mantine/hooks";
import { compact, sortBy, uniqBy } from "es-toolkit";
import { Community, CommunityView } from "lemmy-js-client";
import {
  useContext,
  useEffect,
  experimental_useEffectEvent as useEffectEvent,
  useMemo,
  useRef,
  useState,
} from "react";

import useShowModeratorFeed from "#/features/community/list/useShowModeratorFeed";
import { getHandle } from "#/helpers/lemmy";
import { useBuildGeneralBrowseLink } from "#/helpers/routes";
import useClient from "#/helpers/useClient";
import { useOptimizedIonRouter } from "#/helpers/useOptimizedIonRouter";
import { useAppSelector } from "#/store";

import { TitleSearchContext } from "./TitleSearchProvider";

import styles from "./TitleSearchResults.module.css";

const SPECIAL_FEEDS = [
  {
    id: "home",
    type: "home",
    label: "Home",
  },
  {
    id: "all",
    type: "all",
    label: "All",
  },
  {
    id: "local",
    type: "local",
    label: "Local",
  },
  {
    id: "mod",
    type: "mod",
    label: "Moderator Posts",
  },
];

type SpecialFeed = (typeof SPECIAL_FEEDS)[number];
type Result = Community | SpecialFeed | string;

export default function TitleSearchResults() {
  const router = useOptimizedIonRouter();
  const { search, setSearch, searching, setSearching, setOnSubmit } =
    useContext(TitleSearchContext);
  const [debouncedSearch] = useDebouncedValue(search, 500);
  const [searchPayload, setSearchPayload] = useState<CommunityView[]>([]);
  const client = useClient();
  const follows = useAppSelector(
    (state) => state.site.response?.my_user?.follows,
  );
  const buildGeneralBrowseLink = useBuildGeneralBrowseLink();
  const [viewportHeight, setViewportHeight] = useState(
    document.documentElement.clientHeight,
  );
  const contentRef = useRef<HTMLDivElement>(null);
  const favorites = useAppSelector((state) => state.community.favorites);
  const moderates = useAppSelector(
    (state) => state.site.response?.my_user?.moderates,
  );
  const showModeratorFeed = useShowModeratorFeed();

  const results: Result[] = useMemo(() => {
    const results = [
      ...searchCommunityByName(
        (follows || []).map((f) => f.community),
        search,
      ),
      ...searchPayload.map((p) => p.community),
    ];

    const eligibleSpecialFeeds = SPECIAL_FEEDS.filter(
      ({ type }) => type !== "mod" || showModeratorFeed,
    );

    const moderatedAsCommunityId = moderates?.map((m) => m.community.id);

    return uniqBy(
      compact([
        ...searchSpecialByName(eligibleSpecialFeeds, search),
        ...(search
          ? sortBy(results, [
              (r) => {
                if (favorites.includes(getHandle(r))) {
                  return 0;
                }

                if (moderatedAsCommunityId?.includes(r.id)) {
                  return 1;
                }

                return 2;
              },
            ])
          : favorites),
      ]),
      (c) => (typeof c === "string" ? c : c.id),
    ).slice(0, 15);
  }, [follows, searchPayload, search, favorites, showModeratorFeed, moderates]);

  const onSelect = (c: Result) => {
    let route;

    if (typeof c === "string") {
      // favorite
      route = buildGeneralBrowseLink(`/c/${c}`);
    } else if ("type" in c) {
      route = buildGeneralBrowseLink(`/${c.type}`);
    } else {
      route = buildGeneralBrowseLink(`/c/${getHandle(c)}`);
    }

    router.push(route, "none", "replace");
  };

  const onSelectEvent = useEffectEvent(onSelect);

  useEffect(() => {
    setOnSubmit(() => {
      if (!results.length) return;

      onSelectEvent(results[0]!);
      setSearching(false);
    });
  }, [results, setSearching, setOnSubmit]);

  useEffect(() => {
    if (!searching) {
      setSearch("");
    }
  }, [searching, setSearch]);

  useEffect(() => {
    const updateViewport = () => {
      // For the rare legacy browsers that don't support it
      if (!window.visualViewport || !contentRef.current) {
        return;
      }
      setViewportHeight(
        Math.min(
          window.visualViewport.height -
            contentRef.current.getBoundingClientRect().top,
          document.documentElement.clientHeight - 200,
        ) - 16,
      );
    };

    const onResize = () => {
      updateViewport();
    };

    updateViewport();

    window.visualViewport?.addEventListener("resize", onResize);

    return () => {
      window.visualViewport?.removeEventListener("resize", onResize);
    };
  }, []);

  const asyncSearchEvent = useEffectEvent(async () => {
    const result = await client.search({
      q: debouncedSearch,
      limit: 20,
      type_: "Communities",
      listing_type: "All",
      sort: "TopAll",
    });

    setSearchPayload(result.communities);
  });

  useEffect(() => {
    if (!debouncedSearch) {
      setSearchPayload([]);
      return;
    }

    asyncSearchEvent();
  }, [debouncedSearch]);

  function renderTitle(result: Result) {
    if (typeof result === "string") return result;

    if ("type" in result) return result.label;

    return getHandle(result);
  }

  if (!searching) return null;

  return (
    <div
      className={styles.backdrop}
      onClick={() => setSearching(false)}
      slot="fixed"
    >
      <div
        className={styles.keyboardContent}
        ref={contentRef}
        style={{ maxHeight: `${viewportHeight}px` }}
      >
        <div className={styles.contents} onClick={(e) => e.stopPropagation()}>
          <IonList>
            {results.map((c) => (
              <IonItem
                onClick={() => {
                  setSearching(false);

                  onSelect(c);
                }}
                key={typeof c === "string" ? c : c.id}
                routerDirection="none"
              >
                {renderTitle(c)}
              </IonItem>
            ))}
          </IonList>
        </div>
      </div>
    </div>
  );
}

function searchCommunityByName(
  communities: Community[],
  query: string,
): Community[] {
  return communities
    .map((c) => ({
      community: c,
      score: scoreSearch([c.name, c.title], query),
    }))
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score)
    .map(({ community }) => community);
}

function searchSpecialByName(
  specialFeeds: typeof SPECIAL_FEEDS,
  query: string,
): SpecialFeed[] {
  return specialFeeds
    .map((f) => ({
      feed: f,
      score: scoreSearch([f.label], query),
    }))
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score)
    .map(({ feed }) => feed);
}

function scoreSearch(names: string[], search: string) {
  const s = search.toLowerCase();

  for (const nameRaw of names) {
    const name = nameRaw.toLowerCase();
    if (name.startsWith(s)) {
      return 2;
    } else if (name.includes(s)) {
      return 1;
    }
  }
  return 0;
}
