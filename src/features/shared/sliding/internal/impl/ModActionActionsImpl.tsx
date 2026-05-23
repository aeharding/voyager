import { asyncNoop, noop } from "es-toolkit";
import { ComponentProps } from "react";

import { useSharedInboxActions } from "#/features/shared/sliding/internal/shared";

import type { BaseSlidingModAction } from "../../BaseSliding";
import GenericBaseSliding from "../GenericBaseSliding";

/**
 * mod_action notifications have no underlying votable/repliable item — but the
 * swipe gestures still need to render to stay consistent with the rest of the
 * inbox list. Vote/reply/save slides no-op; mark-read/unread works via the
 * shared inbox actions.
 */
export default function ModActionActionsImpl({
  notification,
  ...rest
}: ComponentProps<typeof BaseSlidingModAction>) {
  const shared = useSharedInboxActions(notification);

  return (
    <GenericBaseSliding
      onVote={asyncNoop}
      currentVote={0}
      reply={asyncNoop}
      collapse={noop}
      collapseRootComment={noop}
      save={asyncNoop}
      isHidden={false}
      shareTrigger={noop}
      isSaved={false}
      {...shared}
      {...rest}
    />
  );
}
