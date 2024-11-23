import { Person } from "lemmy-js-client";
import React from "react";

import { getTextColorFor } from "#/helpers/color";
import { getRemoteHandle } from "#/helpers/lemmy";
import type { UserTag } from "#/services/db";
import { useAppSelector } from "#/store";

import styles from "./UserTag.module.css";

type UserTagProps =
  | SyncUserTagProps
  | {
      person: Person;
    };

interface BaseUserTagProps {
  prefix?: React.ReactNode;
  person?: Person;
}

export default function UserTag(props: UserTagProps) {
  function renderFallback() {
    if (!("tag" in props)) return;
    return <SyncUserTag tag={props.tag} />;
  }

  const remoteHandle =
    "tag" in props ? props.tag.handle : getRemoteHandle(props.person);

  return (
    <StoreUserTag
      {...props}
      renderFallback={renderFallback}
      remoteHandle={remoteHandle}
    />
  );
}

interface StoreUserTagProps extends BaseUserTagProps {
  remoteHandle: string;
  renderFallback?: () => React.ReactNode;
}

function StoreUserTag({
  remoteHandle,
  renderFallback,
  prefix,
}: StoreUserTagProps) {
  const tag = useAppSelector(
    (state) => state.userTag.tagByRemoteHandle[remoteHandle],
  );

  if (!tag || tag === "pending") return renderFallback?.();

  return (
    <>
      {prefix}
      <SyncUserTag tag={tag} />
    </>
  );
}

interface SyncUserTagProps extends BaseUserTagProps {
  tag: UserTag;
}

function SyncUserTag({ tag }: SyncUserTagProps) {
  if (!tag.text) return;

  return (
    <span
      className={styles.tagContainer}
      style={
        tag.color
          ? {
              background: tag.color,
              color: getTextColorFor(tag.color),
            }
          : undefined
      }
    >
      {tag.text}
    </span>
  );
}
