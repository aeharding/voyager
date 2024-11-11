import { Person } from "lemmy-js-client";

import { isAdminSelector } from "#/features/auth/siteSlice";
import { useAppSelector } from "#/store";

export default function useIsAdmin(person?: Person) {
  return useAppSelector(
    !person
      ? isAdminSelector
      : (state) =>
          state.site.response?.admins?.some(
            (admin) => admin.person.id === person.id,
          ),
  );
}
