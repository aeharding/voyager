import { useCallback } from "react";
import useClient from "../../../../../../helpers/useClient";
import GenericAutocompleteMode, {
  AutocompleteModeProps,
} from "./GenericAutocompleteMode";
import { Person } from "lemmy-js-client";
import { getRemoteHandle } from "../../../../../../helpers/lemmy";

export default function UsernameAutocompleteMode(props: AutocompleteModeProps) {
  const client = useClient();

  const fetchFn = useCallback(
    async (q: string) => {
      const { users } = await client.search({
        q,
        type_: "Users",
        sort: "TopAll",
      });

      return users.map((u) => u.person);
    },
    [client],
  );

  const buildMd = useCallback((item: Person) => {
    return `[@${getRemoteHandle(item)}](${item.actor_id})`;
  }, []);

  return (
    <GenericAutocompleteMode buildMd={buildMd} fetchFn={fetchFn} {...props} />
  );
}
