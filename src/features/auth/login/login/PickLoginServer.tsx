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
import { isValidHostname, stripProtocol } from "../../../../helpers/url";
import { GetSiteResponse } from "lemmy-js-client";
import { uniq } from "lodash";
import { getCustomServers } from "../../../../services/app";
import AppHeader from "../../../shared/AppHeader";
import {
  MINIMUM_LEMMY_VERSION,
  isMinimumSupportedLemmyVersion,
} from "../../../../helpers/lemmy";

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
  const searchHostname = stripProtocol(search.trim());
  const instances = useMemo(
    () =>
      uniq([...getCustomServers(), ...LOGIN_SERVERS]).filter((server) =>
        server.includes(searchHostname.toLowerCase()),
      ),
    [searchHostname],
  );
  const [loading, setLoading] = useState(false);

  const ref = useRef<HTMLDivElement>(null);
  const searchbarRef = useRef<HTMLIonSearchbarElement>(null);

  const searchInvalid = useMemo(
    () =>
      !(
        isValidHostname(searchHostname) &&
        searchHostname.includes(".") &&
        !searchHostname.endsWith(".")
      ),
    [searchHostname],
  );

  useEffect(() => {
    setTimeout(() => {
      searchbarRef.current?.setFocus();
    }, 300);
  }, []);

  async function submit() {
    if (loading) return;

    const potentialServer = searchHostname.toLowerCase();

    // Dirty input with candidate
    if (instances[0] && search !== potentialServer) {
      setDirty(false);
      setSearch(instances[0]);
      return;
    }

    setLoading(true);

    let site: GetSiteResponse;

    try {
      site = await getClient(potentialServer).getSite();
    } catch (error) {
      presentToast({
        message: `Problem connecting to ${potentialServer}. Please try again`,
        color: "danger",
        fullscreen: true,
      });

      throw error;
    } finally {
      setLoading(false);
    }

    if (!isMinimumSupportedLemmyVersion(site.version)) {
      presentToast({
        message: `${potentialServer} is running Lemmy v${site.version}. Voyager requires at least v${MINIMUM_LEMMY_VERSION}`,
        color: "danger",
        fullscreen: true,
        duration: 6_000,
      });

      return;
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
