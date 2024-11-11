import { Community } from "lemmy-js-client";

import { getRemoteHandle } from "#/helpers/lemmy";
import useClient from "#/helpers/useClient";

import GenericAutocompleteMode, {
  AutocompleteModeProps,
} from "./GenericAutocompleteMode";

export default function CommunityAutocomplete(props: AutocompleteModeProps) {
  const client = useClient();

  const fetchFn = async (q: string) => {
    const { communities } = await client.search({
      q,
      type_: "Communities",
      sort: "TopAll",
    });

    return communities.map((u) => u.community);
  };

  return (
    <GenericAutocompleteMode buildMd={buildMd} fetchFn={fetchFn} {...props} />
  );
}

function buildMd(item: Community) {
  return `[!${getRemoteHandle(item)}](${item.actor_id})`;
}
