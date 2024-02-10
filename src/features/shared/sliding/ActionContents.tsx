import { styled } from "@linaria/react";
import { IonIcon } from "@ionic/react";
import { bookmark, mailUnread } from "ionicons/icons";
import { SlidingItemAction } from "./SlidingItem";
import { memo } from "react";

const custom_slash_lengths: Record<string, number> = {
  [bookmark]: 35,
  [mailUnread]: 40,
};

const UnslashedIcon = styled(IonIcon)`
  margin-block: 24px;

  color: white;
`;

const SlashedIcon = styled(UnslashedIcon)<{
  icon: string;
  slash: boolean;
  bgColor: string;
}>`
  &::after {
    content: "";
    position: absolute;
    height: ${({ icon }) => custom_slash_lengths[icon] ?? 30}px;
    width: 3px;
    background: white;
    font-size: 1.7em;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%) rotate(-45deg);
    transform-origin: center;
    box-shadow: 0 0 0 2px var(--ion-color-${({ bgColor }) => bgColor});
  }
`;

interface ActionContentsProps {
  action: SlidingItemAction | undefined;
}

function ActionContents({ action }: ActionContentsProps) {
  if (!action) return;

  const Icon = action.slash ? SlashedIcon : UnslashedIcon;

  return (
    <Icon
      icon={action.icon}
      slash={action.slash ?? false}
      bgColor={action.bgColor}
    />
  );
}

export default memo(ActionContents);
