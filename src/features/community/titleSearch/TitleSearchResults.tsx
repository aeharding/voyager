import {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { TitleSearchContext } from "./TitleSearchProvider";
import styled from "@emotion/styled";
import { useDebounce } from "usehooks-ts";
import useClient from "../../../helpers/useClient";
import { Community, CommunityView } from "lemmy-js-client";
import { IonItem, IonList } from "@ionic/react";
import { useAppSelector } from "../../../store";
import { notEmpty } from "../../../helpers/array";
import { uniqBy } from "lodash";
import { getHandle } from "../../../helpers/lemmy";
import { useBuildGeneralBrowseLink } from "../../../helpers/routes";
import { useOptimizedIonRouter } from "../../../helpers/useOptimizedIonRouter";
import useShowModeratorFeed from "../list/useShowModeratorFeed";

const Backdrop = styled.div`
  position: absolute;
  right: 0;
  top: 0;
  bottom: 0;
  left: 0;
  z-index: 100;

  background: ${({ theme }) =>
    theme.dark ? "rgba(0, 0, 0, 0.7)" : "rgba(0, 0, 0, 0.2)"};

  display: flex;
  align-items: flex-start;
  justify-content: center;
`;

const KeyboardContent = styled.div`
  display: flex;

  transition: max-height 150ms ease-out;
`;

const Contents = styled.div`
  --background: ${({ theme }) =>
    theme.dark ? "var(--ion-color-step-100)" : "var(--ion-background-color)"};

  background: var(--background);
  width: 100%;
  max-width: 500px;
  width: calc(100vw - 2rem);
  min-height: 175px;
  max-height: 450px;
  overflow: auto;
  margin: 1rem;
  border-radius: 0.5rem;

  overscroll-behavior: contain;

  ion-item {
    --ion-item-background: ${({ theme }) =>
      theme.dark ? "var(--ion-color-step-100)" : "var(--ion-background-color)"};
  }
`;

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
  const debouncedSearch = useDebounce(search, 500);
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

    return uniqBy(
      [
        ...searchSpecialByName(eligibleSpecialFeeds, search),
        ...(search ? results : favorites),
      ].filter(notEmpty),
      (c) => (typeof c === "string" ? c : c.id),
    ).slice(0, 15);
  }, [follows, searchPayload, search, favorites, showModeratorFeed]);

  useEffect(() => {
    if (!debouncedSearch) {
      setSearchPayload([]);
      return;
    }

    asyncSearch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch]);

  const onSelect = useCallback(
    (c: Result) => {
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
    },
    [buildGeneralBrowseLink, router],
  );

  useEffect(() => {
    setOnSubmit(() => {
      if (!results.length) return;

      onSelect(results[0]!);
      setSearching(false);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [results, setSearching]);

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

  async function asyncSearch() {
    const result = await client.search({
      q: debouncedSearch,
      limit: 20,
      type_: "Communities",
      listing_type: "All",
      sort: "TopAll",
    });

    setSearchPayload(result.communities);
  }

  function renderTitle(result: Result) {
    if (typeof result === "string") return result;

    if ("type" in result) return result.label;

    return getHandle(result);
  }

  if (!searching) return null;

  return (
    <Backdrop onClick={() => setSearching(false)} slot="fixed">
      <KeyboardContent
        ref={contentRef}
        style={{ maxHeight: `${viewportHeight}px` }}
      >
        <Contents onClick={(e) => e.stopPropagation()}>
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
        </Contents>
      </KeyboardContent>
    </Backdrop>
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
