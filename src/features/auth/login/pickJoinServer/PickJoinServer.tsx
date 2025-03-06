import {
  IonBackButton,
  IonButton,
  IonButtons,
  IonContent,
  IonFooter,
  IonIcon,
  IonItem,
  IonLabel,
  IonRadio,
  IonRadioGroup,
  IonSearchbar,
  IonSpinner,
  IonText,
  IonThumbnail,
  IonTitle,
  IonToolbar,
  useIonActionSheet,
} from "@ionic/react";
import { compact, uniqBy } from "es-toolkit";
import {
  ellipsisHorizontalCircleOutline,
  ellipsisVertical,
} from "ionicons/icons";
import { GetSiteResponse } from "lemmy-js-client";
import {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { VList } from "virtua";

import {
  ServerCategory,
  SERVERS_BY_CATEGORY,
} from "#/features/auth/login/data/servers";
import Login from "#/features/auth/login/login/Login";
import AppHeader from "#/features/shared/AppHeader";
import { DynamicDismissableModalContext } from "#/features/shared/DynamicDismissableModal";
import { isIosTheme } from "#/helpers/device";
import { blurOnEnter } from "#/helpers/dom";
import { isMinimumSupportedLemmyVersion } from "#/helpers/lemmy";
import { isValidHostname, stripProtocol } from "#/helpers/url";
import { defaultServersUntouched, getCustomServers } from "#/services/app";
import { getClient, getImageSrc } from "#/services/lemmy";
import { LVInstance } from "#/services/lemmyverse";
import { useAppDispatch, useAppSelector } from "#/store";

import { getInstanceFromHandle } from "../../authSelectors";
import { addGuestInstance } from "../../authSlice";
import lemmyLogo from "../lemmyLogo.svg";
import Filters from "./Filters";
import { getInstances } from "./pickJoinServerSlice";
import useStartJoinFlow from "./useStartJoinFlow";

import styles from "./PickJoinServer.module.css";

export default function PickJoinServer() {
  const [presentActionSheet] = useIonActionSheet();

  const { dismiss, setCanDismiss } = useContext(DynamicDismissableModalContext);

  const dispatch = useAppDispatch();
  const connectedInstance = useAppSelector(
    (state) => state.auth.connectedInstance,
  );
  const instances = useAppSelector((state) => state.pickJoinServer.instances);

  const contentRef = useRef<HTMLIonContentElement>(null);

  const [selection, setSelection] = useState<string | undefined>();
  const [search, setSearch] = useState("");
  const searchHostname = stripProtocol(search.trim());

  const accounts = useAppSelector((state) => state.auth.accountData?.accounts);

  const [loadingInstances, setLoadingInstances] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [customInstance, setCustomInstance] = useState<
    GetSiteResponse | undefined
  >();

  const startJoinFlow = useStartJoinFlow(contentRef);

  const hasRecommended = !defaultServersUntouched();

  const [category, setCategory] = useState<ServerCategory>(
    hasRecommended ? "recommended" : "general",
  );

  const matchingInstances = useMemo(
    () =>
      instances?.filter((instance) =>
        instance.baseurl.includes(searchHostname.toLowerCase()),
      ) || [],
    [instances, searchHostname],
  );

  const allInstances = useMemo(() => {
    const matches = matchingInstances.map(normalize).filter((instance) => {
      if (category === "recommended")
        return getCustomServers().includes(instance.url);

      return SERVERS_BY_CATEGORY[category].includes(instance.url);
    });

    const all = customInstance
      ? [normalize(customInstance), ...matches]
      : matches;

    return uniqBy(all, ({ url }) => url);
  }, [customInstance, matchingInstances, category]);

  const customSearchHostnameInvalid = useMemo(
    () =>
      !(
        isValidHostname(searchHostname) &&
        searchHostname.includes(".") &&
        !searchHostname.endsWith(".")
      ),
    [searchHostname],
  );

  const fetchCustomSite = useCallback(async () => {
    setCustomInstance(undefined);

    if (customSearchHostnameInvalid) return;

    const potentialServer = searchHostname.toLowerCase();

    setLoading(true);

    let site;

    try {
      site = await getClient(potentialServer).getSite();
    } finally {
      setLoading(false);
    }

    // User changed search before request resolved
    if (
      site.site_view.site.actor_id !==
      `https://${searchHostname.toLowerCase()}/`
    )
      return;

    // Unsupported version
    if (!isMinimumSupportedLemmyVersion(site.version)) return;

    setCustomInstance(site);
  }, [customSearchHostnameInvalid, searchHostname]);

  useEffect(() => {
    fetchCustomSite();
  }, [fetchCustomSite]);

  useEffect(() => {
    if (!customSearchHostnameInvalid) return;

    setLoading(false);
  }, [customSearchHostnameInvalid]);

  useEffect(() => {
    (async () => {
      setLoadingInstances(true);

      try {
        await dispatch(getInstances());
      } finally {
        setLoadingInstances(false);
      }
    })();
  }, [dispatch]);

  async function submit() {
    const server = selection || connectedInstance;

    setSubmitting(true);

    try {
      await startJoinFlow(server);
    } finally {
      setSubmitting(false);
    }
  }

  function presentOptions() {
    const selectedUrl = selection || connectedInstance;
    const alreadyLoggedIn = accounts?.some(
      (a) => getInstanceFromHandle(a.handle) === selectedUrl,
    );

    presentActionSheet({
      buttons: compact([
        {
          text: `Join ${selectedUrl}`,
          handler: () => {
            submit();
          },
        },
        {
          text: "Log In",
          handler: () => {
            const icon = allInstances.find(
              ({ url }) => url === selectedUrl,
            )?.icon;

            contentRef.current
              ?.closest("ion-nav")
              ?.push(() => <Login url={selectedUrl} siteIcon={icon} />);
          },
        },
        !alreadyLoggedIn && {
          text: "Connect as Guest",
          handler: () => {
            (async () => {
              setSubmitting(true);

              try {
                await dispatch(addGuestInstance(selectedUrl));
              } finally {
                setSubmitting(false);
              }

              setCanDismiss(true);
              dismiss();
            })();
          },
        },
        {
          text: "Cancel",
          role: "cancel",
        },
      ]),
    });
  }

  const content = (() => {
    if (allInstances.length) {
      return (
        <VList count={allInstances.length} className="ion-content-scroll-host">
          {(i) => {
            const instance = allInstances[i];

            // Edge case/race with refreshing instances
            // https://github.com/aeharding/voyager/issues/1854
            if (!instance) return <div />;

            const { url, icon, description } = instance;

            return (
              <IonItem className={styles.serverItem} key={url}>
                <IonThumbnail className={styles.serverThumbnail} slot="start">
                  <img
                    className={styles.serverImg}
                    src={icon ? getImageSrc(icon, { size: 32 }) : lemmyLogo}
                  />
                </IonThumbnail>
                <IonRadio value={url}>
                  <IonLabel>
                    <h2>{url}</h2>
                    <p className="ion-text-wrap">{description}</p>
                  </IonLabel>
                </IonRadio>
              </IonItem>
            );
          }}
        </VList>
      );
    }

    if (loading || loadingInstances)
      return <IonSpinner className={styles.spacing} />;

    return <div className={styles.empty}>No results</div>;
  })();

  return (
    <>
      <AppHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton />
          </IonButtons>
          <IonTitle>Pick Server</IonTitle>
          <IonButtons slot="end">
            <IonButton
              color="dark"
              onClick={presentOptions}
              className={styles.optionsButton}
            >
              <IonIcon
                icon={
                  isIosTheme()
                    ? ellipsisHorizontalCircleOutline
                    : ellipsisVertical
                }
                slot="icon-only"
              />
            </IonButton>
          </IonButtons>
        </IonToolbar>
        <IonToolbar className={styles.filtersToolbar}>
          <IonSearchbar
            className={styles.searchbar}
            value={search}
            onIonInput={(e) => setSearch(e.detail.value || "")}
            onKeyDown={blurOnEnter}
            inputMode="url"
            enterkeyhint="done"
          />
          <Filters
            hasRecommended={hasRecommended}
            category={category}
            setCategory={setCategory}
          />
        </IonToolbar>
      </AppHeader>
      <IonContent ref={contentRef} scrollY={false}>
        <IonRadioGroup
          value={selection}
          onIonChange={(e) => setSelection(e.detail.value)}
          allowEmptySelection
        >
          {content}
        </IonRadioGroup>
      </IonContent>
      <IonFooter>
        <IonToolbar>
          <IonButton
            fill="solid"
            expand="block"
            onClick={submit}
            disabled={submitting}
          >
            {submitting ? <IonSpinner /> : "Next"}
          </IonButton>
          <IonText color="medium">
            <p className={styles.nextMessage}>
              We&lsquo;ll pick a server for you if you don&lsquo;t make a
              selection.
            </p>
          </IonText>
        </IonToolbar>
      </IonFooter>
    </>
  );
}

interface Instance {
  url: string;
  description?: string;
  icon?: string;
  open: boolean;
}

function normalize(instance: GetSiteResponse | LVInstance): Instance {
  if ("baseurl" in instance) {
    return {
      url: instance.baseurl,
      icon: instance.icon,
      description: instance.desc,
      open: instance.open,
    };
  }

  return {
    url: new URL(instance.site_view.site.actor_id).hostname,
    icon: instance.site_view.site.icon,
    description: instance.site_view.site.description,
    open: instance.site_view.local_site.registration_mode === "Open",
  };
}
