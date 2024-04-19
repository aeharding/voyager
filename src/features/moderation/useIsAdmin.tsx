import { Person } from "lemmy-js-client";
import { useAppSelector } from "../../store";
import { isAdminSelector } from "../auth/siteSlice";

export default function useIsAdmin(person?: Person) {
  useAppSelector(
    !person
      ? isAdminSelector
      : (state) =>
          state.site.response?.admins?.some(
            (admin) => admin.person.id === person.id,
          ),
  );
}
