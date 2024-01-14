import {
  IonBackButton,
  IonButton,
  IonButtons,
  IonContent,
  IonFooter,
  IonHeader,
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
} from "@ionic/react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../../../store";
import { getInstances } from "./pickJoinServerSlice";
import { VList } from "virtua";
import styled from "@emotion/styled";
import { getClient, getImageSrc } from "../../../../services/lemmy";
import { GetSiteResponse } from "lemmy-js-client";
import { isValidHostname } from "../../../../helpers/url";
import useStartJoinFlow from "./useStartJoinFlow";
import { uniqBy } from "lodash";
import { LVInstance } from "../../../../services/lemmyverse";
import { css } from "@emotion/react";

const spacing = css`
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

export default function PickJoinServer() {
  const dispatch = useAppDispatch();
  const instances = useAppSelector(
    (state) => state.pickJoinServer.instances || [],
  );
  // eslint-disable-next-line no-undef
  const contentRef = useRef<HTMLIonContentElement>(null);

  const [selection, setSelection] = useState<string | undefined>();
  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [customInstance, setCustomInstance] = useState<
    GetSiteResponse | undefined
  >();

  const startJoinFlow = useStartJoinFlow(contentRef);

  const matchingInstances = useMemo(
    () =>
      instances.filter((instance) =>
        instance.baseurl.includes(search.toLowerCase()),
      ),
    [instances, search],
  );

  const allInstances = useMemo(
    () =>
      uniqBy(
        (customInstance
          ? [...matchingInstances, customInstance]
          : matchingInstances
        ).map(normalize),
        ({ url }) => url,
      ),
    [customInstance, matchingInstances],
  );

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
    dispatch(getInstances());
  }, [dispatch]);

  async function submit() {
    const server = selection || "lemmy.world";

    setSubmitting(true);

    try {
      await startJoinFlow(server);
    } finally {
      setSubmitting(false);
    }
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
                  {icon && <img src={getImageSrc(icon, { size: 32 })} />}
                </ServerThumbnail>
                <IonLabel>
                  <h2>{url}</h2>
                  <p>{description}</p>
                </IonLabel>
                <IonRadio value={url} />
              </ServerItem>
            );
          }}
        </VList>
      );
    }

    if (loading) return <CenteredSpinner />;

    return <Empty>No results</Empty>;
  })();

  return (
    <>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton />
          </IonButtons>
          <IonTitle>Pick Server</IonTitle>
        </IonToolbar>
        <IonToolbar>
          <IonSearchbar
            value={search}
            onIonInput={(e) => setSearch(e.detail.value || "")}
            onKeyDown={(e) => {
              if (e.key !== "Enter") return;

              if (e.target instanceof HTMLElement) e.target.blur();
            }}
            inputMode="url"
            enterkeyhint="go"
          />
        </IonToolbar>
      </IonHeader>
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
}

function normalize(instance: GetSiteResponse | LVInstance): Instance {
  if ("baseurl" in instance) {
    return {
      url: instance.baseurl,
      icon: instance.icon,
      description: instance.desc,
    };
  }

  return {
    url: new URL(instance.site_view.site.actor_id).hostname,
    icon: instance.site_view.site.icon,
    description: instance.site_view.site.description,
  };
}
