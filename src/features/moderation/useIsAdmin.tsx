import { Person } from "lemmy-js-client";
import { useAppSelector } from "../../store";

export default function useIsAdmin(person?: Person) {
  return useAppSelector((state) => {
    return state.site.response?.admins?.some(
      (admin) =>
        admin.person.id ===
        (person?.id ?? state.site.response?.my_user?.local_user_view.person.id),
    );
  });
}
