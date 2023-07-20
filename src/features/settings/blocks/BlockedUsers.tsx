import {
  IonItemOption,
  IonItemOptions,
  IonItemSliding,
  IonLabel,
  IonList,
  IonLoading,
} from "@ionic/react";
import { InsetIonItem } from "../../../pages/profile/ProfileFeedItemsPage";
import { useAppDispatch, useAppSelector } from "../../../store";
import { useState } from "react";
import { getHandle } from "../../../helpers/lemmy";
import { PersonBlockView } from "lemmy-js-client";
import { blockUser } from "../../user/userSlice";
import { ListHeader } from "../shared/formatting";

export default function BlockedUsers() {
  const dispatch = useAppDispatch();
  const [loading, setLoading] = useState(false);
  const users = useAppSelector(
    (state) => state.auth.site?.my_user?.person_blocks
  );

  async function remove(user: PersonBlockView) {
    setLoading(true);

    try {
      await dispatch(blockUser(false, user.target.id));
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <ListHeader>
        <IonLabel>Blocked Users</IonLabel>
      </ListHeader>
      <IonList inset>
        {users?.length ? (
          users.map((user) => (
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
