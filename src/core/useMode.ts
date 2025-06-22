import { useAppSelector } from "#/store";

export default function useMode() {
  return useAppSelector((state) => state.site.response?.mode);
}
