import { IonRefresher, IonRefresherContent } from "@ionic/react";
import { CommunityView } from "lemmy-js-client";

import { getCommunity } from "#/features/community/communitySlice";
import { getHandle } from "#/helpers/lemmy";
import { useAppDispatch, useAppSelector } from "#/store";

import GenericSidebar from "./GenericSidebar";

interface CommunitySidebarProps {
  community: CommunityView;
}

export default function CommunitySidebar({ community }: CommunitySidebarProps) {
  const dispatch = useAppDispatch();
  const mods = useAppSelector(
    (state) => state.community.modsByHandle[getHandle(community.community)],
  );

  return (
    <>
      <IonRefresher
        slot="fixed"
        onIonRefresh={async (e) => {
          try {
            await dispatch(getCommunity(getHandle(community.community)));
          } finally {
            e.detail.complete();
          }
        }}
      >
        <IonRefresherContent />
      </IonRefresher>

      <GenericSidebar
        type="community"
        sidebar={
          community.community.description ??
          "**No community description available**"
        }
        people={mods?.map((m) => m.moderator) ?? []}
        counts={community.counts}
        banner={community.community.banner}
        name={`c/${getHandle(community.community)}`}
        id={community.community.actor_id}
      />
    </>
  );
}
