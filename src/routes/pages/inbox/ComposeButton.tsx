import { IonAlert, IonButton, IonIcon, IonLoading } from "@ionic/react";
import { createOutline } from "ionicons/icons";
import { useState } from "react";
import { useAppDispatch } from "../../../store";
import { getUser } from "../../../features/user/userSlice";
import { getHandle } from "../../../helpers/lemmy";
import useAppToast from "../../../helpers/useAppToast";
import { useOptimizedIonRouter } from "../../../helpers/useOptimizedIonRouter";
import { isLemmyError } from "../../../helpers/lemmyErrors";

export default function ComposeButton() {
  const [loading, setLoading] = useState(false);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const router = useOptimizedIonRouter();
  const dispatch = useAppDispatch();
  const presentToast = useAppToast();

  async function composeNew(handle: string) {
    setLoading(true);

    let user;

    try {
      user = await dispatch(getUser(handle));
    } catch (error) {
      presentToast({
        message: isLemmyError(error, "couldnt_find_person")
          ? `Could not find user with handle ${handle}`
          : "Server error. Please try again.",
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

          if (!e.detail.data) return;

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
        <IonIcon icon={createOutline} />
      </IonButton>
    </>
  );
}
