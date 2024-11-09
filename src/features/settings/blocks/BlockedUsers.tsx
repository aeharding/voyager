import {
  IonItem,
  IonItemOption,
  IonItemOptions,
  IonItemSliding,
  IonLabel,
  IonList,
  IonLoading,
} from "@ionic/react";
import { Person } from "lemmy-js-client";
import { useState } from "react";

import { ListHeader } from "#/features/settings/shared/formatting";
import { RemoveItemButton } from "#/features/shared/ListEditor";
import { blockUser } from "#/features/user/userSlice";
import { getHandle } from "#/helpers/lemmy";
import { useAppDispatch, useAppSelector } from "#/store";

/**
 * TODO remove once we drop support for lemmy 0.19
 */
interface PersonBlockView {
  target: Person;
}

/**
 * TODO remove - Lemmy 0.19 returned user block view. v0.20 returns user.
 */
function getPerson(potentialPerson: PersonBlockView | Person): Person {
  if ("target" in potentialPerson) return potentialPerson.target;

  return potentialPerson;
}

export default function BlockedUsers() {
  const dispatch = useAppDispatch();
  const [loading, setLoading] = useState(false);

  const users = useAppSelector(
    (state) => state.site.response?.my_user?.person_blocks,
  );

  const sortedUsers = users
    ?.map(getPerson)
    ?.slice()
    .sort((a, b) => a.name.localeCompare(b.name));

  async function remove(user: Person) {
    setLoading(true);

    try {
      await dispatch(blockUser(false, user.id));
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
        {sortedUsers?.length ? (
          sortedUsers.map((user) => (
            <IonItemSliding key={user.id}>
              <IonItemOptions side="end" onIonSwipe={() => remove(user)}>
                <IonItemOption
                  color="danger"
                  expandable
                  onClick={() => remove(user)}
                >
                  Unblock
                </IonItemOption>
              </IonItemOptions>
              <IonItem>
                <IonLabel>{getHandle(user)}</IonLabel>
                <RemoveItemButton />
              </IonItem>
            </IonItemSliding>
          ))
        ) : (
          <IonItem>
            <IonLabel color="medium">No blocked users</IonLabel>
          </IonItem>
        )}
      </IonList>

      <IonLoading isOpen={loading} />
    </>
  );
}
