import { useAppSelector } from "../../store";
import { isAdminSelector } from "../auth/siteSlice";

export default function useIsAdmin() {
  return useAppSelector(isAdminSelector);
}
