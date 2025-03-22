import { IonItem } from "@ionic/react";
import React, { HTMLProps, MouseEvent, MouseEventHandler } from "react";

import { isNative } from "#/helpers/device";
import { OLinkHandlerType } from "#/services/db";
import store from "#/store";

import useLinkLongPress from "./useLinkLongPress";
import useNativeBrowser from "./useNativeBrowser";

export interface AdditionalLinkProps {
  /**
   * Callback called after the native in-app browser has fully animated in.
   */
  onClickCompleted?: () => void;
}

type InAppExternalLinkProps = (
  | HTMLProps<HTMLAnchorElement>
  | (HTMLProps<HTMLAnchorElement> & { el: undefined })
  | (HTMLProps<HTMLDivElement> & { el: "div" })
) &
  AdditionalLinkProps;

export default function InAppExternalLink({
  href,
  onClick: _onClick,
  onClickCompleted,
  ...rest
}: InAppExternalLinkProps) {
  const onClick = useOnClick(href, _onClick, onClickCompleted);
  const bind = useLinkLongPress(href);
  if ("el" in rest && rest.el) {
    const El = rest.el;

    return <El onClick={onClick} {...bind()} {...rest} />;
  }

  return <a href={href} onClick={onClick} {...bind()} {...rest} />;
}

export function IonItemInAppExternalLink({
  href,
  onClick: _onClick,
  onClickCompleted,
  ...rest
}: React.ComponentProps<typeof IonItem> & AdditionalLinkProps) {
  const onClick = useOnClick(href, _onClick, onClickCompleted);
  const bind = useLinkLongPress(href);

  return <IonItem href={href} onClick={onClick} {...bind()} {...rest} />;
}

function useOnClick(
  href: string | undefined,
  _onClick: MouseEventHandler | undefined,
  _onClickCompleted: AdditionalLinkProps["onClickCompleted"],
) {
  const interceptHrefWithInAppBrowserIfNeeded =
    useInterceptHrefWithInAppBrowserIfNeeded();

  return interceptHrefWithInAppBrowserIfNeeded(
    href,
    _onClick,
    _onClickCompleted,
  );
}

export function useInterceptHrefWithInAppBrowserIfNeeded() {
  const openNativeBrowser = useNativeBrowser();

  async function handler(
    e: MouseEvent,
    href: string | undefined,
    onClick?: MouseEventHandler,
  ) {
    onClick?.(e);

    if (e.defaultPrevented) return;

    if (href && shouldOpenWithInAppBrowser(href)) {
      e.preventDefault();
      e.stopPropagation();
      await openNativeBrowser(href);
    }
  }

  return (
      href: string | undefined,
      onClick?: MouseEventHandler,
      onClickCompleted?: AdditionalLinkProps["onClickCompleted"],
    ) =>
    (e: MouseEvent) => {
      handler(e, href, onClick).finally(onClickCompleted);
    };
}

export function shouldOpenWithInAppBrowser(url: string | undefined) {
  if (!url) return false;

  // mailto should be handled directly by web view to launch mail app
  if (url.toLowerCase().startsWith("mailto:")) return false;

  const linkHandler = store.getState().settings.general.linkHandler;

  return isNative() && linkHandler === OLinkHandlerType.InApp;
}
