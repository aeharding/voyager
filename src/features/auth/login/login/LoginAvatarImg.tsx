import { useState } from "react";

import { cx } from "#/helpers/css";
import { getImageSrc } from "#/services/lemmy";

import lemmyLogo from "../lemmyLogo.svg";

import styles from "./LoginAvatarImg.module.css";

interface LoginAvatarImgProps {
  src: string | undefined;
}

export default function LoginAvatarImg({ src }: LoginAvatarImgProps) {
  const [loaded, setLoaded] = useState(false);

  return (
    <img
      className={cx(styles.img, !loaded && styles.loading)}
      src={
        src
          ? getImageSrc(src, {
              size: 24,
            })
          : lemmyLogo
      }
      onLoad={() => setLoaded(true)}
    />
  );
}
