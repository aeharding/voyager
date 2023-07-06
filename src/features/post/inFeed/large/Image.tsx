import styled from "@emotion/styled";
import PostGallery from "../../../gallery/PostGallery";
import { css } from "@emotion/react";

export const Image = styled(PostGallery)<{ blur: boolean }>`
  width: 100%;
  max-width: none;

  ${({ blur }) =>
    blur &&
    css`
      filter: blur(40px);

      // https://graffino.com/til/CjT2jrcLHP-how-to-fix-filter-blur-performance-issue-in-safari
      transform: translate3d(0, 0, 0);
    `}
`;
