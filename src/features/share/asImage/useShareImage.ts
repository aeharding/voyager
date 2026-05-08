import { CapacitorHttp } from "@capacitor/core";
import { Directory, Filesystem } from "@capacitor/filesystem";
import { Share } from "@capacitor/share";
import { domToBlob, Options as DomToBlobOptions } from "modern-screenshot";
import { useCallback, useEffect, useLayoutEffect, useState } from "react";

import { buildImageSrc } from "#/features/media/CachedImg";
import { blobToDataURL, blobToString } from "#/helpers/blob";
import { isNative } from "#/helpers/device";
import useAppToast from "#/helpers/useAppToast";
import { getServerUrl } from "#/services/nativeFetch";

import includeStyleProperties from "./includeStyleProperties";
import { ShareAsImageData } from "./ShareAsImageModal";

const domToBlobOptions: DomToBlobOptions = {
  scale: 4,
  features: {
    // Without this, render fails on certain images
    removeControlCharacter: false,
  },
  includeStyleProperties,
  filter: (node) => {
    if (!(node instanceof HTMLElement)) return true;

    return node.tagName !== "VIDEO";
  },
  fetchFn: isNative()
    ? async (url) => {
        // Pass through relative URLs to browser fetching
        // !: running in native environment
        if (url.startsWith(`${getServerUrl!()}/`)) {
          return false;
        }

        // Attempt upgrade to https (insecure will be blocked)
        if (url.startsWith("http://")) {
          url = url.replace(/^http:\/\//, "https://");
        }

        const nativeResponse = await CapacitorHttp.get({
          // if pictrs, convert large gifs to jpg
          url: buildImageSrc(url, { format: "jpg" }),
          responseType: "blob",
          headers: {
            "User-Agent": "VoyagerApp/1.0",
          },
        });

        // Workaround that will probably break in a future capacitor upgrade
        // https://github.com/ionic-team/capacitor/issues/6126
        return `data:${
          nativeResponse.headers["Content-Type"] || "image/png"
        };base64,${nativeResponse.data}`;
      }
    : undefined,
};

const shareAsImageRenderRoot = document.querySelector(
  "#share-as-image-root",
) as HTMLElement;

interface UseShareImageOptions {
  data: ShareAsImageData;
  /** Values that should trigger a re-render of the image snapshot when changed. */
  renderDeps: unknown[];
}

export default function useShareImage({
  data,
  renderDeps,
}: UseShareImageOptions) {
  const presentToast = useAppToast();

  const [blob, setBlob] = useState<Blob | undefined>();
  const [imageSrc, setImageSrc] = useState("");

  useEffect(() => {
    if (!blob) return;

    (async () => {
      setImageSrc(await blobToDataURL(blob));
    })();
  }, [blob]);

  const render = useCallback(async () => {
    try {
      const blob = await domToBlob(
        shareAsImageRenderRoot.querySelector(".inner") as HTMLElement,
        domToBlobOptions,
      );
      setBlob(() => blob ?? undefined);
    } catch (error) {
      presentToast({
        message: "Error rendering image",
      });

      throw error;
    }
  }, [presentToast]);

  useLayoutEffect(() => {
    requestAnimationFrame(() => {
      render();
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [render, ...renderDeps]);

  async function onShare() {
    if (!blob) return;

    const apId =
      "comment" in data ? data.comment.comment.ap_id : data.post.post.ap_id;

    const filename = `${apId
      .replace(/^https:\/\//, "")
      .replaceAll(/\//g, "-")}.png`;

    const file = new File([blob], filename, {
      type: "image/png",
    });

    const webSharePayload: ShareData = { files: [file] };

    if (isNative()) {
      const data = await blobToString(blob);
      const file = await Filesystem.writeFile({
        data,
        directory: Directory.Cache,
        path: filename,
      });
      await Share.share({ files: [file.uri] });
      await Filesystem.deleteFile({ path: file.uri });
    } else if ("canShare" in navigator && navigator.canShare(webSharePayload)) {
      navigator.share(webSharePayload);
    } else {
      const link = document.createElement("a");
      link.download = filename;
      link.href = URL.createObjectURL(file);
      link.click();
      URL.revokeObjectURL(link.href);
    }
  }

  return {
    imageSrc,
    renderRoot: shareAsImageRenderRoot,
    onShare,
  };
}
