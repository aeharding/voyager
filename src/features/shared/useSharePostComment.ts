import { useIonActionSheet } from "@ionic/react";
import { uniq } from "es-toolkit";
import { CommentView, PostView } from "lemmy-js-client";

import { buildGoVoyagerLink, GO_VOYAGER_HOST } from "#/helpers/goVoyager";
import {
  buildLemmyCommentLink,
  buildLemmyPostLink,
  isPost,
} from "#/helpers/lemmy";
import { getApId } from "#/helpers/lemmyCompat";
import { useShare } from "#/helpers/share";
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

  const share = useShare();

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
          if (instance === GO_VOYAGER_HOST) {
            const voyagerLink = buildGoVoyagerLink(
              getApId(isPost(itemView) ? itemView.post : itemView.comment),
            );
            if (voyagerLink) share(voyagerLink);
            return;
          }

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
        return share(item.ap_id);
      }
      // optimization: sync way to get link at connectedInstance
      case connectedInstance: {
        return share(buildLink(instance, item.id));
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

          share(url);
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

          share(url);
        }
      }
    }
  }

  async function onShare() {
    switch (defaultShare) {
      case OPostCommentShareType.ApId:
        await share(
          isPost(itemView) ? itemView.post.ap_id : itemView.comment.ap_id,
        );
        break;
      case OPostCommentShareType.Ask:
        await onAsk();
        break;
      case OPostCommentShareType.Community: {
        const instance = parseUrl(getApId(itemView.community))?.hostname;
        if (instance) await shareInstance(instance);
        break;
      }
      case OPostCommentShareType.Local:
        await shareInstance(connectedInstance);
        break;
      case OPostCommentShareType.DeepLink:
        await share(
          buildGoVoyagerLink(
            getApId(isPost(itemView) ? itemView.post : itemView.comment),
          )!,
        );
        break;
    }
  }

  return {
    onAsk,
    share: onShare,
  };
}

function generateInstanceCandidates(
  postOrComment: PostView | CommentView,
  connectedInstance: string,
) {
  const candidates: string[] = [GO_VOYAGER_HOST];

  candidates.push(connectedInstance);

  const communityActorHostname = parseUrl(
    getApId(postOrComment.community),
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
