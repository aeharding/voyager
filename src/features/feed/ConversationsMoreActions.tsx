import { IonButton } from "@ionic/react";
import HeaderEllipsisIcon from "../shared/HeaderEllipsisIcon";
import usePresentUserActions from "../user/usePresentUserActions";
import { personCircleOutline } from "ionicons/icons";
import { useOptimizedIonRouter } from "../../helpers/useOptimizedIonRouter";
import { useBuildGeneralBrowseLink } from "../../helpers/routes";
import { Person } from "lemmy-js-client";
import { getHandle } from "../../helpers/lemmy";
import { buildUserLink } from "../../helpers/appLinkBuilder";

interface ConversationsMoreActionsProps {
  person: Person | undefined;
}

export default function ConversationsMoreActions({
  person,
}: ConversationsMoreActionsProps) {
  const presentUserActions = usePresentUserActions();
  const router = useOptimizedIonRouter();
  const buildGeneralBrowseLink = useBuildGeneralBrowseLink();

  return (
    <>
      <IonButton
        disabled={!person}
        onClick={() => {
          if (!person) return;

          presentUserActions(person, {
            hideMessageButton: true,
            prependButtons: [
              {
                text: getHandle(person),
                icon: personCircleOutline,
                handler: () => {
                  router.push(buildGeneralBrowseLink(buildUserLink(person)));
                },
              },
            ],
          });
        }}
      >
        <HeaderEllipsisIcon slot="icon-only" />
      </IonButton>
    </>
  );
}
