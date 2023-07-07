import { type ReactNode } from "react";
import styled from "@emotion/styled";
import { ReactComponent as SelfSvg } from "./self.svg";
import { PostView } from "lemmy-js-client";
import { isUrlImage } from "../../../../helpers/lemmy";
import { useMemo } from "react";
import { findLoneImage } from "../../../../helpers/markdown";
import { css } from "@emotion/react";
import { isNsfw } from "../../../labels/Nsfw";
import PostGallery from "../../../gallery/PostGallery";

const Container = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;

  flex: 0 0 auto;

  width: max(11%, 60px);
  aspect-ratio: 1;
  background: var(--ion-color-light);
  border-radius: 8px;

  overflow: hidden;

  svg {
    width: 60%;
    opacity: 0.5;
  }
`;

const StyledImg = styled(PostGallery)<{ blur: boolean }>`
  width: 100%;
  height: 100%;
  object-fit: cover;

  ${({ blur }) =>
    blur &&
    css`
      filter: blur(6px);

      // https://graffino.com/til/CjT2jrcLHP-how-to-fix-filter-blur-performance-issue-in-safari
      transform: translate3d(0, 0, 0);
    `}
`;

interface ImgProps {
  post: PostView;
}

export default function Thumbnail({ post }: ImgProps) {
  const markdownLoneImage = useMemo(
    () => (post.post.body ? findLoneImage(post.post.body) : undefined),
    [post]
  );

  const postImageSrc = (() => {
    if (post.post.url && isUrlImage(post.post.url)) return post.post.url;

    if (markdownLoneImage) return markdownLoneImage.url;

    return post.post.thumbnail_url;
  })();

  const ThumbnailContainer = (props: { children: ReactNode }): ReactNode => {
    let maybeLinkProps = {};

    if (!postImageSrc && post.post.url) {
      maybeLinkProps = {
        as: "a",
        href: post.post.url,
        target: "_blank",
        rel: "noopener noreferrer",
      };
    }

    return (
      <Container onClick={(e) => e.stopPropagation()} {...maybeLinkProps}>
        {props.children}
      </Container>
    );
  };

  return (
    <ThumbnailContainer>
      {postImageSrc ? (
        <StyledImg post={post} blur={isNsfw(post)} />
      ) : (
        <SelfSvg />
      )}
    </ThumbnailContainer>
  );
}
