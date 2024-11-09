import {
  IonRefresher,
  IonRefresherContent,
  IonSpinner,
  useIonAlert,
} from "@ionic/react";
import { styled } from "@linaria/react";
import { GetPersonDetailsResponse } from "lemmy-js-client";
import {
  experimental_useEffectEvent as useEffectEvent,
  useCallback,
  useEffect,
  useState,
} from "react";

import Profile from "#/features/user/Profile";
import { getUser } from "#/features/user/userSlice";
import { isLemmyError } from "#/helpers/lemmyErrors";
import { useBuildGeneralBrowseLink } from "#/helpers/routes";
import { useOptimizedIonRouter } from "#/helpers/useOptimizedIonRouter";
import { useAppDispatch } from "#/store";

export const PageContentIonSpinner = styled(IonSpinner)`
  position: relative;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
`;

export const FailedMessage = styled.div`
  margin-top: 25vh;
  text-align: center;
  color: var(--ion-color-medium);
`;

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

  if (!person) return <PageContentIonSpinner />;

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
        <FailedMessage>failed to load user profile 😢</FailedMessage>
      </>
    );

  return <Profile person={person} onPull={load} />;
}
