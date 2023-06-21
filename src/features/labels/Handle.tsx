const Aside = styled.aside`
  display: inline;
  opacity: 0.7;
`;

import { Person } from "lemmy-js-client";
import { getItemActorName } from "../../helpers/lemmy";
import styled from "@emotion/styled";

interface HandleProps {
  showInstanceWhenRemote?: boolean;
  item: Pick<Person, "name" | "local" | "actor_id">;
}

export default function Handle({ showInstanceWhenRemote, item }: HandleProps) {
  return showInstanceWhenRemote ? (
    <>
      {item.name}
      {!item.local && <Aside>@{getItemActorName(item)}</Aside>}
    </>
  ) : (
    item.name
  );
}
