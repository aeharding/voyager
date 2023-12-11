export type StringArrayToIdentityObject<T extends readonly string[]> = {
  [K in T[number]]: K;
};
