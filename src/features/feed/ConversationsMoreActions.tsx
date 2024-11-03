import { IonButton } from "@ionic/react";
import { personCircleOutline } from "ionicons/icons";
import { Person } from "lemmy-js-client";

import HeaderEllipsisIcon from "#/features/shared/HeaderEllipsisIcon";
import usePresentUserActions from "#/features/user/usePresentUserActions";
import { buildUserLink } from "#/helpers/appLinkBuilder";
import { getHandle } from "#/helpers/lemmy";
import { useBuildGeneralBrowseLink } from "#/helpers/routes";
import { useOptimizedIonRouter } from "#/helpers/useOptimizedIonRouter";

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
