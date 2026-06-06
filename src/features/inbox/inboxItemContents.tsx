import { albums, chatbubble, hammer, mail, personCircle } from "ionicons/icons";
import { ReactNode } from "react";
import { NotificationView } from "threadiverse";

import CommentMarkdown from "#/features/comment/CommentMarkdown";
import CommunityLink from "#/features/labels/links/CommunityLink";
import PersonLink from "#/features/labels/links/PersonLink";
import { renderModlogData } from "#/features/moderation/logs/ModlogItem";
import PostTitleMarkdown from "#/features/shared/markdown/PostTitleMarkdown";
import { getHandle } from "#/helpers/lemmy";
import { isPostReply } from "#/routes/pages/inbox/RepliesPage";

import { inboxModActionTitle } from "./modActionTitle";

import styles from "./InboxItem.module.css";

/** Stable id for the markdown renderer, unique per notification. */
export function getInboxItemId(item: NotificationView): string {
  return `${item.notification.kind}-${item.notification.id}`;
}

export function getInboxItemHeader(item: NotificationView): ReactNode {
  const { data } = item;

  switch (data.type_) {
    case "mod_action":
      return <strong>{inboxModActionTitle(data)}</strong>;
    case "private_message":
      return (
        <>
          <strong>{getHandle(data.creator)}</strong> sent you a private message
        </>
      );
    case "comment":
    case "post": {
      const creator = <strong>{data.creator.name}</strong>;
      const postTitle = (
        <strong>
          <PostTitleMarkdown>{data.post.name}</PostTitleMarkdown>
        </strong>
      );

      switch (item.notification.kind) {
        case "mention":
          return (
            <>
              {creator} mentioned you on the post {postTitle}
            </>
          );
        case "reply":
          if (isPostReply(item)) {
            return (
              <>
                {creator} replied to your post {postTitle}
              </>
            );
          }
          return (
            <>
              {creator} replied to your comment in {postTitle}
            </>
          );
        // Lemmy v1: a new post/comment in a community you subscribed to.
        case "subscribed":
          if (data.type_ === "post") {
            return (
              <>
                {creator} posted {postTitle}
              </>
            );
          }
          return (
            <>
              {creator} commented on {postTitle}
            </>
          );
      }
    }
  }
}

export function getInboxItemBody(item: NotificationView): ReactNode {
  const { data } = item;

  switch (data.type_) {
    case "comment":
      return (
        <CommentMarkdown id={getInboxItemId(item)}>
          {data.comment.content}
        </CommentMarkdown>
      );
    case "post":
      return (
        <CommentMarkdown id={getInboxItemId(item)}>
          {data.post.body ?? ""}
        </CommentMarkdown>
      );
    case "private_message":
      return (
        <CommentMarkdown id={getInboxItemId(item)}>
          {data.private_message.content}
        </CommentMarkdown>
      );
    case "mod_action":
      return <p>{renderModlogData(data).reason ?? "No reason provided"}</p>;
  }
}

export function getInboxItemFooterDetails(item: NotificationView): ReactNode {
  const { data } = item;

  switch (data.type_) {
    case "comment":
    case "post":
      return (
        <>
          <PersonLink
            person={data.creator}
            className={styles.label}
            showBadge={false}
            sourceUrl={getInboxItemSourceUrl(item)}
          />{" "}
          in{" "}
          <CommunityLink
            community={data.community}
            subscribed={data.subscribed}
            hideIcon
            className={styles.label}
          />
        </>
      );
    case "mod_action": {
      const community = data.target_community;
      if (!community) return undefined;
      return (
        <CommunityLink
          community={community}
          subscribed="NotSubscribed"
          hideIcon
          className={styles.label}
        />
      );
    }
    case "private_message":
      return undefined;
  }
}

export function getInboxItemLink(
  item: NotificationView,
  buildGeneralBrowseLink: (path: string) => string,
): string {
  const { data } = item;

  switch (data.type_) {
    case "comment":
      return buildGeneralBrowseLink(
        `/c/${getHandle(data.community)}/comments/${data.post.id}/${
          data.comment.path
        }`,
      );
    case "post":
      return buildGeneralBrowseLink(
        `/c/${getHandle(data.community)}/comments/${data.post.id}`,
      );
    case "private_message":
      return `/inbox/messages/${getHandle(data.creator)}`;
    case "mod_action": {
      const { link } = renderModlogData(data);
      return link ? buildGeneralBrowseLink(link) : "";
    }
  }
}

export function getInboxItemSourceUrl(
  item: NotificationView,
): string | undefined {
  const { data } = item;

  switch (data.type_) {
    case "comment":
      return data.comment.ap_id;
    case "post":
      return data.post.ap_id;
    case "private_message":
    case "mod_action":
      return undefined;
  }
}

export function getInboxItemIcon(item: NotificationView): string | undefined {
  switch (item.notification.kind) {
    case "mention":
      return personCircle;
    case "reply":
      return isPostReply(item) ? albums : chatbubble;
    case "private_message":
      return mail;
    case "subscribed":
      return item.data.type_ === "post" ? albums : chatbubble;
    // All mod_action kinds share the hammer — the title carries the specifics.
    case "mod_action":
      return hammer;
  }
}
