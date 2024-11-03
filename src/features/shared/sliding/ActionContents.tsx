import { IonIcon } from "@ionic/react";
import { styled } from "@linaria/react";
import { bookmark, mailUnread } from "ionicons/icons";
import { memo } from "react";

import { SlidingItemAction } from "./SlidingItem";

const custom_slash_lengths: Record<string, number> = {
  [bookmark]: 35,
  [mailUnread]: 40,
};

const Icon = styled(IonIcon)<{
  icon: string;
  slash: boolean;
  bgColorVar: string;
}>`
  margin-block: 24px;

  color: white;

  &::after {
    content: ${({ slash }) => (slash ? '""' : "none")};
    position: absolute;
    height: ${({ icon }) => custom_slash_lengths[icon] ?? 30}px;
    width: 3px;
    background: white;
    font-size: 1.7em;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%) rotate(-45deg);
    transform-origin: center;
    box-shadow: 0 0 0 2px ${({ bgColorVar }) => bgColorVar};
  }
`;

interface ActionContentsProps {
  action: SlidingItemAction | undefined;
}

function ActionContents({ action }: ActionContentsProps) {
  if (!action) return;

  return (
    <Icon
      icon={action.icon}
      slash={action.slash ?? false}
      bgColorVar={`var(--ion-color-${action.bgColor}`}
    />
  );
}

export default memo(ActionContents);
