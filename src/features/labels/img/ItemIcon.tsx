import styled from "@emotion/styled";
import { Community, Person } from "lemmy-js-client";
import FakeIcon from "../../shared/FakeIcon";
import { getImageSrc } from "../../../services/lemmy";

const SubImgIcon = styled.img<{ size: number }>`
  width: ${({ size }) => `${size}px`};
  height: ${({ size }) => `${size}px`};
  border-radius: 50%;
  object-fit: cover;
`;

interface ItemIconProps {
  item: Community | Person | string;
  size?: number;
  className?: string;
}

export default function ItemIcon({ item, size, className }: ItemIconProps) {
  size = size ?? 28;

  if (typeof item === "string")
    return (
      <FakeIcon seed={item} name={item} className={className} size={size} />
    );

  const icon = "posting_restricted_to_mods" in item ? item.icon : item.avatar;

  if (icon)
    return (
      <SubImgIcon
        src={getImageSrc(icon, { size })}
        size={size}
        className={className}
      />
    );

  return (
    <FakeIcon
      seed={item.id}
      name={item.name}
      className={className}
      size={size}
    />
  );
}
