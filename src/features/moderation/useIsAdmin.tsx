import { useAppSelector } from "../../store";

export default function useIsAdmin() {
  return useAppSelector((state) => {
    return state.auth.site?.admins?.some(
      (admin) =>
        admin.person.id === state.auth.site?.my_user?.local_user_view.person.id,
    );
  });
}
