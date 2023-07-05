import React from "react";
import {
  IonRefresher,
  IonRefresherContent,
  IonSpinner,
  useIonAlert,
  useIonRouter,
} from "@ionic/react";
import { useEffect, useState } from "react";
import Profile from "../../features/user/Profile";
import { GetPersonDetailsResponse } from "lemmy-js-client";
import styled from "@emotion/styled";
import { useAppDispatch } from "../../store";
import { getUser } from "../../features/user/userSlice";
import { useBuildGeneralBrowseLink } from "../../helpers/routes";

export const PageContentIonSpinner = styled(IonSpinner)`
  position: relative;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
`;

const FailedMessage = styled.div`
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
  const router = useIonRouter();
  const [present] = useIonAlert();

  useEffect(() => {
    if (handle) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [handle]);

  async function load() {
    let data;

    try {
      data = await dispatch(getUser(handle));
    } catch (error) {
      if (error === "couldnt_find_that_username_or_email") {
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
  }

  function renderContents() {
    if (!person) return <PageContentIonSpinner />;

    if (person === "failed")
      return <FailedMessage>failed to load user profile 😢</FailedMessage>;

    return <Profile person={person} />;
  }

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
      {renderContents()}
    </>
  );
}
