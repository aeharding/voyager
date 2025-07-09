import { Person, PersonView } from "threadiverse";

import { getRemoteHandle } from "#/helpers/lemmy";
import { getTopAllSearchSort } from "#/helpers/threadiverse";
import useClient from "#/helpers/useClient";

import GenericAutocompleteMode, {
  AutocompleteModeProps,
} from "./GenericAutocompleteMode";

export default function UsernameAutocompleteMode(props: AutocompleteModeProps) {
  const client = useClient();

  async function fetchFn(q: string) {
    const { data: users } = await client.search({
      q,
      type_: "Users",
      ...getTopAllSearchSort(await client.getMode()),
    });

    return (users as PersonView[]).map((u) => u.person);
  }

  function buildMd(item: Person) {
    return `[${props.prefix}${getRemoteHandle(item)}](${item.actor_id})`;
  }

  return (
    <GenericAutocompleteMode buildMd={buildMd} fetchFn={fetchFn} {...props} />
  );
}
