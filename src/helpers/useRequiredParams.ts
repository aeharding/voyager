import { useParams } from "react-router";

/**
 * `useParams` with the params the route guarantees.
 *
 * React Router v6 types every param as possibly `undefined`, but a param
 * declared in the matched route's path is always present.
 */
export default function useRequiredParams<
  T extends { [K in keyof T]: string | undefined },
>() {
  return useParams() as unknown as Readonly<T>;
}
