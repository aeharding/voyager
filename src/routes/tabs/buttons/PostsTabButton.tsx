import { IonIcon, IonLabel } from "@ionic/react";
import { telescope } from "ionicons/icons";

import { instanceSelector, jwtSelector } from "#/features/auth/authSelectors";
import { openTitleSearch } from "#/features/community/titleSearch/TitleSearch";
import { useOptimizedIonRouter } from "#/helpers/useOptimizedIonRouter";
import { getDefaultServer } from "#/services/app";
import { useAppSelector } from "#/store";

import SharedTabButton, { TabButtonProps } from "./shared";

function PostsTabButton(props: TabButtonProps) {
  const router = useOptimizedIonRouter();
  const selectedInstance = useAppSelector(instanceSelector);
  const jwt = useAppSelector(jwtSelector);

  function customBackAction() {
    const pathname = router.getRouteInfo()?.pathname;
    if (!pathname) return;

    const actor = pathname.split("/")[2];

    if (pathname.endsWith(jwt ? "/home" : "/all")) {
      router.push(
        `/posts/${actor ?? selectedInstance ?? getDefaultServer()}`,
        "back",
      );
      return;
    }

    const communitiesPath = `/posts/${
      actor ?? selectedInstance ?? getDefaultServer()
    }`;
    if (pathname === communitiesPath || pathname === `${communitiesPath}/`)
      return;

    if (router.canGoBack()) {
      router.goBack();
    } else {
      router.push(
        `/posts/${actor ?? selectedInstance ?? getDefaultServer()}/${
          jwt ? "home" : "all"
        }`,
        "back",
      );
    }
  }

  return (
    <SharedTabButton
      {...props}
      customBackAction={customBackAction}
      onLongPressExtraAction={onLongPressExtraAction}
    >
      <IonIcon aria-hidden="true" icon={telescope} />
      <IonLabel>Posts</IonLabel>
    </SharedTabButton>
  );
}

function onLongPressExtraAction() {
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        openTitleSearch();
      });
    });
  });
}

/**
 * Signal to Ionic that this is a tab bar button component
 */
PostsTabButton.isTabButton = true;

export default PostsTabButton;
