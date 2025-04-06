import { IonLoading } from "@ionic/react";
import { useImperativeHandle, useRef, useState } from "react";

import { followCommunity } from "#/features/community/communitySlice";
import { getCommunityHandleFromActorId } from "#/helpers/lemmy";
import { getApId } from "#/helpers/lemmyCompat";
import { subscribedStarterPacks } from "#/helpers/toastMessages";
import { parseUrl } from "#/helpers/url";
import useAppToast from "#/helpers/useAppToast";
import useClient from "#/helpers/useClient";
import { useAppDispatch, useAppSelector } from "#/store";

import { PackType } from "./StarterPacksModal";

export interface BulkSubscriberHandle {
  submit: (selectedPacks: PackType[]) => void;
}

interface BulkSubscriberProps {
  ref: React.RefObject<BulkSubscriberHandle | undefined>;
  onDismiss: () => void;
}

export default function BulkSubscriber({
  ref,
  onDismiss,
}: BulkSubscriberProps) {
  const client = useClient();
  const presentToast = useAppToast();
  const dispatch = useAppDispatch();
  const [isLoading, setIsLoading] = useState(false);
  const [processingLabel, setProcessingLabel] = useState("");
  const follows = useAppSelector(
    (state) => state.site.response?.my_user?.follows,
  );
  const communityByHandle = useAppSelector(
    (state) => state.community.communityByHandle,
  );
  const connectedInstance = useAppSelector(
    (state) => state.auth.connectedInstance,
  );

  const pendingRef = useRef<string[]>([]);

  useImperativeHandle(ref, () => ({
    submit,
  }));

  function submit(packs: PackType[]) {
    setIsLoading(true);

    pendingRef.current = [];

    for (const pack of packs) {
      pendingRef.current.push(...pack.communities);
      pendingRef.current = pendingRef.current.filter((ap_id) => {
        const community =
          communityByHandle[
            getCommunityHandleFromActorId(ap_id, connectedInstance)!
          ];

        if (community) return community.subscribed === "NotSubscribed";
        if (follows?.find((f) => getApId(f.community) === ap_id)) return false;

        return true;
      });
    }

    if (!pendingRef.current.length) {
      presentToast(subscribedStarterPacks);
      onDismiss();
      return;
    }

    onNext();
  }

  async function onNext() {
    const current = pendingRef.current.pop();

    if (!current) {
      setIsLoading(false);
      presentToast(subscribedStarterPacks);
      onDismiss();
      return;
    }

    setProcessingLabel(
      (() => {
        const url = parseUrl(current);

        return url?.pathname.split("/").pop() ?? current;
      })(),
    );

    let community;

    try {
      community = (await client.resolveObject({ q: current })).community;
    } catch (error) {
      console.error(error);
      onNext();
      return;
    }

    if (!community) {
      onNext();
      return;
    }

    try {
      await dispatch(followCommunity(true, community.community.id));
    } catch (error) {
      console.error(error);
      onNext();
      return;
    }

    onNext();
  }

  return (
    <IonLoading isOpen={isLoading} message={`Subscribing ${processingLabel}`} />
  );
}
