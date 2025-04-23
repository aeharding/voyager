import { useMediaQuery } from "@mantine/hooks";

export default function useIsViewportTwoColumnCapable() {
  return useMediaQuery("(min-width: 768px)");
}
