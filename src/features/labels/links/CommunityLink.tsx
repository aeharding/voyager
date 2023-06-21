import { getHandle } from "../../../helpers/lemmy";
import { useBuildGeneralBrowseLink } from "../../../helpers/routes";
import { Community } from "lemmy-js-client";
import Handle from "../Handle";
import { StyledLink } from "./shared";

interface CommunityLinkProps {
  community: Community;
  showInstanceWhenRemote?: boolean;

  className?: string;
}

export default function CommunityLink({
  community,
  className,
  showInstanceWhenRemote,
}: CommunityLinkProps) {
  const buildGeneralBrowseLink = useBuildGeneralBrowseLink();

  return (
    <StyledLink
      to={buildGeneralBrowseLink(`/c/${getHandle(community)}`)}
      onClick={(e) => e.stopPropagation()}
      className={className}
    >
      <Handle
        item={community}
        showInstanceWhenRemote={showInstanceWhenRemote}
      />
    </StyledLink>
  );
}
