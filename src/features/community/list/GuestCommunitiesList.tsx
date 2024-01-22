import { Community } from "lemmy-js-client";
import { useEffect, useState } from "react";
import ResolvedCommunitiesList from "./ResolvedCommunitiesList";
import { CenteredSpinner } from "../../../pages/posts/PostPage";
import { useAppSelector } from "../../../store";
import { clientSelector } from "../../auth/authSelectors";
import { CommunitiesListProps } from "./CommunitiesList";

/**
 * User probably just wants to see local-only communities for certain
 * instances.
 *
 * TODO in the future Local/All will be configurable in an explore view
 */
const SHOW_LOCAL_ONLY = ["lemmynsfw.com", "beehaw.org"];

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
