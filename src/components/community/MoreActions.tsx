import {
  IonActionSheet,
  IonButton,
  IonIcon,
  useIonModal,
  useIonToast,
} from "@ionic/react";
import { ellipsisHorizontal, heart, heartDislike } from "ionicons/icons";
import { useContext, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../store";
import { followCommunity } from "./communitySlice";
import { PageContext } from "../../features/auth/PageContext";
import Login from "../../features/auth/Login";

interface MoreActionsProps {
  community: string;
}

export default function MoreActions({ community }: MoreActionsProps) {
  const [present] = useIonToast();
  const dispatch = useAppDispatch();
  const [open, setOpen] = useState(false);
  const jwt = useAppSelector((state) => state.auth.jwt);

  const pageContext = useContext(PageContext);
  const [login, onDismiss] = useIonModal(Login, {
    onDismiss: (data: string, role: string) => onDismiss(data, role),
  });

  const communityByHandle = useAppSelector(
    (state) => state.community.communityByHandle
  );
  const isSubscribed =
    communityByHandle[community]?.community_view.subscribed === "Subscribed" ||
    communityByHandle[community]?.community_view.subscribed === "Pending";

  return (
    <>
      <IonButton
        disabled={!communityByHandle[community]}
        fill="default"
        onClick={() => setOpen(true)}
      >
        <IonIcon icon={ellipsisHorizontal} color="primary" />
      </IonButton>
      <IonActionSheet
        isOpen={open}
        buttons={[
          {
            text: !isSubscribed ? "Subscribe" : "Unsubscribe",
            role: "subscribe",
            icon: !isSubscribed ? heart : heartDislike,
          },
          {
            text: "Cancel",
            role: "cancel",
          },
        ]}
        onWillDismiss={async (e) => {
          setOpen(false);

          if (e.detail.role === "subscribe") {
            if (!jwt) return login({ presentingElement: pageContext.page });

            try {
              await dispatch(followCommunity(!isSubscribed, community));
            } catch (error) {
              present({
                message: `Problem ${
                  isSubscribed ? "unsubscribing from" : "subscribing to"
                } c/${community}. Please try again.`,
                duration: 3500,
                position: "bottom",
                color: "danger",
              });
              throw error;
            }

            present({
              message: `${
                isSubscribed ? "Unsubscribed from" : "Subscribed to"
              } c/${community}.`,
              duration: 3500,
              position: "bottom",
              color: "success",
            });
          }
        }}
      />
    </>
  );
}
