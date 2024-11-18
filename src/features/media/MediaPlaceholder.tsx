import { IonIcon } from "@ionic/react";
import { cx } from "@linaria/core";
import { styled } from "@linaria/react";
import { imageOutline } from "ionicons/icons";
import { HTMLAttributes } from "react";

import { MEDIA_EL_CLASSNAME } from "./InlineMedia";

const PlaceholderContainer = styled.span<{ defaultAspectRatio: number }>`
  display: flex;

  &.not-loaded {
    align-items: center;
    justify-content: center;

    aspect-ratio: ${({ defaultAspectRatio }) => defaultAspectRatio};
    position: relative;

    .${MEDIA_EL_CLASSNAME} {
      position: absolute;
      top: 0;
      left: 0;
    }
  }
`;

const LoadingIonIcon = styled(IonIcon)`
  opacity: 0.5;
  font-size: 24px;
`;

const Error = styled.span`
  opacity: 0.5;
  padding: 16px;
`;

type State = "loading" | "loaded" | "error" | "custom";

interface MediaPlaceholderProps extends HTMLAttributes<HTMLDivElement> {
  state: State;
  defaultAspectRatio?: number;
  children?: React.ReactNode;
}

export default function MediaPlaceholder({
  state,
  className,
  children,
  defaultAspectRatio = 1.2,
  ...rest
}: MediaPlaceholderProps) {
  function renderIcon() {
    switch (state) {
      case "loading":
        return <LoadingIonIcon icon={imageOutline} />;
      case "error":
        return <Error>failed to load media 😢</Error>;
      case "custom":
      case "loaded":
        return;
    }
  }

  return (
    <PlaceholderContainer
      className={cx(className, state !== "loaded" && "not-loaded")}
      defaultAspectRatio={defaultAspectRatio}
      {...rest}
    >
      {children}
      {renderIcon()}
    </PlaceholderContainer>
  );
}
