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

export default function Handle(props: HandleProps) {
  return <>{...renderHandle(props)}</>;
}

export function renderHandle({ showInstanceWhenRemote, item }: HandleProps) {
  if (showInstanceWhenRemote && !item.local)
    // eslint-disable-next-line react/jsx-key
    return [item.name, <Aside>@{getItemActorName(item)}</Aside>];

  return [item.name];
}
