import { IonButton } from "@ionic/react";
import { useState } from "react";

import ExternalTips from "./external/ExternalTips";
import { useOnExternalPaymentLinkClickHandler } from "./useOnExternalPaymentLinkClickHandler";

export default function ExternalSponsorOptions() {
  const [showMoreOptions, setShowMoreOptions] = useState(false);

  const onExternalPaymentLinkClickHandler =
    useOnExternalPaymentLinkClickHandler();

  return (
    <>
      <ExternalTips />
      {!showMoreOptions ? (
        <IonButton
          fill="clear"
          color="medium"
          onClick={() => setShowMoreOptions(true)}
        >
          More options
        </IonButton>
      ) : (
        <>
          <a
            href="https://github.com/sponsors/aeharding/"
            target="_blank"
            rel="noopener noreferrer"
            onClick={onExternalPaymentLinkClickHandler}
          >
            <img
              src="https://img.shields.io/github/sponsors/aeharding?style=for-the-badge&amp;logo=github"
              alt="Sponsor via Github Sponsors"
            />
          </a>
          <a
            href="https://liberapay.com/aeharding/"
            target="_blank"
            rel="noopener noreferrer"
            onClick={onExternalPaymentLinkClickHandler}
          >
            <img
              src="https://img.shields.io/liberapay/patrons/aeharding.svg?logo=liberapay&amp;style=for-the-badge"
              alt="Sponsor via Liberapay"
            />
          </a>
        </>
      )}
    </>
  );
}
