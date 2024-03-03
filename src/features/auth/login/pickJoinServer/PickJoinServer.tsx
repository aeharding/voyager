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
import {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useAppDispatch, useAppSelector } from "../../../../store";
import { getInstances } from "./pickJoinServerSlice";
import { VList } from "virtua";
import { getClient, getImageSrc } from "../../../../services/lemmy";
import { GetSiteResponse } from "lemmy-js-client";
import { isValidHostname } from "../../../../helpers/url";
import useStartJoinFlow from "./useStartJoinFlow";
import { compact, uniqBy } from "lodash";
import { LVInstance } from "../../../../services/lemmyverse";
import lemmyLogo from "../lemmyLogo.svg";
import Filters from "./Filters";
import { SERVERS_BY_CATEGORY, ServerCategory } from "../data/servers";
import {
  defaultServersUntouched,
  getCustomServers,
} from "../../../../services/app";
import { ellipsisHorizontalCircleOutline } from "ionicons/icons";
import { DynamicDismissableModalContext } from "../../../shared/DynamicDismissableModal";
import { addGuestInstance } from "../../authSlice";
import Login from "../login/Login";
import { getInstanceFromHandle } from "../../authSelectors";
import { styled } from "@linaria/react";
import AppHeader from "../../../shared/AppHeader";
import { isMinimumSupportedLemmyVersion } from "../../../../helpers/lemmy";

const spacing = `
  margin: 2.5rem 0;
  width: 100%;
`;

const CenteredSpinner = styled(IonSpinner)`
  ${spacing}
`;

const Empty = styled.div`
  ${spacing}

  color: var(--ion-color-medium);
  text-align: center;
`;

const ServerThumbnail = styled(IonThumbnail)`
  --size: 32px;
  --border-radius: 6px;
  margin: 16px 16px 16px 0;
  pointer-events: none;
`;

const ServerItem = styled(IonItem)`
  --background: none;
`;

const NextMessage = styled.p`
  font-size: 0.8em;
`;

const ServerImg = styled.img`
  object-fit: contain;
`;

const StyledIonSearchbar = styled(IonSearchbar)`
  padding-bottom: 5px !important;
  min-height: 40px !important;
`;

const FiltersToolbar = styled(IonToolbar)`
  --ion-safe-area-left: -8px;
  --ion-safe-area-right: -8px;
  --padding-start: 0;
  --padding-end: 0;
`;

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
        instance.baseurl.includes(search.toLowerCase()),
      ) || [],
    [instances, search],
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
        isValidHostname(search) &&
        search.includes(".") &&
        !search.endsWith(".")
      ),
    [search],
  );

  const fetchCustomSite = useCallback(async () => {
    setCustomInstance(undefined);

    if (customSearchHostnameInvalid) return;

    const potentialServer = search.toLowerCase();

    setLoading(true);

    let site;

    try {
      site = await getClient(potentialServer).getSite();
    } finally {
      setLoading(false);
    }

    // User changed search before request resolved
    if (site.site_view.site.actor_id !== `https://${search.toLowerCase()}/`)
      return;

    // Unsupported version
    if (!isMinimumSupportedLemmyVersion(site.version)) return;

    setCustomInstance(site);
  }, [customSearchHostnameInvalid, search]);

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
            const { url, icon, description } = allInstances[i]!;

            return (
              <ServerItem key={url}>
                <ServerThumbnail slot="start">
                  <ServerImg
                    src={icon ? getImageSrc(icon, { size: 32 }) : lemmyLogo}
                  />
                </ServerThumbnail>
                <IonRadio value={url}>
                  <IonLabel>
                    <h2>{url}</h2>
                    <p className="ion-text-wrap">{description}</p>
                  </IonLabel>
                </IonRadio>
              </ServerItem>
            );
          }}
        </VList>
      );
    }

    if (loading || loadingInstances) return <CenteredSpinner />;

    return <Empty>No results</Empty>;
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
            <IonButton fill="clear" color="medium" onClick={presentOptions}>
              <IonIcon icon={ellipsisHorizontalCircleOutline} />
            </IonButton>
          </IonButtons>
        </IonToolbar>
        <FiltersToolbar>
          <StyledIonSearchbar
            value={search}
            onIonInput={(e) => setSearch(e.detail.value || "")}
            onKeyDown={(e) => {
              if (e.key !== "Enter") return;

              if (e.target instanceof HTMLElement) e.target.blur();
            }}
            inputMode="url"
            enterkeyhint="go"
          />
          <Filters
            hasRecommended={hasRecommended}
            category={category}
            setCategory={setCategory}
          />
        </FiltersToolbar>
      </AppHeader>
      <IonContent ref={contentRef}>
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
            <NextMessage>
              We&lsquo;ll pick a server for you if you don&lsquo;t make a
              selection.
            </NextMessage>
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
