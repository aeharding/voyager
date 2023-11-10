// This stub replaces useInAppPurchase.ts for F-droid builds
// This is because the google play billing library is nonfree
export default function useInAppPurchase() {
  return { initializing: false, products: [], purchase: async () => {} };
}
