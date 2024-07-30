import { styled } from "@linaria/react";
import { useAppSelector } from "../../store";
import { getRemoteHandle } from "../../helpers/lemmy";
import { Person } from "lemmy-js-client";
import { getTextColorFor } from "../../helpers/color";
import React from "react";

const TagContainer = styled.span`
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;

  background: var(--bg, var(--lightroom-bg));

  border-radius: 4px;
  padding: 0 4px;

  min-width: 0; // when contained in flexbox
`;

interface UserTagProps {
  person: Person;
  prefix?: React.ReactNode;
}

export default function UserTag({ person, prefix }: UserTagProps) {
  const tag = useAppSelector(
    (state) => state.userTag.tagByRemoteHandle[getRemoteHandle(person)],
  );

  if (!tag || tag === "pending") return;
  if (!tag.text) return;

  return (
    <>
      {prefix}
      <TagContainer
        style={
          tag.color
            ? {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                ["--bg" as any]: tag.color,
                color: getTextColorFor(tag.color),
              }
            : undefined
        }
      >
        {tag.text}
      </TagContainer>
    </>
  );
}
