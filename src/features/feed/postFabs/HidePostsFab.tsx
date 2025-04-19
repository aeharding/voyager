import { IonFab, IonFabButton, IonIcon } from "@ionic/react";
import { noop } from "es-toolkit";
import { eyeOffOutline, eyeOutline } from "ionicons/icons";
import { createContext, use, useState } from "react";
import { LongPressCallbackReason, useLongPress } from "use-long-press";

import { scrollUpIfNeeded } from "#/helpers/scrollUpIfNeeded";
import useGetAppScrollable from "#/helpers/useGetAppScrollable";

import useHidePosts from "../useHidePosts";
import useResetHiddenPosts from "../useResetHiddenPosts";

interface HidePostsFabProps {
  forceRefresh: () => void;
}

export default function HidePostsFab({ forceRefresh }: HidePostsFabProps) {
  const hidePosts = useHidePosts();
  const resetHiddenPosts = useResetHiddenPosts();
  const getAppScrollable = useGetAppScrollable();
  const { showHiddenPosts, setShowHiddenPosts } = useShowHiddenPosts();

  function onUpdateShowHiddenPosts(show: boolean) {
    setShowHiddenPosts(show);
    forceRefresh();
    scrollUpIfNeeded(getAppScrollable(), 0, "auto");
  }

  const bind = useLongPress(
    () => {
      resetHiddenPosts({
        prependButtons: [
          {
            text: "Show hidden temporarily",
            handler: () => {
              onUpdateShowHiddenPosts(true);
            },
          },
        ],
        onFinishReset: () => {
          forceRefresh();
          scrollUpIfNeeded(getAppScrollable(), 0, "auto");
        },
      });
    },
    {
      cancelOnMovement: 15,
      onCancel: (_, meta) => {
        if (meta.reason !== LongPressCallbackReason.CancelledByRelease) return;

        if (showHiddenPosts) {
          onUpdateShowHiddenPosts(false);
          return;
        }

        hidePosts();
      },
    },
  );

  return (
    <IonFab slot="fixed" vertical="bottom" horizontal="end">
      <IonFabButton {...bind()}>
        <IonIcon icon={showHiddenPosts ? eyeOutline : eyeOffOutline} />
      </IonFabButton>
    </IonFab>
  );
}

interface ShowHiddenPostsContextValue {
  showHiddenPosts: boolean;
  setShowHiddenPosts: (show: boolean) => void;
}

const ShowHiddenPostsContext = createContext<ShowHiddenPostsContextValue>({
  showHiddenPosts: false,
  setShowHiddenPosts: noop,
});

export function ShowHiddenPostsProvider(props: React.PropsWithChildren) {
  const [showHiddenPosts, setShowHiddenPosts] = useState(false);

  return (
    <ShowHiddenPostsContext
      value={{ showHiddenPosts, setShowHiddenPosts }}
      {...props}
    />
  );
}

export function useShowHiddenPosts() {
  return use(ShowHiddenPostsContext);
}
