import { IonRefresher, IonRefresherContent } from "@ionic/react";
import { Community } from "lemmy-js-client";
import {
  useEffect,
  experimental_useEffectEvent as useEffectEvent,
  useState,
} from "react";

import { clientSelector } from "#/features/auth/authSelectors";
import useCommonPostFeedParams from "#/features/feed/useCommonPostFeedParams";
import { CenteredSpinner } from "#/features/shared/CenteredSpinner";
import useSupported from "#/helpers/useSupported";
import { isSafariFeedHackEnabled } from "#/routes/pages/shared/FeedContent";
import { useAppSelector } from "#/store";

import { CommunitiesListProps } from "./CommunitiesList";
import ResolvedCommunitiesList from "./ResolvedCommunitiesList";

/**
 * User probably just wants to see local-only communities for certain
 * instances.
 *
 * TODO in the future Local/All will be configurable in an explore view
 */
const SHOW_LOCAL_ONLY = ["lemmynsfw.com"];

export default function GuestCommunitiesList({ actor }: CommunitiesListProps) {
  const [communities, setCommunities] = useState<Community[] | undefined>();
  const client = useAppSelector(clientSelector);
  const [isListAtTop, setIsListAtTop] = useState(true);
  const commonPostFeedParams = useCommonPostFeedParams();
  const newSort = useSupported("New Sorting");

  async function update() {
    let communities;

    try {
      ({ communities } = await client.listCommunities({
        ...commonPostFeedParams,
        type_: SHOW_LOCAL_ONLY.includes(actor) ? "Local" : "All",
        // eslint-disable-next-line @typescript-eslint/no-explicit-any -- TODO: Remove any once we've migrated to lemmy-js-client v1
        sort: newSort ? ("ActiveSixMonths" as any) : "TopAll",
        limit: 50,
      }));
    } catch (error) {
      setCommunities(undefined);
      throw error;
    }

    setCommunities(communities.map((c) => c.community));
  }

  const updateEvent = useEffectEvent(update);

  useEffect(() => {
    setCommunities(undefined);

    updateEvent();
  }, [client, actor]);

  if (communities === undefined) return <CenteredSpinner />;

  return (
    <>
      <IonRefresher
        slot="fixed"
        onIonRefresh={(e) => {
          updateEvent().finally(() => e.detail.complete());
        }}
        disabled={isSafariFeedHackEnabled && !isListAtTop}
      >
        <IonRefresherContent />
      </IonRefresher>
      <ResolvedCommunitiesList
        communities={communities}
        actor={actor}
        onListAtTopChange={setIsListAtTop}
      />
    </>
  );
}
