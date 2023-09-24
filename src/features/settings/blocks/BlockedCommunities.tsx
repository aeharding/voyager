import {
  IonItemOption,
  IonItemOptions,
  IonItemSliding,
  IonLabel,
  IonList,
  IonLoading,
  IonSegment,
  IonSegmentButton,
} from "@ionic/react";
import { InsetIonItem } from "../../../pages/profile/ProfileFeedItemsPage";
import { useAppDispatch, useAppSelector } from "../../../store";
import { useState } from "react";
import { getHandle } from "../../../helpers/lemmy";
import { CommunityBlockView } from "lemmy-js-client";
import { blockCommunity } from "../../community/communitySlice";
import { ListHeader } from "../shared/formatting";

export default function BlockedCommunities() {
  const dispatch = useAppDispatch();
  const [loading, setLoading] = useState(false);
  const [sortOption, setSortOption] = useState<'default' | 'alphabetical'>('default');
  const communities = useAppSelector(
    (state) => state.auth.site?.my_user?.community_blocks
  );

  const sortedCommunities = sortOption === 'alphabetical'
    ? [...(communities || [])].sort((a, b) => a.community.name.localeCompare(b.community.name))
    : communities || [];

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
      {/* Sorting Options */}
      <IonList inset>
        <IonSegment
          value={sortOption}
          onIonChange={e => {
            setSortOption(e.detail.value as 'default' | 'alphabetical');
          }}
        >
          <IonSegmentButton value="default">
            <IonLabel>Most Recent</IonLabel>
          </IonSegmentButton>
          <IonSegmentButton value="alphabetical">
            <IonLabel>Alphabetical</IonLabel>
          </IonSegmentButton>
        </IonSegment>
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
