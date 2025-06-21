import { IonIcon } from "@ionic/react";
import { chevronForward } from "ionicons/icons";
import { useCallback, useEffect, useRef } from "react";
import { Link, useParams } from "react-router-dom";

import { useBuildGeneralBrowseLink } from "#/helpers/routes";
import { useOpenInSecondColumnIfNeededProps } from "#/routes/twoColumn/useOpenInSecondColumnIfNeededProps";

import styles from "./ViewAllComments.module.css";
interface ViewAllCommentsProps {
  onHeight?: (height: number) => void;
}

export default function ViewAllComments({ onHeight }: ViewAllCommentsProps) {
  const { community, id } = useParams<{ community: string; id: string }>();
  const buildGeneralBrowseLink = useBuildGeneralBrowseLink();
  const ref = useRef<HTMLAnchorElement>(null);

  const heightChange = useCallback(() => {
    requestAnimationFrame(() => {
      if (!ref.current) return;

      onHeight?.(ref.current.getBoundingClientRect().height);
    });
  }, [onHeight]);

  useEffect(() => {
    heightChange();
  }, [heightChange]);

  const linkProps = useOpenInSecondColumnIfNeededProps(
    buildGeneralBrowseLink(`/c/${community}/comments/${id}`),
  );

  return (
    <Link
      ref={ref}
      slot="fixed"
      className={styles.link}
      onClick={linkProps.onClick}
      to={linkProps.routerLink}
    >
      <div className={styles.text}>
        <div>View All Comments</div>
        <aside>This is a single comment thread from the post.</aside>
      </div>
      <IonIcon className={styles.chevron} icon={chevronForward} />
    </Link>
  );
}
