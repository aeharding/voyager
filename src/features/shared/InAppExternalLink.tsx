import React, { HTMLProps, MouseEvent, MouseEventHandler } from "react";
import { isNative } from "../../helpers/device";
import { useAppSelector } from "../../store";
import { OLinkHandlerType } from "../../services/db";
import { IonItem } from "@ionic/react";
import useNativeBrowser from "./useNativeBrowser";

type InAppExternalLinkProps =
  | HTMLProps<HTMLAnchorElement>
  | (HTMLProps<HTMLAnchorElement> & { el: undefined })
  | (HTMLProps<HTMLDivElement> & { el: "div" });

export default function InAppExternalLink({
  href,
  onClick: _onClick,
  ...rest
}: InAppExternalLinkProps) {
  const onClick = useOnClick(href, _onClick);

  if ("el" in rest && rest.el) {
    const El = rest.el;

    return <El onClick={onClick} {...rest} />;
  }

  return <a href={href} onClick={onClick} {...rest} />;
}

export function IonItemInAppExternalLink({
  href,
  onClick: _onClick,
  ...rest
}: React.ComponentProps<typeof IonItem>) {
  const onClick = useOnClick(href, _onClick);

  return <IonItem href={href} onClick={onClick} {...rest} />;
}

function useOnClick(
  href: string | undefined,
  _onClick: MouseEventHandler | undefined,
) {
  const interceptHrefWithInAppBrowserIfNeeded =
    useInterceptHrefWithInAppBrowserIfNeeded();

  return interceptHrefWithInAppBrowserIfNeeded(href, _onClick);
}

export function useInterceptHrefWithInAppBrowserIfNeeded() {
  const linkHandler = useAppSelector(
    (state) => state.settings.general.linkHandler,
  );
  const openNativeBrowser = useNativeBrowser();

  return (href: string | undefined, onClick?: MouseEventHandler) =>
    (e: MouseEvent) => {
      onClick?.(e);

      if (e.defaultPrevented) return;

      if (!href) return;

      // mailto should be handled directly by web view to launch mail app
      if (href.toLowerCase().startsWith("mailto:")) return;

      if (isNative() && linkHandler === OLinkHandlerType.InApp) {
        e.preventDefault();
        e.stopPropagation();
        openNativeBrowser(href);
      }
    };
}
