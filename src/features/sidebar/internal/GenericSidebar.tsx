import { CommunityAggregates, Person, SiteAggregates } from "lemmy-js-client";
import React from "react";
import Markdown from "../../shared/Markdown";
import SidebarCounts from "./SidebarCounts";
import SidebarOwners from "./SidebarOwners";
import styled from "@emotion/styled";

const Container = styled.div`
  line-height: 1.5;
`;

interface GenericSidebarProps {
  sidebar: string;
  people: Person[];
  counts: SiteAggregates | CommunityAggregates;
  beforeMarkdown?: React.ReactNode;
  type: "instance" | "community";
}

export default function GenericSidebar({
  sidebar,
  people,
  type,
  counts,
  beforeMarkdown,
}: GenericSidebarProps) {
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
