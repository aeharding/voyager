import { css } from "@emotion/react";
import { useAppSelector } from "../../../store";
import { CenteredSpinner } from "../../post/detail/PostDetail";
import GenericSidebar from "./GenericSidebar";
import styled from "@emotion/styled";

const BannerImg = styled.img`
  margin-top: calc(var(--padding-top) * -1);
  margin-left: calc(var(--padding-start) * -1);
  margin-right: calc(var(--padding-end) * -1);
  width: calc(100% + var(--padding-start) + var(--padding-end));
  max-width: initial;
`;

export default function InstanceSidebar() {
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
    <GenericSidebar
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
