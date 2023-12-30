import { useAppSelector } from "../../store";

export default function useIsAdmin() {
  return useAppSelector((state) => {
    return state.site.response?.admins?.some(
      (admin) =>
        admin.person.id ===
        state.site.response?.my_user?.local_user_view.person.id,
    );
  });
}
