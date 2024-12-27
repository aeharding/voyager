import { asyncNoop, noop } from "es-toolkit";
import { ComponentProps, useContext } from "react";

import { PageContext } from "#/features/auth/PageContext";
import { markRead, syncMessages } from "#/features/inbox/inboxSlice";
import { useSharedInboxActions } from "#/features/shared/sliding/internal/shared";
import store, { useAppDispatch } from "#/store";

import type { BaseSlidingDM } from "../../BaseSliding";
import GenericBaseSliding from "../GenericBaseSliding";

export default function DMActionsImpl({
  item,
  ...rest
}: ComponentProps<typeof BaseSlidingDM>) {
  const dispatch = useAppDispatch();
  const { presentPrivateMessageCompose } = useContext(PageContext);

  const shared = useSharedInboxActions(item);

  return (
    <GenericBaseSliding
      onVote={async () => {
        await dispatch(markRead(item, true));
      }}
      currentVote={0}
      reply={async () => {
        await presentPrivateMessageCompose({
          private_message: {
            recipient:
              item.private_message.creator_id ===
              store.getState().site.response?.my_user?.local_user_view
                ?.local_user?.person_id
                ? item.recipient
                : item.creator,
          },
        });

        await dispatch(markRead(item, true));
        dispatch(syncMessages());
      }}
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
