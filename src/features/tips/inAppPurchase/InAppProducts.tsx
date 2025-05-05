import { IonSpinner } from "@ionic/react";

import ExternalSponsorOptions from "../ExternalSponsorOptions";
import { IAPContext } from "../useOnExternalPaymentLinkClickHandler";
import Tip from "./Tip";
import useInAppPurchase from "./useInAppPurchase";

export default function InAppProducts() {
  const { products, initializing } = useInAppPurchase();

  if (initializing) return <IonSpinner />;

  if (
    !products.length ||
    products.some((product) => product.currencyCode === "USD")
  )
    return (
      <IAPContext value={true}>
        <ExternalSponsorOptions />
      </IAPContext>
    );

  return products.map((product) => (
    <Tip product={product} key={product.identifier} />
  ));
}
