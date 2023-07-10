import styled from "@emotion/styled";
import { css } from "@emotion/react";
import PostGalleryImg from "../../../gallery/PostGalleryImg";

export const Image = styled(PostGalleryImg)<{ blur: boolean }>`
  width: 100%;
  max-width: none;
  max-height: max(200vh, 2000px);
  object-fit: contain;
  -webkit-touch-callout: default;

  ${({ blur }) =>
    blur &&
    css`
      filter: blur(40px);

      // https://graffino.com/til/CjT2jrcLHP-how-to-fix-filter-blur-performance-issue-in-safari
      transform: translate3d(0, 0, 0);
    `}
`;
