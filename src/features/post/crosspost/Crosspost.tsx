import { PostView } from "lemmy-js-client";

import { cx } from "#/helpers/css";

import CrosspostContainer from "./CrosspostContainer";
import CrosspostContents from "./CrosspostContents";

import styles from "./CrosspostContents.module.css";

export interface CrosspostProps {
  post: PostView;
  url: string;
  className?: string;
}

export default function Crosspost(props: CrosspostProps) {
  return (
    <CrosspostContainer
      {...props}
      el="div"
      className={cx(styles.container, props.className)}
    >
      {({ crosspost, hasBeenRead }) => (
        <CrosspostContents
          {...props}
          crosspost={crosspost}
          hasBeenRead={hasBeenRead}
        />
      )}
    </CrosspostContainer>
  );
}
