import { CommunityView } from "lemmy-js-client";
import Markdown from "../../shared/Markdown";
import styled from "@emotion/styled";
import CommunityCounts from "./CommunityCounts";

const Container = styled.div`
  line-height: 1.5;
`;

interface SidebarProps {
  community: CommunityView;
}

export default function Sidebar({ community }: SidebarProps) {
  const description = community.community.description;

  return (
    <>
      <Container className="ion-padding">
        <CommunityCounts counts={community.counts} />
        {description ? (
          <Markdown>{description}</Markdown>
        ) : (
          <p>
            <em>No community description available</em>
          </p>
        )}
      </Container>
    </>
  );
}
