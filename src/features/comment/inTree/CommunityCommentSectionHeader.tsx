import { IonButton, IonIcon } from "@ionic/react";
import {
  chatbubbleOutline,
  chevronDownOutline,
  chevronUpOutline,
  tabletPortraitOutline,
} from "ionicons/icons";
import { Community, SubscribedType } from "threadiverse";

import useCommunityActions from "#/features/community/useCommunityActions";
import CommunityLink from "#/features/labels/links/CommunityLink";
import { formatNumber } from "#/helpers/number";

import styles from "./CommunityCommentSectionHeader.module.css";

interface CommunityCommentSectionHeaderProps {
  community: Community;
  subscribed: SubscribedType;
  commentCount: number;
  isCollapsed?: boolean;
  onToggle?: () => void;
}

export default function CommunityCommentSectionHeader({
  community,
  subscribed,
  commentCount,
  isCollapsed = false,
  onToggle,
}: CommunityCommentSectionHeaderProps) {
  const { sidebar } = useCommunityActions(community, subscribed);

  return (
    <div
      className={styles.container}
      onClick={onToggle}
      style={onToggle ? { cursor: "pointer" } : undefined}
    >
      <CommunityLink
        community={community}
        subscribed={subscribed}
        showInstanceWhenRemote
      />
      <div className={styles.right}>
        <IonIcon icon={chatbubbleOutline} />
        <span>{formatNumber(commentCount)}</span>
        <IonButton
          fill="clear"
          size="small"
          onClick={(e) => {
            e.stopPropagation();
            sidebar();
          }}
        >
          <IonIcon slot="icon-only" icon={tabletPortraitOutline} />
        </IonButton>
        {onToggle && (
          <IonIcon icon={isCollapsed ? chevronDownOutline : chevronUpOutline} />
        )}
      </div>
    </div>
  );
}
