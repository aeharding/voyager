import { css } from "@linaria/core";
import { styled } from "@linaria/react";
import { Link } from "react-router-dom";

export const LinkContainer = styled.span`
  display: inline;

  font-weight: 500;
  white-space: nowrap;

  text-overflow: ellipsis;
  overflow: hidden;

  position: relative;
`;

export const StyledLink = styled(Link)`
  text-decoration: none;
  color: inherit;
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
