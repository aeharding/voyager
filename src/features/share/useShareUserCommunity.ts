import { useIonActionSheet } from "@ionic/react";
import { uniq } from "es-toolkit";
import { Community, Person } from "threadiverse";

import {
  buildLemmyCommunityLink,
  buildLemmyUserLink,
  getHandle,
  isCommunity,
} from "#/helpers/lemmy";
import { parseUrl } from "#/helpers/url";
import { OPostCommentShareType } from "#/services/db/types";
import { useAppSelector } from "#/store";

import {
  buildFediRedirectLink,
  FEDI_REDIRECT_SERVICE_COMPATIBLE_HOSTS,
  getFediRedirectHostFromShareType,
  GO_VOYAGER_HOST,
} from "./fediRedirect";
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
          if (FEDI_REDIRECT_SERVICE_COMPATIBLE_HOSTS.includes(instance)) {
            const fediLink = buildFediRedirectLink(instance, item.actor_id);
            if (fediLink) share(fediLink);
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
        return share(item.actor_id);
      }
    }
  }

  async function onShare() {
    if (!item) return;

    switch (defaultShare) {
      case OPostCommentShareType.ApId:
      case OPostCommentShareType.Community: {
        await share(item.actor_id);
        break;
      }
      case OPostCommentShareType.Ask:
        await onAsk();
        break;
      case OPostCommentShareType.Local:
        await shareInstance(connectedInstance);
        break;
      case OPostCommentShareType.DeepLink:
      case OPostCommentShareType.Threadiverse: {
        const fediRedirectHost = getFediRedirectHostFromShareType(defaultShare);
        if (!fediRedirectHost) break;

        await share(buildFediRedirectLink(fediRedirectHost, item.actor_id)!);
        break;
      }
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

  const communityActorHostname = parseUrl(community.actor_id)?.hostname;
  if (communityActorHostname) candidates.push(communityActorHostname);

  return uniq(candidates);
}
