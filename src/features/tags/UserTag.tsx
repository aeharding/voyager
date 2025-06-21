import { useIonAlert } from "@ionic/react";
import React from "react";
import { Person } from "threadiverse";

import { getTextColorFor } from "#/helpers/color";
import { stopIonicTapClick } from "#/helpers/ionic";
import { getRemoteHandle } from "#/helpers/lemmy";
import type { UserTag } from "#/services/db";
import { useAppSelector } from "#/store";

import styles from "./UserTag.module.css";

interface BaseUserTagProps {
  prefix?: React.ReactNode;
  children?: (props?: { el: React.ReactNode; tag: UserTag }) => React.ReactNode;
}

interface SyncUserTagProps extends BaseUserTagProps {
  tag: UserTag;
}

interface AsyncUserTagProps extends BaseUserTagProps {
  person: Person;
}

type UserTagProps = SyncUserTagProps | AsyncUserTagProps;

export default function UserTag(props: UserTagProps) {
  function renderFallback() {
    if (!("tag" in props)) return props.children?.();
    return <SyncUserTag tag={props.tag}>{props.children}</SyncUserTag>;
  }

  const remoteHandle =
    "tag" in props ? props.tag.handle : getRemoteHandle(props.person);

  return (
    <StoreUserTag
      {...props}
      renderFallback={renderFallback}
      remoteHandle={remoteHandle}
    >
      {props.children}
    </StoreUserTag>
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
  children,
}: StoreUserTagProps) {
  const tag = useAppSelector(
    (state) => state.userTag.tagByRemoteHandle[remoteHandle],
  );

  if (!tag || tag === "pending") return renderFallback?.();

  return (
    <>
      {prefix}
      <SyncUserTag tag={tag}>{children}</SyncUserTag>
    </>
  );
}

function SyncUserTag({ tag, children }: SyncUserTagProps) {
  const [present] = useIonAlert();

  if (!tag.text) return children?.();

  function isEllipsed(
    e: React.TouchEvent<HTMLSpanElement> | React.MouseEvent<HTMLSpanElement>,
  ) {
    return (
      e.target instanceof HTMLElement &&
      e.target.offsetWidth < e.target.scrollWidth
    );
  }

  // if tag is ellipsed, show via alert on tap
  function onClick(e: React.MouseEvent<HTMLSpanElement>) {
    if (!isEllipsed(e)) return;

    e.stopPropagation();

    present({
      header: "Flair",
      message: tag.text!,
      buttons: ["OK"],
    });
  }

  // don't know until tapped if it is ellipsed (not reactive),
  // so can't change element to a button when ellipsed
  function onInteractionStart(
    e: React.TouchEvent<HTMLSpanElement> | React.MouseEvent<HTMLSpanElement>,
  ) {
    if (!isEllipsed(e)) return;

    stopIonicTapClick();
  }

  const el = (
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
      onTouchStart={onInteractionStart}
      onMouseDown={onInteractionStart}
      onClick={onClick}
    >
      {tag.text}
    </span>
  );

  if (!children) return el;

  return children({
    el,
    tag,
  });
}
