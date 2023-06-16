import { IonActionSheet, IonButton, IonIcon, useIonModal } from "@ionic/react";
import { ellipsisHorizontal, heart, heartDislike } from "ionicons/icons";
import { useContext, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../store";
import { getHandle } from "../../helpers/lemmy";
import { getClient } from "../../services/lemmy";
import { followCommunity } from "./communitySlice";
import { PageContext } from "../../features/auth/PageContext";
import Login from "../../features/auth/Login";

interface MoreActionsProps {
  community: string;
}

export default function MoreActions({ community }: MoreActionsProps) {
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
        onDidDismiss={(e) => {
          setOpen(false);

          if (e.detail.role === "subscribe") {
            if (!jwt) return login({ presentingElement: pageContext.page });

            dispatch(followCommunity(!isSubscribed, community));
          }
        }}
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
      />
    </>
  );
}
