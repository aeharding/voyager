import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  IonBackButton,
  IonButton,
  IonButtons,
  IonContent,
  IonItem,
  IonList,
  IonSearchbar,
  IonSpinner,
  IonText,
  IonTitle,
  IonToolbar,
} from "@ionic/react";
import { VList } from "virtua";
import { styled } from "@linaria/react";
import { LOGIN_SERVERS } from "../data/servers";
import { getClient } from "../../../../services/lemmy";
import Login from "./Login";
import useAppToast from "../../../../helpers/useAppToast";
import { isValidHostname } from "../../../../helpers/url";
import { GetSiteResponse } from "lemmy-js-client";
import { uniq } from "lodash";
import { getCustomServers } from "../../../../services/app";
import AppHeader from "../../../shared/AppHeader";

const Container = styled.div`
  height: 100%;

  display: flex;
  flex-direction: column;
`;

const StyledIonList = styled(IonList)`
  flex: 1;

  --ion-item-background: none;
`;

export default function PickLoginServer() {
  const presentToast = useAppToast();
  const [search, setSearch] = useState("");
  const [dirty, setDirty] = useState(false);
  const instances = useMemo(
    () =>
      uniq([...getCustomServers(), ...LOGIN_SERVERS]).filter((server) =>
        server.includes(search.toLowerCase()),
      ),
    [search],
  );
  const [loading, setLoading] = useState(false);

  const ref = useRef<HTMLDivElement>(null);
  const searchbarRef = useRef<HTMLIonSearchbarElement>(null);

  const searchInvalid = useMemo(
    () =>
      !(
        isValidHostname(search) &&
        search.includes(".") &&
        !search.endsWith(".")
      ),
    [search],
  );

  useEffect(() => {
    setTimeout(() => {
      searchbarRef.current?.setFocus();
    }, 300);
  }, []);

  async function submit() {
    if (loading) return;

    setLoading(true);

    const potentialServer = search.toLowerCase();

    let site: GetSiteResponse;

    try {
      site = await getClient(potentialServer).getSite();
    } catch (error) {
      // Dirty input with candidate
      if (instances[0]) {
        setDirty(false);
        setSearch(instances[0]);
        return;
      }

      presentToast({
        message: `Problem connecting to ${potentialServer}. Please try again`,
        color: "danger",
        fullscreen: true,
      });

      throw error;
    } finally {
      setLoading(false);
    }

    ref.current
      ?.closest("ion-nav")
      ?.push(() => (
        <Login url={potentialServer} siteIcon={site.site_view.site.icon} />
      ));
  }

  return (
    <>
      <AppHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton />
          </IonButtons>
          <IonTitle>Welcome back</IonTitle>
          <IonButtons slot="end">
            {loading ? (
              <IonSpinner color="medium" />
            ) : (
              <IonButton strong onClick={submit} disabled={searchInvalid}>
                Next
              </IonButton>
            )}
          </IonButtons>
        </IonToolbar>
      </AppHeader>
      <IonContent>
        <Container ref={ref}>
          <div className="ion-padding">
            <IonText color="medium">
              Pick the server you created your account on
            </IonText>
          </div>

          <IonSearchbar
            ref={searchbarRef}
            enterkeyhint="go"
            placeholder="Enter URL or search for your server"
            inputMode="url"
            onKeyDown={(e) => {
              if (e.key !== "Enter") return;

              // Already selected a server
              if (!dirty && search) return submit();

              // Valid with TLD (for autocomplete search)
              if (!searchInvalid) {
                setDirty(false);
                submit();
                return;
              }

              // Dirty input with candidate
              if (instances[0]) {
                setDirty(false);
                setSearch(instances[0]);
                return;
              }

              presentToast({
                message: `“${search}” is not a valid server.`,
                color: "danger",
                fullscreen: true,
              });
            }}
            value={search}
            onIonInput={(e) => {
              setDirty(true);
              setSearch(e.detail.value || "");
            }}
          />

          {dirty && (
            <StyledIonList>
              <VList count={instances.length}>
                {(i) => {
                  const instance = instances[i]!;

                  return (
                    <IonItem
                      detail
                      onClick={() => {
                        setSearch(instance);
                        setDirty(false);
                        searchbarRef.current?.setFocus();
                      }}
                    >
                      {instance}
                    </IonItem>
                  );
                }}
              </VList>
            </StyledIonList>
          )}
        </Container>
      </IonContent>
    </>
  );
}
