import { styled } from "@linaria/react";
import { CommunityAggregates, Person, SiteAggregates } from "lemmy-js-client";
import React from "react";
import Markdown from "../../shared/Markdown";
import SidebarCounts from "./SidebarCounts";
import SidebarOwners from "./SidebarOwners";

const Container = styled.div`
  line-height: 1.5;
`;

const BannerImg = styled.img`
  margin-top: calc(var(--padding-top) * -1);
  margin-left: calc(var(--padding-start) * -1);
  margin-right: calc(var(--padding-end) * -1);
  width: calc(100% + var(--padding-start) + var(--padding-end));
  max-width: initial;

  max-height: 300px;
  object-fit: cover;
`;

interface GenericSidebarProps {
  sidebar: string;
  people: Person[];
  counts: SiteAggregates | CommunityAggregates;
  extraBadges?: React.ReactNode;
  type: "instance" | "community";
  banner?: string;
  name: string;
}

export default function GenericSidebar({
  sidebar,
  people,
  type,
  counts,
  banner,
  extraBadges,
  name,
}: GenericSidebarProps) {
  return (
    <>
      <Container className="ion-padding-start ion-padding-end ion-padding-top">
        {banner && <BannerImg src={banner} alt={`Banner for ${name}`} />}
        <Markdown>{sidebar}</Markdown>
        <SidebarCounts counts={counts} />
        {extraBadges}
      </Container>
      <SidebarOwners
        people={people}
        type={type === "community" ? "mods" : "admins"}
      />
    </>
  );
}
