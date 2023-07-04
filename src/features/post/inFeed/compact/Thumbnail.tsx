import styled from "@emotion/styled";
import { ReactComponent as SelfSvg } from "./self.svg";
import { PostView } from "lemmy-js-client";
import Img from "../../detail/Img";
import { isUrlImage } from "../../../../helpers/lemmy";
import { useMemo } from "react";
import { findLoneImage } from "../../../../helpers/markdown";
import { css } from "@emotion/react";
import { isNsfw } from "../../../labels/Nsfw";

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

const StyledImg = styled(Img)<{ blur: boolean }>`
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

  const src = (() => {
    if (post.post.url && isUrlImage(post.post.url)) return post.post.url;

    if (markdownLoneImage) return markdownLoneImage.url;

    return post.post.thumbnail_url;
  })();

  return (
    <Container onClick={(e) => src && e.stopPropagation()}>
      {src ? <StyledImg src={src} blur={isNsfw(post)} /> : <SelfSvg />}
    </Container>
  );
}
