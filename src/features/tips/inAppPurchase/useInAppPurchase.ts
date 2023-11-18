import { useEffect, useState } from "react";
import { isAndroid, isNative } from "../../../helpers/device";
import {
  PRODUCT_CATEGORY,
  Purchases,
  PurchasesStoreProduct,
} from "@revenuecat/purchases-capacitor";

const PUBLIC_REVENUECAT_ANDROID_API_KEY = "goog_hVemKEyHECiLbyUlVAPsFOVqoKN";
const PUBLIC_REVENUECAT_APPLE_API_KEY = "appl_EKWdPfZUYmrWEgJXKsIkQGkgjBd";
const PRODUCT_IDENTIFIERS = ["tip_small", "tip_medium", "tip_large"];

async function initializeIfNeeded() {
  // Do not setup in-app purchases for PWA, f-droid and github builds
  if (BUILD_FOSS_ONLY || !isNative()) return;
  if ((await Purchases.isConfigured()).isConfigured) return;

  Purchases.configure({
    apiKey: isAndroid()
      ? PUBLIC_REVENUECAT_ANDROID_API_KEY
      : PUBLIC_REVENUECAT_APPLE_API_KEY,
  });
}

async function getProducts(): Promise<PurchasesStoreProduct[]> {
  await initializeIfNeeded();

  const { products } = await Purchases.getProducts({
    productIdentifiers: PRODUCT_IDENTIFIERS,
    type: PRODUCT_CATEGORY.NON_SUBSCRIPTION,
  });

  // Revenuecat doesn't return in expected order
  products.sort(
    (a, b) =>
      PRODUCT_IDENTIFIERS.indexOf(a.identifier) -
      PRODUCT_IDENTIFIERS.indexOf(b.identifier),
  );

  return products;
}

export default function useInAppPurchase() {
  const [products, setProducts] = useState<PurchasesStoreProduct[]>([]);
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    (async () => {
      setProducts(await getProducts());

      setInitializing(false);
    })();
  }, []);

  async function purchase(product: PurchasesStoreProduct) {
    return Purchases.purchaseStoreProduct({ product });
  }

  return { initializing, products, purchase };
}
