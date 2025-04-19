import {
  IonBackButton,
  IonButtons,
  IonContent,
  IonToolbar,
} from "@ionic/react";

import { userHandleSelector } from "#/features/auth/authSelectors";
import { localUserSelector } from "#/features/auth/siteSlice";
import BlockedCommunities from "#/features/settings/blocks/BlockedCommunities";
import BlockedInstances from "#/features/settings/blocks/BlockedInstances";
import BlockedUsers from "#/features/settings/blocks/BlockedUsers";
import FilteredKeywords from "#/features/settings/blocks/FilteredKeywords";
import FilteredWebsites from "#/features/settings/blocks/FilteredWebsites";
import FilterNsfw from "#/features/settings/blocks/FilterNsfw";
import AppContent from "#/features/shared/AppContent";
import AppHeader from "#/features/shared/AppHeader";
import { CenteredSpinner } from "#/features/shared/CenteredSpinner";
import {
  ListEditButton,
  ListEditorProvider,
} from "#/features/shared/ListEditor";
import MultilineTitle from "#/features/shared/MultilineTitle";
import { AppPage } from "#/helpers/AppPage";
import { useAppSelector } from "#/store";

export default function BlocksSettingsPage() {
  const userHandle = useAppSelector(userHandleSelector);
  const localUser = useAppSelector(localUserSelector);

  const hasBlocks = useAppSelector(
    (state) =>
      state.site.response?.my_user?.community_blocks.length ||
      state.site.response?.my_user?.person_blocks.length ||
      state.site.response?.my_user?.instance_blocks.length ||
      state.settings.blocks.keywords.length,
  );

  const content = (() => {
    if (!localUser)
      return (
        <IonContent scrollY={false} color="light-bg">
          <CenteredSpinner />
        </IonContent>
      );

    return (
      <AppContent scrollY color="light-bg">
        <FilterNsfw />
        <BlockedCommunities />
        <BlockedUsers />
        <BlockedInstances />
        <FilteredKeywords />
        <FilteredWebsites />
      </AppContent>
    );
  })();

  const page = (
    <AppPage>
      <AppHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/settings" text="Settings" />
          </IonButtons>

          <MultilineTitle subheader={userHandle}>
            Filters & Blocks
          </MultilineTitle>

          <IonButtons slot="end">
            {hasBlocks ? <ListEditButton /> : null}
          </IonButtons>
        </IonToolbar>
      </AppHeader>

      {content}
    </AppPage>
  );

  if (hasBlocks) {
    return <ListEditorProvider>{page}</ListEditorProvider>;
  } else return page;
}
