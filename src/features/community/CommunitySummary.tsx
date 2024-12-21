import { IonItem } from "@ionic/react";
import { heart } from "ionicons/icons";
import { CommunityView } from "lemmy-js-client";

import Ago from "#/features/labels/Ago";
import CommunityLink from "#/features/labels/links/CommunityLink";
import { ActionButton } from "#/features/post/actions/ActionButton";
import InlineMarkdown from "#/features/shared/markdown/InlineMarkdown";
import { buildCommunityLink } from "#/helpers/appLinkBuilder";
import { cx } from "#/helpers/css";
import { formatNumber } from "#/helpers/number";
import { useBuildGeneralBrowseLink } from "#/helpers/routes";

import { ToggleIcon } from "./ToggleIcon";
import useCommunityActions from "./useCommunityActions";

import styles from "./CommunitySummary.module.css";

interface CommunitySummaryProps {
  community: CommunityView;
}

export default function CommunitySummary({ community }: CommunitySummaryProps) {
  const buildGeneralBrowseLink = useBuildGeneralBrowseLink();
  const { isSubscribed, subscribe } = useCommunityActions(
    community.community,
    community.subscribed,
  );

  return (
    <IonItem
      className={styles.item}
      routerLink={buildGeneralBrowseLink(
        buildCommunityLink(community.community),
      )}
      detail={false}
    >
      <div className={cx(styles.contents)}>
        <div className={styles.title}>
          <CommunityLink
            className={styles.communityLink}
            community={community.community}
            showInstanceWhenRemote
            subscribed={community.subscribed}
            hideSubscribed
          />
          <div className={styles.rightContainer}>
            <ActionButton
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();

                subscribe();
              }}
            >
              <ToggleIcon icon={heart} selected={isSubscribed} />
            </ActionButton>
          </div>
        </div>
        <div className={styles.stats}>
          {formatNumber(community.counts.subscribers)} Subscriber
          {community.counts.subscribers !== 1 ? "s" : ""} ·{" "}
          <Ago date={community.community.published} /> Old{" "}
        </div>
        {community.community.description && (
          <div className={styles.description}>
            <InlineMarkdown>{community.community.description}</InlineMarkdown>
          </div>
        )}
      </div>
    </IonItem>
  );
}
