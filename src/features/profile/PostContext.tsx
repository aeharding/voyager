import styled from "@emotion/styled";
import { CommunitySafe, Post } from "lemmy-js-client";
import { getHandle } from "../../helpers/lemmy";
import { useParams } from "react-router";
import { Link } from "react-router-dom";
import { useAppSelector } from "../../store";
import { useBuildGeneralBrowseLink } from "../../helpers/routes";

const ContainerLink = styled(Link)`
  padding: 0.5rem 0.75rem;

  background: var(--ion-color-step-50);
  color: var(--ion-color-medium);
  border-radius: 0.5rem;

  font-size: 0.95em;

  display: flex;
  flex-direction: column;
  gap: 0.75rem;

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
  community: CommunitySafe;
}

export default function PostContext({ post, community }: PostContextProps) {
  const connectedInstance = useAppSelector(
    (state) => state.auth.connectedInstance
  );
  const buildGeneralBrowseLink = useBuildGeneralBrowseLink();

  return (
    <ContainerLink
      onClick={(e) => e.stopPropagation()}
      to={buildGeneralBrowseLink(
        `/c/${getHandle(community)}/comments/${post.id}`
      )}
    >
      <Name>{post.name}</Name>
      <CommunityName>{getHandle(community)}</CommunityName>
    </ContainerLink>
  );
}
