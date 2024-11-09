import { IonButton, IonIcon, IonLoading, useIonAlert } from "@ionic/react";
import { createOutline } from "ionicons/icons";
import { useState } from "react";

import { getUser } from "#/features/user/userSlice";
import { getHandle } from "#/helpers/lemmy";
import { isLemmyError } from "#/helpers/lemmyErrors";
import useAppToast from "#/helpers/useAppToast";
import { useOptimizedIonRouter } from "#/helpers/useOptimizedIonRouter";
import { useAppDispatch } from "#/store";

export default function ComposeButton() {
  const [loading, setLoading] = useState(false);
  const router = useOptimizedIonRouter();
  const dispatch = useAppDispatch();
  const presentToast = useAppToast();
  const [presentAlert] = useIonAlert();

  async function composeNew(handle: string) {
    setLoading(true);

    let user;

    try {
      user = await dispatch(getUser(handle));
    } catch (error) {
      presentToast({
        message:
          isLemmyError(error, "couldnt_find_person" as never) || // TODO lemmy 0.19 and less support
          isLemmyError(error, "not_found")
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

  function present() {
    presentAlert({
      header: "Compose new message",
      inputs: [
        {
          name: "handle",
          placeholder: "user@instance",
        },
      ],
      buttons: [
        {
          text: "OK",
          handler: (e) => {
            if (!e.handle) return;

            composeNew(e.handle);
          },
        },
        { text: "Cancel", role: "cancel" },
      ],
    });
  }

  return (
    <>
      <IonLoading isOpen={loading} />
      <IonButton onClick={present}>
        <IonIcon icon={createOutline} />
      </IonButton>
    </>
  );
}
