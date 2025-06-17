import { useIonActionSheet } from "@ionic/react";
import { uniq } from "es-toolkit";
import { CommentView, PostView } from "lemmy-js-client";

import {
  buildGoVoyagerLink,
  GO_VOYAGER_HOST,
} from "#/features/share/fediRedirect";
import { useShare } from "#/features/share/share";
import { getDetermineSoftware } from "#/features/shared/useDetermineSoftware";
import {
  buildLemmyCommentLink,
  buildLemmyPostLink,
  isPost,
} from "#/helpers/lemmy";
import { getApId } from "#/helpers/lemmyCompat";
import {
  buildResolveCommentFailed,
  buildResolvePostFailed,
} from "#/helpers/toastMessages";
import { parseUrl } from "#/helpers/url";
import useAppToast from "#/helpers/useAppToast";
import { OPostCommentShareType } from "#/services/db";
import { getClient } from "#/services/lemmy";
import PiefedClient from "#/services/piefed/piefed";
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
    const apHostname = parseUrl(getApId(item))?.hostname;

    switch (instance) {
      // optimization: sync way to get link at ap_id instance
      case apHostname: {
        return share(getApId(item));
      }
      // optimization: sync way to get link at connectedInstance
      case connectedInstance: {
        return share(buildLink(instance, item.id));
      }
      default: {
        let resolvedPost, resolvedComment;

        const software = getDetermineSoftware(new URL(`https://${instance}`));

        const client = (() => {
          switch (software) {
            case "lemmy": {
              return getClient(instance);
            }
            case "piefed": {
              return new PiefedClient(instance);
            }
            default: {
              presentToast(
                isPost(itemView)
                  ? buildResolvePostFailed(instance)
                  : buildResolveCommentFailed(instance),
              );
              throw new Error(`Unknown software: ${software}`);
            }
          }
        })();

        try {
          ({ post: resolvedPost, comment: resolvedComment } =
            await client.resolveObject({
              q: getApId(item),
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
          isPost(itemView) ? getApId(itemView.post) : getApId(itemView.comment),
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
    apId = getApId(postOrComment.post);
  } else {
    apId = getApId(postOrComment.comment);
  }
  const apHostname = parseUrl(apId)?.hostname;
  if (apHostname) candidates.push(apHostname);

  return uniq(candidates);
}
