import { CommunityView } from "lemmy-js-client";
import useClient from "../../../helpers/useClient";
import GenericSelectorModal from "./GenericSelectorModal";
import { getHandle } from "../../../helpers/lemmy";

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
