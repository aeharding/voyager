import { useMediaQuery } from "@mantine/hooks";

export default function useIsLandscape() {
  return !!useMediaQuery("(orientation: landscape)");
}
