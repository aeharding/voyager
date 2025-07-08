import { Community, CommunityView } from "threadiverse";

import { getRemoteHandle } from "#/helpers/lemmy";
import { getTopAllSearchSort } from "#/helpers/threadiverse";
import useClient from "#/helpers/useClient";

import GenericAutocompleteMode, {
  AutocompleteModeProps,
} from "./GenericAutocompleteMode";

export default function CommunityAutocomplete(props: AutocompleteModeProps) {
  const client = useClient();

  async function fetchFn(q: string) {
    const { data } = await client.search({
      q,
      type_: "Communities",
      ...getTopAllSearchSort(await client.getMode()),
    });

    return (data as CommunityView[]).map((view) => view.community);
  }

  function buildMd(item: Community) {
    return `[${props.prefix}${getRemoteHandle(item)}](${item.actor_id})`;
  }

  return (
    <GenericAutocompleteMode buildMd={buildMd} fetchFn={fetchFn} {...props} />
  );
}
