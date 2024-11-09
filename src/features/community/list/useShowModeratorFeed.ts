import { useAppSelector } from "#/store";

export default function useShowModeratorFeed() {
  const moderates = useAppSelector(
    (state) => state.site.response?.my_user?.moderates,
  );

  return !!moderates?.length;
}
