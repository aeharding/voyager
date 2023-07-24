import styled from "@emotion/styled";
import { useAppSelector } from "../../store";
import Markdown from "../shared/Markdown";
import { CenteredSpinner } from "../post/detail/PostDetail";
import { css } from "@emotion/react";
import CommunityCounts from "../community/sidebar/CommunityCounts";
import InstanceAdmins from "./InstanceAdmins";

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
    <>
      <Container className="ion-padding-start ion-padding-end ion-padding-top">
        {site.banner && (
          <BannerImg src={site.banner} alt={`Banner for ${site.actor_id}`} />
        )}
        <Markdown>{site.sidebar ?? site.description ?? ""}</Markdown>
        <CommunityCounts counts={counts} />
      </Container>
      <InstanceAdmins admins={admins} />
    </>
  );
}
