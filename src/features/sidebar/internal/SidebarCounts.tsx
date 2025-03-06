import { IonBadge } from "@ionic/react";
import { CommunityAggregates, SiteAggregates } from "lemmy-js-client";

import { formatNumber } from "#/helpers/number";

interface SidebarCountsProps {
  counts: CommunityAggregates | SiteAggregates;
}

export default function SidebarCounts({ counts }: SidebarCountsProps) {
  return (
    <>
      {"subscribers" in counts ? (
        <>
          <IonBadge>
            {formatNumber(counts.subscribers)} subscribers
          </IonBadge>{" "}
        </>
      ) : (
        <>
          <IonBadge>
            {formatNumber(counts.communities)} communities
          </IonBadge>{" "}
        </>
      )}
      <IonBadge color="danger">{formatNumber(counts.posts)} posts</IonBadge>{" "}
      <IonBadge color="warning">
        {formatNumber(counts.comments)} comments
      </IonBadge>{" "}
      <IonBadge color="success">
        {formatNumber(counts.users_active_month)} users per month
      </IonBadge>{" "}
      <IonBadge color="tertiary">
        {formatNumber(counts.users_active_week)} per week
      </IonBadge>{" "}
      <IonBadge color="light">
        {formatNumber(counts.users_active_day)} per day
      </IonBadge>
    </>
  );
}
