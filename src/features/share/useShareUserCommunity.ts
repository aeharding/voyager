import { useIonActionSheet } from "@ionic/react";
import { uniq } from "es-toolkit";
import { Community, Person } from "lemmy-js-client";

import {
  buildLemmyCommunityLink,
  buildLemmyUserLink,
  getHandle,
  isCommunity,
} from "#/helpers/lemmy";
import { getApId } from "#/helpers/lemmyCompat";
import { parseUrl } from "#/helpers/url";
import { OPostCommentShareType } from "#/services/db";
import { useAppSelector } from "#/store";

import { buildGoVoyagerLink, GO_VOYAGER_HOST } from "./goVoyager";
import { useShare } from "./share";

export default function useShareUserCommunity(
  item: Community | Person | undefined,
) {
  const defaultShare = useAppSelector(
    (state) => state.settings.general.defaultShare,
  );
  const connectedInstance = useAppSelector(
    (state) => state.auth.connectedInstance,
  );
  const [presentActionSheet] = useIonActionSheet();

  const share = useShare();

  function onAsk() {
    if (!item) return;

    const instanceCandidates = generateUserCommunityInstanceCandidates(
      item,
      connectedInstance,
    );

    presentActionSheet({
      header: `Share ${isCommunity(item) ? "community" : "user"} link via...`,
      buttons: instanceCandidates.map((instance) => ({
        text: instance,
        handler: () => {
          if (instance === GO_VOYAGER_HOST) {
            const voyagerLink = buildGoVoyagerLink(getApId(item));
            if (voyagerLink) share(voyagerLink);
            return;
          }

          shareInstance(instance);
        },
      })),
    });
  }

  async function shareInstance(instance: string) {
    if (!item) return;

    const buildLink = isCommunity(item)
      ? buildLemmyCommunityLink
      : buildLemmyUserLink;

    switch (instance) {
      case connectedInstance: {
        return share(buildLink(instance, getHandle(item)));
      }
      default: {
        return share(getApId(item));
      }
    }
  }

  async function onShare() {
    if (!item) return;

    switch (defaultShare) {
      case OPostCommentShareType.ApId:
      case OPostCommentShareType.Community: {
        await share(getApId(item));
        break;
      }
      case OPostCommentShareType.Ask:
        await onAsk();
        break;
      case OPostCommentShareType.Local:
        await shareInstance(connectedInstance);
        break;
      case OPostCommentShareType.DeepLink:
        await share(buildGoVoyagerLink(getApId(item))!);
        break;
    }
  }

  return {
    onAsk,
    share: onShare,
  };
}

function generateUserCommunityInstanceCandidates(
  community: Community | Person,
  connectedInstance: string,
) {
  const candidates: string[] = [GO_VOYAGER_HOST];

  candidates.push(connectedInstance);

  const communityActorHostname = parseUrl(getApId(community))?.hostname;
  if (communityActorHostname) candidates.push(communityActorHostname);

  return uniq(candidates);
}
