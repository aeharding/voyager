import styled from "@emotion/styled";
import { useAppSelector } from "../../store";
import Markdown from "../shared/Markdown";
import { CenteredSpinner } from "../post/detail/PostDetail";
import { css } from "@emotion/react";
import SidebarOwners from "./SidebarOwners";
import {
  CommunityAggregates,
  CommunityView,
  Person,
  SiteAggregates,
} from "lemmy-js-client";
import React from "react";
import { getHandle } from "../../helpers/lemmy";
import SidebarCounts from "./SidebarCounts";

const Container = styled.div`
  line-height: 1.5;
`;

const BannerImg = styled.img`
  margin-top: calc(var(--padding-top) * -1);
  margin-left: calc(var(--padding-start) * -1);
  margin-right: calc(var(--padding-end) * -1);
  width: calc(100% + var(--padding-start) + var(--padding-end));
  max-width: initial;
`;

interface SidebarProps {
  community?: CommunityView;
}

export default function Sidebar({ community }: SidebarProps) {
  if (community) return <CommunitySidebar community={community} />;

  return <InstanceSidebar />;
}

interface CommunitySidebarProps {
  community: CommunityView;
}

function CommunitySidebar({ community }: CommunitySidebarProps) {
  const mods = useAppSelector(
    (state) => state.community.modsByHandle[getHandle(community.community)]
  );

  return (
    <UniversalSidebar
      type="community"
      sidebar={
        community.community.description ??
        "**No community description available**"
      }
      people={mods?.map((m) => m.moderator) ?? []}
      counts={community.counts}
    />
  );
}

function InstanceSidebar() {
  const siteView = useAppSelector((state) => state.auth.site?.site_view);
  const admins = useAppSelector((state) => state.auth.site?.admins);

  if (!siteView || !admins)
    return (
      <CenteredSpinner
        css={css`
          margin-top: 25vh;
        `}
      />
    );

  const { site, counts } = siteView;

  return (
    <UniversalSidebar
      type="instance"
      sidebar={site.sidebar ?? site.description ?? ""}
      people={admins.map((a) => a.person)}
      counts={counts}
      beforeMarkdown={
        site.banner ? (
          <BannerImg src={site.banner} alt={`Banner for ${site.actor_id}`} />
        ) : undefined
      }
    />
  );
}

interface UniversalSidebarProps {
  sidebar: string;
  people: Person[];
  counts: SiteAggregates | CommunityAggregates;
  beforeMarkdown?: React.ReactNode;
  type: "instance" | "community";
}

function UniversalSidebar({
  sidebar,
  people,
  type,
  counts,
  beforeMarkdown,
}: UniversalSidebarProps) {
  return (
    <>
      <Container className="ion-padding-start ion-padding-end ion-padding-top">
        {beforeMarkdown}
        <Markdown>{sidebar}</Markdown>
        <SidebarCounts counts={counts} />
      </Container>
      <SidebarOwners
        people={people}
        type={type === "community" ? "mods" : "admins"}
      />
    </>
  );
}
