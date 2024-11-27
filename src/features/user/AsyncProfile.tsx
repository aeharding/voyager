import {
  IonRefresher,
  IonRefresherContent,
  IonSpinner,
  useIonAlert,
} from "@ionic/react";
import { GetPersonDetailsResponse } from "lemmy-js-client";
import {
  useCallback,
  useEffect,
  experimental_useEffectEvent as useEffectEvent,
  useState,
} from "react";

import Profile from "#/features/user/Profile";
import { getUser } from "#/features/user/userSlice";
import { isLemmyError } from "#/helpers/lemmyErrors";
import { useBuildGeneralBrowseLink } from "#/helpers/routes";
import { useOptimizedIonRouter } from "#/helpers/useOptimizedIonRouter";
import { useAppDispatch } from "#/store";

import sharedStyles from "#/features/shared/shared.module.css";

interface AsyncProfileProps {
  handle: string;
}

export default function AsyncProfile({ handle }: AsyncProfileProps) {
  const buildGeneralBrowseLink = useBuildGeneralBrowseLink();
  const dispatch = useAppDispatch();
  const [person, setPerson] = useState<
    GetPersonDetailsResponse | "failed" | undefined
  >();
  const router = useOptimizedIonRouter();
  const [present] = useIonAlert();

  const load = useCallback(async () => {
    let data;

    try {
      data = await dispatch(getUser(handle));
    } catch (error) {
      if (
        isLemmyError(error, "couldnt_find_person" as never) || // TODO lemmy 0.19 and less support
        isLemmyError(error, "not_found")
      ) {
        await present(`Huh, u/${handle} doesn't exist. Mysterious...`);

        if (router.canGoBack()) {
          router.goBack();
        } else {
          router.push(buildGeneralBrowseLink("/"));
        }

        throw error;
      }

      setPerson("failed");

      throw error;
    }

    setPerson(data);
  }, [buildGeneralBrowseLink, dispatch, handle, present, router]);

  const loadEvent = useEffectEvent(load);

  useEffect(() => {
    if (handle) loadEvent();
  }, [handle]);

  if (!person) return <IonSpinner className={sharedStyles.pageSpinner} />;

  if (person === "failed")
    return (
      <>
        <IonRefresher
          slot="fixed"
          onIonRefresh={async (e) => {
            try {
              await load();
            } finally {
              e.detail.complete();
            }
          }}
        >
          <IonRefresherContent />
        </IonRefresher>
        <div className={sharedStyles.pageFailedMessage}>
          failed to load user profile 😢
        </div>
      </>
    );

  return <Profile person={person} onPull={load} />;
}
