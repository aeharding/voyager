import { HTMLProps, MouseEventHandler } from "react";
import { isNative } from "../../helpers/device";
import { Browser } from "@capacitor/browser";
import { useAppSelector } from "../../store";
import { OLinkHandlerType } from "../../services/db";

export default function InAppExternalLink({
  href,
  onClick: _onClick,
  ...rest
}: HTMLProps<HTMLAnchorElement>) {
  const linkHandler = useAppSelector(
    (state) => state.settings.general.linkHandler,
  );

  const onClick: MouseEventHandler<HTMLAnchorElement> = (e) => {
    _onClick?.(e);

    if (e.defaultPrevented) return;

    if (isNative() && href && linkHandler === OLinkHandlerType.InApp) {
      e.preventDefault();
      e.stopPropagation();
      Browser.open({ url: href });
    }
  };

  return <a href={href} onClick={onClick} {...rest} />;
}
