import { CommunityView } from "lemmy-js-client";

import { getHandle } from "#/helpers/lemmy";
import useClient from "#/helpers/useClient";
import { LIMIT } from "#/services/lemmy";

import GenericSelectorModal from "./GenericSelectorModal";

interface CommunitySelectorModalProps {
  onDismiss: (community?: CommunityView) => void;
}

export default function CommunitySelectorModal(
  props: CommunitySelectorModalProps,
) {
  const client = useClient();

  async function search(query: string) {
    const result = await client.search({
      q: query,
      type_: "Communities",
      sort: "TopAll",
      limit: LIMIT,
    });

    return result.communities;
  }

  return (
    <GenericSelectorModal
      search={search}
      {...props}
      getIndex={(community) => community.community.id}
      getLabel={(community) => getHandle(community.community)}
      itemSingular="Community"
      itemPlural="Communities"
    />
  );
}
