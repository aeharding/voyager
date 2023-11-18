import styled from "@emotion/styled";
import { css } from "@emotion/react";
import PostMedia from "../../../gallery/PostMedia";

export const InFeedPostMedia = styled(PostMedia)<{ blur: boolean }>`
  width: 100%;
  max-width: none;
  max-height: max(100vh, 1000px);
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
