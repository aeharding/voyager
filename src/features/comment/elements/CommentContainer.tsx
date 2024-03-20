import { styled } from "@linaria/react";
import { CommentsThemeType } from "../../../services/db";
import COMMENT_THEMES from "../../settings/appearance/themes/commentsTheme/values";
import { ComponentProps } from "react";
import { useAppSelector } from "../../../store";

interface ContainerProps {
  depth: number;
  highlighted?: boolean;
  hidden?: boolean;
  themeName: CommentsThemeType;
}

const Container = styled.div<ContainerProps>`
  display: flex;

  position: relative;
  width: 100%;

  gap: 12px;

  font-size: 0.9375em;

  display: flex;
  flex-direction: column;

  padding-left: ${({ depth }) => (depth > 0 ? "1em" : 0)};

  &:before {
    content: "";
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    width: 2px;
    filter: none;

    .ion-palette-dark & {
      filter: brightness(0.7);
    }

    background: ${({ themeName, depth }) =>
      depth
        ? COMMENT_THEMES[themeName][
            (depth - 1) % COMMENT_THEMES[themeName].length
          ]!
        : "none"};

    opacity: ${({ hidden }) => (hidden ? 0 : 1)};
  }
`;

export default function CommentContainer(
  props: Omit<ComponentProps<typeof Container>, "themeName">,
) {
  const commentsTheme = useAppSelector(
    (state) => state.settings.appearance.commentsTheme,
  );

  return <Container {...props} themeName={commentsTheme} />;
}
