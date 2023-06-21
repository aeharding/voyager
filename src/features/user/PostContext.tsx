import styled from "@emotion/styled";
import { Community, Post } from "lemmy-js-client";
import { getHandle } from "../../helpers/lemmy";
import { Link } from "react-router-dom";
import { useBuildGeneralBrowseLink } from "../../helpers/routes";

const ContainerLink = styled(Link)`
  padding: 0.5rem 0.75rem;

  background: var(--ion-tab-bar-background, var(--ion-color-step-50, #f7f7f7));
  color: var(--ion-color-dark);
  border-radius: 0.5rem;

  font-size: 0.95em;

  display: flex;
  flex-direction: column;
  gap: 0.4rem;

  text-decoration: none;
`;

const Name = styled.div`
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const CommunityName = styled.div`
  opacity: 0.7;
`;

interface PostContextProps {
  post: Post;
  community: Community;
}

export default function PostContext({ post, community }: PostContextProps) {
  const buildGeneralBrowseLink = useBuildGeneralBrowseLink();

  return (
    <ContainerLink
      onClick={(e) => e.stopPropagation()}
      draggable={false}
      to={buildGeneralBrowseLink(
        `/c/${getHandle(community)}/comments/${post.id}`
      )}
    >
      <Name>{post.name}</Name>
      <CommunityName>{getHandle(community)}</CommunityName>
    </ContainerLink>
  );
}
