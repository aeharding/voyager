import { sv } from "#/helpers/css";

import styles from "./CommentHr.module.css";

interface CommentHrProps {
  depth: number;
}

export default function CommentHr({ depth }: CommentHrProps) {
  return (
    <div className={styles.hrContainer} style={sv({ depth })}>
      <hr className={styles.hr} />
    </div>
  );
}
