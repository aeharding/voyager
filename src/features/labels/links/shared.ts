import { css } from "@emotion/react";
import styled from "@emotion/styled";
import { Link } from "react-router-dom";

export const StyledLink = styled(Link)`
  text-decoration: none;
  color: inherit;
  font-weight: 500;
  white-space: nowrap;
`;

export const hideCss = css`
  position: relative;

  &:after {
    content: "";
    position: absolute;
    inset: 0;
    background: var(--ion-color-step-150, #ccc);
  }
`;
