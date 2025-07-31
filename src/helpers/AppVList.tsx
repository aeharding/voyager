import { useMergedRef } from "@mantine/hooks";
import { VList } from "virtua";

import { useAppPageVListHandleRef } from "./AppPage";

export default function AppVList({
  ref,
  ...props
}: React.ComponentProps<typeof VList>) {
  const virtuaRef = useAppPageVListHandleRef();

  return <VList {...props} ref={useMergedRef(virtuaRef, ref)} />;
}
