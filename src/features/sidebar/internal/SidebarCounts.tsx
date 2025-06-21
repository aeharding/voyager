import { IonBadge } from "@ionic/react";
import { CommunityAggregates, SiteAggregates } from "threadiverse";

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
      {"users_active_month" in counts && (
        <IonBadge color="success">
          {formatNumber(counts.users_active_month)} users per month
        </IonBadge>
      )}
      {"users_active_week" in counts && (
        <IonBadge color="tertiary">
          {formatNumber(counts.users_active_week)} per week
        </IonBadge>
      )}
      {"users_active_day" in counts && (
        <IonBadge color="light">
          {formatNumber(counts.users_active_day)} per day
        </IonBadge>
      )}
    </>
  );
}
