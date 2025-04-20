import { useViewportSize } from "@mantine/hooks";

export default function useIsViewportTwoColumnCapable() {
  return useViewportSize().width > 768;
}
