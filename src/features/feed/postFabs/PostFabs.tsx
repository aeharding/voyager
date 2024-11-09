import { ComponentProps } from "react";

import { useAppSelector } from "#/store";

import HidePostsFab from "./HidePostsFab";

export default function PostFabs(props: ComponentProps<typeof HidePostsFab>) {
  const showHideReadButton = useAppSelector(
    (state) => state.settings.general.posts.showHideReadButton,
  );

  return <>{showHideReadButton && <HidePostsFab {...props} />}</>;
}
