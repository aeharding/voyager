import {
  IonItem,
  IonItemOption,
  IonItemOptions,
  IonItemSliding,
  IonLabel,
  IonList,
  IonLoading,
} from "@ionic/react";
import { useAppDispatch, useAppSelector } from "../../../store";
import { useState } from "react";
import { getHandle } from "../../../helpers/lemmy";
import { blockUser } from "../../user/userSlice";
import { ListHeader } from "../shared/formatting";
import { RemoveItemButton } from "../../shared/ListEditor";
import { Person } from "lemmy-js-client";

/**
 * TODO remove once we drop support for lemmy 0.19
 */
type PersonBlockView = {
  target: Person;
};

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
    ?.slice()
    .sort((a, b) => getPerson(a).name.localeCompare(getPerson(b).name));

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
