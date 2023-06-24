import { getHandle } from "../../../helpers/lemmy";
import { useBuildGeneralBrowseLink } from "../../../helpers/routes";
import { Community } from "lemmy-js-client";
import Handle from "../Handle";
import { StyledLink } from "./shared";
import ItemIcon from "../img/ItemIcon";
import { css } from "@emotion/react";

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
      <ItemIcon
        item={community}
        size={24}
        css={css`
          margin-right: 0.4rem;
          vertical-align: middle;
        `}
      />

      <Handle
        item={community}
        showInstanceWhenRemote={showInstanceWhenRemote}
      />
    </StyledLink>
  );
}
