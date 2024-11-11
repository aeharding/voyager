import {
  IonItem,
  IonItemOption,
  IonItemOptions,
  IonItemSliding,
  IonLabel,
  IonList,
  IonLoading,
} from "@ionic/react";
import { Community, CommunityView } from "lemmy-js-client";
import { useState } from "react";

import { blockCommunity } from "#/features/community/communitySlice";
import { ListHeader } from "#/features/settings/shared/formatting";
import { RemoveItemButton } from "#/features/shared/ListEditor";
import { getHandle } from "#/helpers/lemmy";
import { useAppDispatch, useAppSelector } from "#/store";

/**
 * TODO remove - Lemmy 0.19 returned communityView. v0.20 returns community.
 */
function getCommunity(
  potentialCommunity: CommunityView | Community,
): Community {
  if ("community" in potentialCommunity) return potentialCommunity.community;

  return potentialCommunity;
}

export default function BlockedCommunities() {
  const dispatch = useAppDispatch();
  const [loading, setLoading] = useState(false);

  const communities = useAppSelector(
    (state) => state.site.response?.my_user?.community_blocks,
  );

  const sortedCommunities = communities
    ?.map(getCommunity)
    ?.slice()
    .sort((a, b) => a.name.localeCompare(b.name));

  async function remove(community: Community) {
    setLoading(true);

    try {
      await dispatch(blockCommunity(false, community.id));
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <ListHeader>
        <IonLabel>Blocked Communities</IonLabel>
      </ListHeader>
      <IonList inset>
        {sortedCommunities?.length ? (
          sortedCommunities.map((community) => (
            <IonItemSliding key={community.id}>
              <IonItemOptions side="end" onIonSwipe={() => remove(community)}>
                <IonItemOption
                  color="danger"
                  expandable
                  onClick={() => remove(community)}
                >
                  Unblock
                </IonItemOption>
              </IonItemOptions>
              <IonItem>
                <IonLabel>{getHandle(community)}</IonLabel>
                <RemoveItemButton />
              </IonItem>
            </IonItemSliding>
          ))
        ) : (
          <IonItem>
            <IonLabel color="medium">No blocked communities</IonLabel>
          </IonItem>
        )}
      </IonList>

      <IonLoading isOpen={loading} />
    </>
  );
}
