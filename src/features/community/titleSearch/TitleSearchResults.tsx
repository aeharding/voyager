import { useContext, useEffect, useMemo, useRef, useState } from "react";
import { TitleSearchContext } from "./TitleSearchProvider";
import styled from "@emotion/styled";
import { useDebounce } from "usehooks-ts";
import useClient from "../../../helpers/useClient";
import { Community, CommunityView } from "lemmy-js-client";
import { IonItem, IonList, createAnimation, useIonRouter } from "@ionic/react";
import { useAppSelector } from "../../../store";
import { notEmpty } from "../../../helpers/array";
import { uniqBy } from "lodash";
import { getHandle } from "../../../helpers/lemmy";
import { useBuildGeneralBrowseLink } from "../../../helpers/routes";

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
] as const;

type SpecialFeed = (typeof SPECIAL_FEEDS)[number];
type Result = Community | SpecialFeed;

export default function TitleSearchResults() {
  const router = useIonRouter();
  const { search, setSearch, searching, setSearching } =
    useContext(TitleSearchContext);
  const debouncedSearch = useDebounce(search, 500);
  const [searchPayload, setSearchPayload] = useState<CommunityView[]>([]);
  const client = useClient();
  const follows = useAppSelector((state) => state.auth.site?.my_user?.follows);
  const buildGeneralBrowseLink = useBuildGeneralBrowseLink();
  const [viewportHeight, setViewportHeight] = useState(
    document.documentElement.clientHeight
  );
  const contentRef = useRef<HTMLDivElement>(null);

  const results: Result[] = useMemo(() => {
    return uniqBy(
      [
        ...searchSpecialByName(SPECIAL_FEEDS, search),
        ...searchCommunityByName(
          (follows || []).map((f) => f.community),
          search
        ),
        ...searchPayload.map((p) => p.community),
      ].filter(notEmpty),
      (c) => c.id
    ).slice(0, 15);
  }, [follows, searchPayload, search]);

  useEffect(() => {
    if (!debouncedSearch) {
      setSearchPayload([]);
      return;
    }

    asyncSearch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch]);

  useEffect(() => {
    if (!searching) {
      setSearch("");
    }
  });

  useEffect(() => {
    const onResize = () => {
      // For the rare legacy browsers that don't support it
      if (!window.visualViewport || !contentRef.current) {
        return;
      }

      setViewportHeight(
        window.visualViewport.height -
          contentRef.current.getBoundingClientRect().top -
          16
      );
    };

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

  if (!searching) return null;

  return (
    <Backdrop onClick={() => setSearching(false)}>
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

                  let route;

                  if ("type" in c) {
                    route = buildGeneralBrowseLink(`/${c.type}`);
                  } else {
                    route = buildGeneralBrowseLink(`/c/${getHandle(c)}`);
                  }

                  router.push(route, undefined, undefined, undefined, () =>
                    createAnimation()
                  );
                }}
                key={c.id}
                routerDirection="none"
              >
                {"type" in c ? c.label : getHandle(c)}
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
  query: string
): Community[] {
  return communities.filter(
    (c) =>
      c.name.toLowerCase().includes(query.toLowerCase()) ||
      c.title.toLowerCase().includes(query.toLowerCase())
  );
}

function searchSpecialByName(
  specialFeeds: typeof SPECIAL_FEEDS,
  query: string
): SpecialFeed[] {
  return specialFeeds.filter(({ label }) =>
    label.toLowerCase().includes(query.toLowerCase())
  );
}
