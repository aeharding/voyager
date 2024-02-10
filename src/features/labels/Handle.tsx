import { Person } from "lemmy-js-client";
import { getItemActorName } from "../../helpers/lemmy";
import { styled } from "@linaria/react";

const Aside = styled.aside`
  display: inline;
  opacity: 0.7;
`;

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
