import { useIonActionSheet } from "@ionic/react";
import { uniq } from "es-toolkit";
import { CommentView, PostView } from "threadiverse";

import {
  buildFediRedirectLink,
  FEDI_REDIRECT_SERVICE_COMPATIBLE_HOSTS,
  getFediRedirectHostFromShareType,
  GO_VOYAGER_HOST,
  THREADIVERSE_HOST,
} from "#/features/share/fediRedirect";
import { useShare } from "#/features/share/share";
import {
  buildLemmyCommentLink,
  buildLemmyPostLink,
  isPost,
} from "#/helpers/lemmy";
import {
  buildResolveCommentFailed,
  buildResolvePostFailed,
} from "#/helpers/toastMessages";
import { parseUrl } from "#/helpers/url";
import useAppToast from "#/helpers/useAppToast";
import { getClient } from "#/services/client";
import { OPostCommentShareType } from "#/services/db";
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
      header: `Share ${isPost(itemView) ? "post" : "comment"} link via...`,
      buttons: instanceCandidates.map((instance) => ({
        text: instance,
        handler: () => {
          if (FEDI_REDIRECT_SERVICE_COMPATIBLE_HOSTS.includes(instance)) {
            const fediLink = buildFediRedirectLink(
              instance,
              (isPost(itemView) ? itemView.post : itemView.comment).ap_id,
            );
            if (fediLink) share(fediLink);
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
        let resolvedPost, resolvedComment;

        const client = getClient(instance);

        try {
          ({ post: resolvedPost, comment: resolvedComment } =
            await client.resolveObject({
              q: item.ap_id,
            }));
        } catch (error) {
          presentToast(
            isPost(itemView)
              ? buildResolvePostFailed(instance)
              : buildResolveCommentFailed(instance),
          );
          throw error;
        }

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
        const instance = parseUrl(itemView.community.actor_id)?.hostname;
        if (instance) await shareInstance(instance);
        break;
      }
      case OPostCommentShareType.Local:
        await shareInstance(connectedInstance);
        break;
      case OPostCommentShareType.Threadiverse:
      case OPostCommentShareType.DeepLink: {
        const fediRedirectHost = getFediRedirectHostFromShareType(defaultShare);
        if (!fediRedirectHost) break;

        await share(
          buildFediRedirectLink(
            fediRedirectHost,
            (isPost(itemView) ? itemView.post : itemView.comment).ap_id,
          )!,
        );
        break;
      }
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
  const candidates: string[] = [GO_VOYAGER_HOST, THREADIVERSE_HOST];

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
