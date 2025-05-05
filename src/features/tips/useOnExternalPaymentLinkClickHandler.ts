import { isPlatform } from "@ionic/core";
import { useIonAlert } from "@ionic/react";
import { createContext, use } from "react";

export function useOnExternalPaymentLinkClickHandler() {
  const [presentAlert] = useIonAlert();
  const iap = use(IAPContext);

  return function onExternalPaymentLinkClickHandler(
    e: React.MouseEvent<HTMLAnchorElement | HTMLIonButtonElement>,
  ) {
    if (!iap) return;

    const href = e.currentTarget.href;
    if (!href) return;

    e.preventDefault();

    const vendor = isPlatform("ios") ? "Apple" : "Google";
    const store = isPlatform("ios") ? "the App Store" : "Google Play";

    presentAlert({
      header: "Leaving App for Payment",
      message: `You are about to leave this app to make a payment. ${vendor} is not responsible for the privacy or security of payments that are not made through ${store}. All payment-related issues, including refunds, must be handled by Voyager's support.`,
      buttons: [
        {
          text: "Cancel",
        },
        {
          text: "Continue",
          handler: () => {
            window.open(href, "_blank");
          },
        },
      ],
      backdropDismiss: false,
    });
  };
}

/**
 * Context for inside in-app purchase content
 *
 * (When showing external payment options, as an alternative, we must show a disclaimer.)
 */
export const IAPContext = createContext<boolean>(false);
