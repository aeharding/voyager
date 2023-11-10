type PlatformSpecificProduct = Omit<
  CdvPurchase.IRegisterProduct,
  "platform" | "type"
>;

const iosTipProducts: PlatformSpecificProduct[] = [
  {
    id: "tip_small",
  },
  {
    id: "tip_medium",
  },
  {
    id: "tip_large",
  },
];

const androidTipProducts: PlatformSpecificProduct[] = [
  {
    id: "tip_small",
  },
  {
    id: "tip_medium",
  },
  {
    id: "tip_large",
  },
];

const tipProducts: CdvPurchase.IRegisterProduct[] = [
  ...iosTipProducts.map((p) => ({
    ...p,
    type: CdvPurchase.ProductType.CONSUMABLE,
    platform: CdvPurchase.Platform.APPLE_APPSTORE,
  })),
  ...androidTipProducts.map((p) => ({
    ...p,
    type: CdvPurchase.ProductType.CONSUMABLE,
    platform: CdvPurchase.Platform.GOOGLE_PLAY,
  })),
];

export default tipProducts;
