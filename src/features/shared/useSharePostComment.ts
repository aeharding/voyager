import { useIonActionSheet } from "@ionic/react";
import { uniq } from "es-toolkit";
import { CommentView, PostView } from "lemmy-js-client";

import { isNative } from "#/helpers/device";
import {
  buildLemmyCommentLink,
  buildLemmyPostLink,
  isPost,
} from "#/helpers/lemmy";
import { shareUrl } from "#/helpers/share";
import {
  buildResolveCommentFailed,
  buildResolvePostFailed,
} from "#/helpers/toastMessages";
import { parseUrl } from "#/helpers/url";
import useAppToast from "#/helpers/useAppToast";
import { OPostCommentShareType } from "#/services/db";
import { getClient } from "#/services/lemmy";
import { useAppSelector } from "#/store";

export function useSharePostComment(itemView: PostView | CommentView) {
  const defaultShare = useAppSelector(
    (state) => state.settings.general.defaultShare,
  );
  const connectedInstance = useAppSelector(
    (state) => state.auth.connectedInstance,
  );
  const presentToast = useAppToast();
  const [presentActionSheet] = useIonActionSheet();

  function onAsk() {
    const instanceCandidates = generateInstanceCandidates(
      itemView,
      connectedInstance,
    );

    presentActionSheet({
      header: "Share post link via...",
      buttons: instanceCandidates.map((instance) => ({
        text: instance,
        handler: () => {
          shareInstance(instance);
        },
      })),
    });
  }

  async function shareInstance(instance: string) {
    const item = isPost(itemView) ? itemView.post : itemView.comment;
    const buildLink = isPost(itemView)
      ? buildLemmyPostLink
      : buildLemmyCommentLink;

    // not in switch because React Compiler complains:
    // Todo: (BuildHIR::node.lowerReorderableExpression) Expression type `OptionalMemberExpression` cannot be safely reordered (57:57)
    const apHostname = parseUrl(item.ap_id)?.hostname;

    switch (instance) {
      // optimization: sync way to get link at ap_id instance
      case apHostname: {
        return shareFromUrl(item.ap_id);
      }
      // optimization: sync way to get link at connectedInstance
      case connectedInstance: {
        return shareFromUrl(buildLink(instance, item.id));
      }
      default: {
        const { post: resolvedPost, comment: resolvedComment } =
          await getClient(instance).resolveObject({
            q: item.ap_id,
          });

        if (isPost(itemView)) {
          if (!resolvedPost) {
            presentToast(buildResolvePostFailed(instance));
            return;
          }

          const _resolvedPost = resolvedPost;

          const url = buildLemmyPostLink(instance, _resolvedPost.post.id);

          shareFromUrl(url);
        } else {
          if (!resolvedComment) {
            presentToast(buildResolveCommentFailed(instance));
            return;
          }

          const _resolvedComment = resolvedComment;

          const url = buildLemmyCommentLink(
            instance,
            _resolvedComment.comment.id,
          );

          shareFromUrl(url);
        }
      }
    }
  }

  async function shareFromUrl(url: string) {
    try {
      await shareUrl(url);
    } catch (error) {
      if (isNative()) throw error;

      if (error instanceof DOMException) {
        switch (error.name) {
          case "NotAllowedError":
            presentToast({
              message: `Tap to share`,
              onClick: () => shareFromUrl(url),
            });
            return;
          case "AbortError":
            return;
        }
      }

      await copyToClipboard(url);

      return;
    }
  }

  async function share() {
    switch (defaultShare) {
      case OPostCommentShareType.ApId:
        await shareFromUrl(
          isPost(itemView) ? itemView.post.ap_id : itemView.comment.ap_id,
        );
        break;
      case OPostCommentShareType.Ask:
        await onAsk();
        break;
      case OPostCommentShareType.Community: {
        const instance = parseUrl(itemView.community.actor_id)?.hostname;
        if (instance) await shareInstance(instance);
        break;
      }
      case OPostCommentShareType.Local:
        await shareInstance(connectedInstance);
        break;
    }
  }

  async function copyToClipboard(url: string) {
    try {
      await navigator.clipboard.writeText(url);
    } catch (error) {
      if (error instanceof DOMException && error.name === "NotAllowedError") {
        presentToast({
          message: `Tap to copy`,
          onClick: () => shareFromUrl(url),
        });
        return;
      }

      throw error;
    }

    presentToast({
      message: "Copied link!",
    });
  }

  return {
    onAsk,
    share,
  };
}

function generateInstanceCandidates(
  postOrComment: PostView | CommentView,
  connectedInstance: string,
) {
  const candidates: string[] = [];

  candidates.push(connectedInstance);

  const communityActorHostname = parseUrl(
    postOrComment.community.actor_id,
  )?.hostname;
  if (communityActorHostname) candidates.push(communityActorHostname);

  // ap_id is the same instance as user's instance
  let apId: string;
  if (isPost(postOrComment)) {
    apId = postOrComment.post.ap_id;
  } else {
    apId = postOrComment.comment.ap_id;
  }
  const apHostname = parseUrl(apId)?.hostname;
  if (apHostname) candidates.push(apHostname);

  return uniq(candidates);
}
