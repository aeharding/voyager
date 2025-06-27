import { CommunityView, SearchSortType } from "threadiverse";

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
    const mode = await client.getMode();

    const sort: SearchSortType = (() => {
      switch (mode) {
        case "lemmyv0":
          return { sort: "Top", mode } as const;
        case "lemmyv1":
          return { sort: "TopAll", mode } as const;
        case "piefed":
          return { sort: "TopMonth", mode } as const;
      }
    })();

    const result = await client.search({
      q: query,
      type_: "Communities",
      ...sort,
      limit: LIMIT,
    });

    return result.data as CommunityView[];
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
