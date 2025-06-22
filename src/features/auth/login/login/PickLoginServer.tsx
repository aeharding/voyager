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
import { uniq } from "es-toolkit";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { VList, VListHandle } from "virtua";

import { LOGIN_SERVERS } from "#/features/auth/login/data/servers";
import AppHeader from "#/features/shared/AppHeader";
import { isValidHostname, stripProtocol } from "#/helpers/url";
import useAppToast from "#/helpers/useAppToast";
import { getCustomServers } from "#/services/app";

import Login from "./Login";
import useValidateLoginTo from "./useValidateLoginTo";

import styles from "./PickLoginServer.module.css";

export default function PickLoginServer() {
  const presentToast = useAppToast();
  const validateLoginTo = useValidateLoginTo();
  const [search, setSearch] = useState("");
  const [shouldSubmit, setShouldSubmit] = useState(false);
  const searchHostname = stripProtocol(search.trim());
  const instances = useMemo(
    () =>
      uniq([...getCustomServers(), ...LOGIN_SERVERS]).filter((server) =>
        server.includes(searchHostname.toLowerCase()),
      ),
    [searchHostname],
  );
  const [loading, setLoading] = useState(false);

  const vHandle = useRef<VListHandle>(null);

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
    vHandle.current?.scrollTo(0);
  }, [search]);

  useEffect(() => {
    setTimeout(() => {
      searchbarRef.current?.setFocus();
    }, 300);
  }, []);

  const submit = useCallback(async () => {
    if (loading) return;

    const potentialServer = searchHostname.toLowerCase();

    if (instances[0] && search !== potentialServer) {
      setSearch(instances[0]);
      return;
    }

    setLoading(true);

    try {
      await validateLoginTo(potentialServer, (site) => {
        ref.current
          ?.closest("ion-nav")
          ?.push(() => (
            <Login url={potentialServer} siteIcon={site.site_view.site.icon} />
          ));
      });
    } finally {
      setLoading(false);
    }
  }, [instances, loading, search, searchHostname, validateLoginTo]);

  useEffect(() => {
    if (!shouldSubmit) return;

    setShouldSubmit(false);
    submit();
  }, [shouldSubmit, submit]);

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
      <IonContent scrollY={false} color="light-bg">
        <div className={styles.container} ref={ref}>
          <div className="ion-padding">
            <IonText color="medium">
              Pick the server you created your account on
            </IonText>
          </div>

          <IonSearchbar
            ref={searchbarRef}
            enterkeyhint="next"
            placeholder="Enter URL or search for your server"
            inputMode="url"
            onKeyDown={(e) => {
              if (e.key !== "Enter") return;

              // Invalid search and there is a candidate for autocomplete
              if (
                searchInvalid &&
                instances[0] &&
                instances[0] !== searchHostname
              ) {
                setSearch(instances[0]);
                return;
              }

              // Already selected a server
              if (search) return submit();

              // Valid with TLD (for autocomplete search)
              if (!searchInvalid) {
                submit();
                return;
              }

              if (instances[0]) {
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
              setSearch(e.detail.value ?? "");
            }}
          />

          <IonList className={styles.list}>
            <VList
              count={instances.length}
              ref={vHandle}
              className="ion-content-scroll-host"
            >
              {(i) => {
                const instance = instances[i]!;

                return (
                  <IonItem
                    detail
                    onClick={() => {
                      setSearch(instance);
                      setShouldSubmit(true);
                      searchbarRef.current?.setFocus();
                    }}
                  >
                    {instance}
                  </IonItem>
                );
              }}
            </VList>
          </IonList>
        </div>
      </IonContent>
    </>
  );
}
