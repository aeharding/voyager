import { CapacitorTips, Product } from "capacitor-tips";
import { useEffect, useRef, useState } from "react";

const PRODUCT_IDENTIFIERS = ["tip_small", "tip_medium", "tip_large"];

async function getProducts(): Promise<Product[]> {
  const { products } = await CapacitorTips.listProducts({
    productIdentifiers: PRODUCT_IDENTIFIERS,
  });

  // May not be returned in expected order
  products.sort(
    (a, b) =>
      PRODUCT_IDENTIFIERS.indexOf(a.identifier) -
      PRODUCT_IDENTIFIERS.indexOf(b.identifier),
  );

  return products;
}

export default function useInAppPurchase() {
  const [products, setProducts] = useState<Product[]>([]);
  const [initializing, setInitializing] = useState(true);
  const initializingRef = useRef(false);

  useEffect(() => {
    (async () => {
      if (initializingRef.current) return;
      initializingRef.current = true;

      setProducts(await getProducts());

      setInitializing(false);
    })();
  }, []);

  async function purchase(product: Product) {
    return CapacitorTips.purchaseProduct(product);
  }

  return { initializing, products, purchase };
}
