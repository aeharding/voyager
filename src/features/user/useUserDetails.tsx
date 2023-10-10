import { useContext, useMemo } from "react";
import { useAppDispatch, useAppSelector } from "../../store";
import { getHandle } from "../../helpers/lemmy";
import { PageContext } from "../auth/PageContext";
import { blockUser } from "./userSlice";
import { useIonToast } from "@ionic/react";
import { buildBlocked, problemBlockingUser } from "../../helpers/toastMessages";

export function useUserDetails(handle: string) {
  const blocks = useAppSelector(
    (state) => state.auth.site?.my_user?.person_blocks,
  );
  const isBlocked = useMemo(
    () => blocks?.some((b) => getHandle(b.target) === handle),
    [blocks, handle],
  );
  const userByHandle = useAppSelector((state) => state.user.userByHandle);
  const user = userByHandle[handle];
  const { presentLoginIfNeeded } = useContext(PageContext);
  const dispatch = useAppDispatch();
  const [present] = useIonToast();

  async function blockOrUnblock() {
    if (presentLoginIfNeeded()) return;
    if (!user) return;

    try {
      await dispatch(blockUser(!isBlocked, user.id));
    } catch (error) {
      present(problemBlockingUser);

      throw error;
    }

    present(buildBlocked(!isBlocked, handle));
  }

  return { isBlocked, user, blockOrUnblock };
}
