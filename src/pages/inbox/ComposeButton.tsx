import {
  IonAlert,
  IonButton,
  IonLoading,
  useIonRouter,
  useIonToast,
} from "@ionic/react";
import { createOutline } from "ionicons/icons";
import { useState } from "react";
import { useAppDispatch } from "../../store";
import { getUser } from "../../features/user/userSlice";
import { getHandle } from "../../helpers/lemmy";
import IonIconWrapper from "../../helpers/ionIconWrapper";

export default function ComposeButton() {
  const [loading, setLoading] = useState(false);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const router = useIonRouter();
  const dispatch = useAppDispatch();
  const [present] = useIonToast();

  async function composeNew(handle: string) {
    setLoading(true);

    let user;

    try {
      user = await dispatch(getUser(handle));
    } catch (error) {
      present({
        message:
          error === "couldnt_find_that_username_or_email"
            ? `Could not find user with handle ${handle}`
            : "Server error. Please try again.",
        duration: 3500,
        position: "bottom",
        color: "danger",
      });

      throw error;
    } finally {
      setLoading(false);
    }

    router.push(`/inbox/messages/${getHandle(user.person_view.person)}`);
  }

  return (
    <>
      <IonLoading isOpen={loading} />
      <IonAlert
        isOpen={isAlertOpen}
        header="Compose new message"
        onDidDismiss={(e) => {
          setIsAlertOpen(false);

          if (e.detail.role === "cancel") return;

          composeNew(e.detail.data.values.handle);
        }}
        inputs={[
          {
            name: "handle",
            placeholder: "user@instance",
          },
        ]}
        buttons={[{ text: "OK" }, { text: "Cancel", role: "cancel" }]}
      />
      <IonButton onClick={() => setIsAlertOpen(true)}>
        <IonIconWrapper icon={createOutline} />
      </IonButton>
    </>
  );
}
