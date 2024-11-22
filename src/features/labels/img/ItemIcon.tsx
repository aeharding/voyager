import { Community, Person } from "lemmy-js-client";

import FakeIcon from "#/features/shared/FakeIcon";
import { cx } from "#/helpers/css";
import { getImageSrc } from "#/services/lemmy";

import styles from "./ItemIcon.module.css";

interface ItemIconProps {
  item: Community | Person | string;
  size?: number;
  className?: string;
  slot?: string;
}

export default function ItemIcon({
  item,
  size,
  className,
  slot,
}: ItemIconProps) {
  size = size ?? 28;

  if (typeof item === "string")
    return (
      <FakeIcon seed={item} name={item} className={className} size={size} />
    );

  const icon = "posting_restricted_to_mods" in item ? item.icon : item.avatar;

  if (icon)
    return (
      <img
        style={{ width: `${size}px`, height: `${size}px` }}
        src={getImageSrc(icon, {
          size,
        })}
        className={cx(styles.subImgIcon, className)}
        slot={slot}
      />
    );

  return (
    <FakeIcon
      seed={item.id}
      name={item.name}
      className={className}
      size={size}
      slot={slot}
    />
  );
}
