import { CommunityAggregates, Person, SiteAggregates } from "lemmy-js-client";

import LargeFeedMedia from "#/features/post/inFeed/large/media/LargeFeedMedia";
import { MaxWidthContainer } from "#/features/shared/AppContent";
import Markdown from "#/features/shared/markdown/Markdown";

import SidebarCounts from "./SidebarCounts";
import SidebarOwners from "./SidebarOwners";

import styles from "./GenericSidebar.module.css";

interface GenericSidebarProps {
  sidebar: string;
  people: Person[];
  counts: SiteAggregates | CommunityAggregates;
  extraBadges?: React.ReactNode;
  type: "instance" | "community";
  banner?: string;
  name: string;
  id: string;
}

export default function GenericSidebar({
  sidebar,
  people,
  type,
  counts,
  banner,
  extraBadges,
  name,
  id,
}: GenericSidebarProps) {
  return (
    <MaxWidthContainer>
      <div className={styles.container}>
        {banner && (
          <LargeFeedMedia
            className={styles.bannerImg}
            src={banner}
            alt={`Banner for ${name}`}
            defaultAspectRatio={2.5}
          />
        )}
        <Markdown id={id}>{sidebar}</Markdown>
        <SidebarCounts counts={counts} />
        {extraBadges}
      </div>
      <SidebarOwners
        people={people}
        type={type === "community" ? "mods" : "admins"}
      />
    </MaxWidthContainer>
  );
}
