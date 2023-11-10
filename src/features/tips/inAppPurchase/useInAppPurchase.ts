import "cordova-plugin-purchase";
import { notEmpty } from "../../../helpers/array";
import { useEffect, useState } from "react";
import tipProducts from "./tipProducts";

(() => {
  // Do not setup in-app purchases for PWA, f-droid and github builds
  if (!ENABLE_IN_APP_PURCHASES) return;

  document.addEventListener("deviceready", () => {
    CdvPurchase.store.when().approved((p) => p.finish());

    CdvPurchase.store.register(tipProducts);

    CdvPurchase.store.initialize([
      CdvPurchase.Platform.APPLE_APPSTORE,
      CdvPurchase.Platform.GOOGLE_PLAY,
    ]);
  });
})();

export interface Product {
  label: string;
  id: string;
  price: string;
}

function _getProducts(): Product[] {
  return CdvPurchase.store.products
    .filter((p) => p.canPurchase)
    .map((p) =>
      p.pricing
        ? {
            label: p.description,
            id: p.id,
            price: p.pricing?.price,
          }
        : undefined,
    )
    .filter(notEmpty);
}

export default function useInAppPurchase() {
  const [products, setProducts] = useState<Product[]>([]);
  const [initializing, setInitializing] = useState(false);

  useEffect(() => {
    getProducts().then((products) => setProducts(products));
  }, []);

  async function getProducts(): Promise<Product[]> {
    if (CdvPurchase.store.isReady) return _getProducts();

    setInitializing(true);

    return new Promise((resolve) =>
      CdvPurchase.store.ready(() => {
        setInitializing(false);
        resolve(_getProducts());
      }),
    );
  }

  async function purchase(product: Product) {
    const cdvProduct = CdvPurchase.store.products.find(
      ({ id }) => id === product.id,
    );

    return cdvProduct?.getOffer()?.order();
  }

  return { initializing, products, purchase };
}
