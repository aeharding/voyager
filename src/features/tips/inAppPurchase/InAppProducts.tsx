import { IonSpinner } from "@ionic/react";
import Tip from "./Tip";
import useInAppPurchase from "./useInAppPurchase";

export default function InAppProducts() {
  const { products, initializing } = useInAppPurchase();

  if (initializing) return <IonSpinner />;

  if (!products.length)
    return (
      <div className="ion-text-center">
        <p>No options found.</p>
        <p>Please try again later!</p>
      </div>
    );

  return products.map((product) => <Tip product={product} key={product.id} />);
}
