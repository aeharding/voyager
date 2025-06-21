import { useState } from "react";

import CachedImg from "#/features/media/CachedImg";
import { cx } from "#/helpers/css";

import lemmyLogo from "../lemmyLogo.svg";

import styles from "./LoginAvatarImg.module.css";

interface LoginAvatarImgProps {
  src: string | undefined;
}

export default function LoginAvatarImg({ src }: LoginAvatarImgProps) {
  const [loaded, setLoaded] = useState(false);

  return (
    <CachedImg
      className={cx(styles.img, !loaded && styles.loading)}
      src={src ?? lemmyLogo}
      pictrsOptions={{
        size: 24,
      }}
      onLoad={() => setLoaded(true)}
    />
  );
}
