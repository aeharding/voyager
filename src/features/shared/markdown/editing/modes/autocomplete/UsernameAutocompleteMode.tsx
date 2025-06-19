import { Person } from "threadiverse";

import { getRemoteHandle } from "#/helpers/lemmy";
import { getApId } from "#/helpers/lemmyCompat";
import useClient from "#/helpers/useClient";

import GenericAutocompleteMode, {
  AutocompleteModeProps,
} from "./GenericAutocompleteMode";

export default function UsernameAutocompleteMode(props: AutocompleteModeProps) {
  const client = useClient();

  async function fetchFn(q: string) {
    const { users } = await client.search({
      q,
      type_: "Users",
      sort: "TopAll",
    });

    return users.map((u) => u.person);
  }

  return (
    <GenericAutocompleteMode buildMd={buildMd} fetchFn={fetchFn} {...props} />
  );
}

function buildMd(item: Person) {
  return `[@${getRemoteHandle(item)}](${getApId(item)})`;
}
