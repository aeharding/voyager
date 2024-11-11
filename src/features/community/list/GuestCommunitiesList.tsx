import { Community } from "lemmy-js-client";
import { useEffect, useState } from "react";

import { clientSelector } from "#/features/auth/authSelectors";
import { CenteredSpinner } from "#/features/shared/CenteredSpinner";
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

  useEffect(() => {
    (async () => {
      setCommunities(undefined);

      let communities;

      try {
        ({ communities } = await client.listCommunities({
          type_: SHOW_LOCAL_ONLY.includes(actor) ? "Local" : "All",
          sort: "TopAll",
          limit: 50,
        }));
      } catch (error) {
        setCommunities(undefined);
        throw error;
      }

      setCommunities(communities.map((c) => c.community));
    })();
  }, [client, actor]);

  if (communities === undefined) return <CenteredSpinner />;

  return <ResolvedCommunitiesList communities={communities} actor={actor} />;
}
