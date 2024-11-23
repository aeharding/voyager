import COMMENT_THEMES from "#/features/settings/appearance/themes/commentsTheme/values";
import { sv } from "#/helpers/css";
import { useAppSelector } from "#/store";

import styles from "./CommentContainer.module.css";

interface ContainerProps extends React.PropsWithChildren {
  depth: number;
  hidden?: boolean;
}

export default function CommentContainer(props: ContainerProps) {
  const commentsTheme = useAppSelector(
    (state) => state.settings.appearance.commentsTheme,
  );

  return (
    <div
      {...props}
      className={styles.container}
      style={sv({
        depth: props.depth > 0 ? "1em" : 0,
        background: props.depth
          ? COMMENT_THEMES[commentsTheme][
              (props.depth - 1) % COMMENT_THEMES[commentsTheme].length
            ]!
          : "none",
        opacity: props.hidden ? 0 : 1,
      })}
    />
  );
}
