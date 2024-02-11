import {
  IonItemOption,
  IonItemOptions,
  IonItemSliding,
  IonLabel,
  IonList,
  IonLoading,
} from "@ionic/react";
import { InsetIonItem } from "../../../routes/pages/profile/ProfileFeedItemsPage";
import { useAppDispatch, useAppSelector } from "../../../store";
import { useState } from "react";
import { getHandle } from "../../../helpers/lemmy";
import { CommunityBlockView } from "lemmy-js-client";
import { blockCommunity } from "../../community/communitySlice";
import { ListHeader } from "../shared/formatting";

export default function BlockedCommunities() {
  const dispatch = useAppDispatch();
  const [loading, setLoading] = useState(false);

  const communities = useAppSelector(
    (state) => state.site.response?.my_user?.community_blocks,
  );

  const sortedCommunities = communities
    ?.slice()
    .sort((a, b) => a.community.name.localeCompare(b.community.name));

  async function remove(community: CommunityBlockView) {
    setLoading(true);

    try {
      await dispatch(blockCommunity(false, community.community.id));
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
            <IonItemSliding key={community.community.id}>
              <IonItemOptions side="end" onIonSwipe={() => remove(community)}>
                <IonItemOption
                  color="danger"
                  expandable
                  onClick={() => remove(community)}
                >
                  Unblock
                </IonItemOption>
              </IonItemOptions>
              <InsetIonItem>
                <IonLabel>{getHandle(community.community)}</IonLabel>
              </InsetIonItem>
            </IonItemSliding>
          ))
        ) : (
          <InsetIonItem>
            <IonLabel color="medium">No blocked communities</IonLabel>
          </InsetIonItem>
        )}
      </IonList>

      <IonLoading isOpen={loading} />
    </>
  );
}
