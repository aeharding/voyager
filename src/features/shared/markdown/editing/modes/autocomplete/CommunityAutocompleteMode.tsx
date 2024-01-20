import { useCallback } from "react";
import useClient from "../../../../../../helpers/useClient";
import GenericAutocompleteMode, {
  AutocompleteModeProps,
} from "./GenericAutocompleteMode";
import { Community } from "lemmy-js-client";
import { getRemoteHandle } from "../../../../../../helpers/lemmy";

export default function CommunityAutocomplete(props: AutocompleteModeProps) {
  const client = useClient();

  const fetchFn = useCallback(
    async (q: string) => {
      const { communities } = await client.search({
        q,
        type_: "Communities",
        sort: "TopAll",
      });

      return communities.map((u) => u.community);
    },
    [client],
  );

  const buildMd = useCallback((item: Community) => {
    return `[!${getRemoteHandle(item)}](${item.actor_id})`;
  }, []);

  return (
    <GenericAutocompleteMode buildMd={buildMd} fetchFn={fetchFn} {...props} />
  );
}
