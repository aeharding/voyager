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
import Legal from "../join/Legal";
import { requestJoinSiteData } from "../join/joinSlice";
import { GetSiteResponse } from "lemmy-js-client";
import { isValidHostname } from "../../../../helpers/url";

const ServerThumbnail = styled(IonThumbnail)`
  --size: 32px;
  --border-radius: 6px;
  margin: 16px 16px 16px 0;
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
  const [customInstance, setCustomInstance] = useState<
    GetSiteResponse | undefined
  >();

  const matchingInstances = useMemo(
    () =>
      instances.filter((instance) =>
        instance.baseurl.includes(search.toLowerCase()),
      ),
    [instances, search],
  );

  const allInstances = customInstance
    ? [...matchingInstances, customInstance]
    : matchingInstances;

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
    if (!selection) return;

    await dispatch(requestJoinSiteData(selection));

    contentRef.current?.closest("ion-nav")?.push(() => <Legal />);
  }

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
          <VList
            count={allInstances.length}
            className="ion-content-scroll-host"
          >
            {(i) => {
              const instance = allInstances[i]!;

              const { url, icon, description } = (() => {
                if ("baseurl" in instance) {
                  return {
                    url: instance.baseurl,
                    icon: instance.icon,
                    description: instance.desc,
                  };
                }

                return {
                  url: instance.site_view.site.actor_id,
                  icon: instance.site_view.site.icon,
                  description: instance.site_view.site.description,
                };
              })();

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
        </IonRadioGroup>
      </IonContent>
      <IonFooter>
        <IonToolbar>
          <IonButton fill="solid" expand="block">
            Next
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
