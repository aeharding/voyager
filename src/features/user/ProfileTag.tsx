import { useEffect } from "react";
import { Person } from "threadiverse";

import UserTag from "#/features/tags/UserTag";
import { fetchTagsForHandles } from "#/features/tags/userTagSlice";
import { getRemoteHandle } from "#/helpers/lemmy";
import { useAppDispatch, useAppSelector } from "#/store";

import styles from "./ProfileTag.module.css";

export default function ProfileTag({ person }: { person: Person }) {
  const dispatch = useAppDispatch();
  const tagsEnabled = useAppSelector((state) => state.settings.tags.enabled);
  const remoteHandle = getRemoteHandle(person);

  useEffect(() => {
    if (!tagsEnabled) return;

    dispatch(fetchTagsForHandles([remoteHandle]));
  }, [dispatch, remoteHandle, tagsEnabled]);

  if (!tagsEnabled) return null;

  return (
    <UserTag person={person}>
      {(tag) => tag && <div className={styles.tag}>{tag.el}</div>}
    </UserTag>
  );
}
