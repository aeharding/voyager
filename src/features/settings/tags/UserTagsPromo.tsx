import { css } from "@linaria/core";
import { styled } from "@linaria/react";

import emptyStateIconStyles from "#/routes/pages/shared/emptyStateIconStyles";

import TagSvg from "./tag.svg?react";

const ListContainer = styled.div`
  display: flex;
`;

const List = styled.ul`
  margin: 0 auto;
  padding: 0 32px;

  line-height: 1.7;

  display: flex;
  flex-direction: column;
  gap: 0.5em;
`;

const rainbowText = css`
  background: linear-gradient(
    to right,
    #ff0000,
    #ffa500,
    #ffff00,
    #008000,
    #0000ff,
    #4b0082,
    #ee82ee
  );
  background-clip: text;
  color: transparent;
  font-weight: bold;
`;

export default function UserTagsPromo() {
  return (
    <>
      <TagSvg className={emptyStateIconStyles} />
      <ListContainer>
        <List>
          <li>
            Tags are saved on-device,
            <br />
            only visible to you
          </li>
          <li>Track how you&apos;ve voted on users</li>
          <li>
            Custom <span className={rainbowText}>tag colors</span> ✨
          </li>
        </List>
      </ListContainer>
    </>
  );
}
