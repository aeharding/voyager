import { HTMLProps, MouseEventHandler } from "react";
import { isNative } from "../../helpers/device";
import { Browser } from "@capacitor/browser";

export default function InAppExternalLink({
  href,
  onClick: _onClick,
  ...rest
}: HTMLProps<HTMLAnchorElement>) {
  const onClick: MouseEventHandler<HTMLAnchorElement> = (e) => {
    _onClick?.(e);

    if (e.defaultPrevented) return;

    if (isNative() && href) {
      e.preventDefault();
      e.stopPropagation();
      Browser.open({ url: href });
    }
  };

  return <a href={href} onClick={onClick} {...rest} />;
}
