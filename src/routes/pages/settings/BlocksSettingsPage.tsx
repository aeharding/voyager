import {
  IonBackButton,
  IonButtons,
  IonContent,
  IonPage,
  IonText,
  IonTitle,
  IonToolbar,
} from "@ionic/react";
import AppContent from "../../../features/shared/AppContent";
import { useAppSelector } from "../../../store";
import { userHandleSelector } from "../../../features/auth/authSelectors";
import FilterNsfw from "../../../features/settings/blocks/FilterNsfw";
import BlockedCommunities from "../../../features/settings/blocks/BlockedCommunities";
import BlockedUsers from "../../../features/settings/blocks/BlockedUsers";
import FilteredKeywords from "../../../features/settings/blocks/FilteredKeywords";
import BlockedInstances from "../../../features/settings/blocks/BlockedInstances";
import { useRef } from "react";
import { useSetActivePage } from "../../../features/auth/AppContext";
import { localUserSelector } from "../../../features/auth/siteSlice";
import AppHeader from "../../../features/shared/AppHeader";
import {
  ListEditButton,
  ListEditorProvider,
} from "../../../features/shared/ListEditor";
import { CenteredSpinner } from "../../../features/shared/CenteredSpinner";
import {
  TitleContainer,
  UsernameIonText,
} from "../../../features/shared/markdown/editing/modal/contents/CommentReplyPage";

export default function BlocksSettingsPage() {
  const pageRef = useRef<HTMLElement>(null);

  const userHandle = useAppSelector(userHandleSelector);
  const localUser = useAppSelector(localUserSelector);

  const hasBlocks = useAppSelector(
    (state) =>
      state.site.response?.my_user?.community_blocks.length ||
      state.site.response?.my_user?.person_blocks.length ||
      state.site.response?.my_user?.instance_blocks.length ||
      state.settings.blocks.keywords.length,
  );

  useSetActivePage(pageRef);

  const content = (() => {
    if (!localUser)
      return (
        <IonContent scrollY={false}>
          <CenteredSpinner />
        </IonContent>
      );

    return (
      <AppContent scrollY>
        <FilterNsfw />
        <FilteredKeywords />
        <BlockedCommunities />
        <BlockedUsers />
        <BlockedInstances />
      </AppContent>
    );
  })();

  const page = (
    <IonPage ref={pageRef} className="grey-bg">
      <AppHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/settings" text="Settings" />
          </IonButtons>

          <IonTitle>
            <TitleContainer>
              <IonText>Filters & Blocks</IonText>
              <div>
                <UsernameIonText color="medium">{userHandle}</UsernameIonText>
              </div>
            </TitleContainer>{" "}
          </IonTitle>
          <IonButtons slot="end">
            {hasBlocks ? <ListEditButton /> : null}
          </IonButtons>
        </IonToolbar>
      </AppHeader>

      {content}
    </IonPage>
  );

  if (hasBlocks) {
    return <ListEditorProvider>{page}</ListEditorProvider>;
  } else return page;
}
