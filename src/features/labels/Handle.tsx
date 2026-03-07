import { Person } from "threadiverse";

import { getItemActorName } from "#/helpers/lemmy";

import styles from "./Handle.module.css";

interface HandleProps {
  showInstanceWhenRemote?: boolean;
  item: Pick<Person, "name" | "local" | "actor_id">;
}

export default function Handle(props: HandleProps) {
  return <>{...renderHandle(props)}</>;
}

export function renderHandle({ showInstanceWhenRemote, item }: HandleProps) {
  if (showInstanceWhenRemote && !item.local)
    return [
      item.name,
      <aside className={styles.aside}>@{getItemActorName(item)}</aside>,
    ];

  return [item.name];
}
