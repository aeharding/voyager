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
import { useEffect, useState } from "react";
import { getHandle } from "../../../helpers/lemmy";
import { PersonBlockView } from "lemmy-js-client";
import { blockUser } from "../../user/userSlice";
import { ListHeader } from "../shared/formatting";
import TabsWithoutRouting from "./BlockedSortOption";

export default function BlockedUsers() {
  const dispatch = useAppDispatch();
  const [loading, setLoading] = useState(false);
  const [sortOption, setSortOption] = useState<'default' | 'alphabetical'>('default');


  const users = useAppSelector(
    (state) => state.auth.site?.my_user?.person_blocks
  );

  const sortedUsers = sortOption === 'alphabetical'
    ? [...(users || [])].sort((a, b) => a.target.name.localeCompare(b.target.name))
    : users || [];


  async function remove(user: PersonBlockView) {
    setLoading(true);

    try {
      await dispatch(blockUser(false, user.target.id));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    console.log("Current sort option:", sortOption);
    // You can also place the sorting logic here if needed
  }, [sortOption]);

  return (
    <>
      <ListHeader style={{ marginBottom: '20px' }} className="ion-margin-bottom">
        <IonLabel>Blocked Users</IonLabel>
      </ListHeader>

      {/* Sorting Options */}
      <IonSegment
        value={sortOption}
        onIonChange={e => {
          setSortOption(e.detail.value as 'default' | 'alphabetical');
          console.log("Sort option changed to:", e.detail.value);
        }}
      >
        <IonSegmentButton value="default">
          <IonLabel>Most Recent</IonLabel>
        </IonSegmentButton>
        <IonSegmentButton value="alphabetical">
          <IonLabel>Alphabetical</IonLabel>
        </IonSegmentButton>
      </IonSegment>

      <IonList inset key={sortOption}>
        {sortedUsers?.length ? (
          sortedUsers.map((user) => (
            <IonItemSliding key={user.target.id}>
              <IonItemOptions side="end" onIonSwipe={() => remove(user)}>
                <IonItemOption
                  color="danger"
                  expandable
                  onClick={() => remove(user)}
                >
                  Unblock
                </IonItemOption>
              </IonItemOptions>
              <InsetIonItem>
                <IonLabel>{getHandle(user.target)}</IonLabel>
              </InsetIonItem>
            </IonItemSliding>
          ))
        ) : (
          <InsetIonItem>
            <IonLabel color="medium">No blocked users</IonLabel>
          </InsetIonItem>
        )}
      </IonList>

      <IonLoading isOpen={loading} />
    </>
  );
}
