import { useContext, useMemo } from "react";
import { useAppDispatch, useAppSelector } from "../../store";
import { getHandle } from "../../helpers/lemmy";
import { PageContext } from "../auth/PageContext";
import { blockUser } from "./userSlice";
import { buildBlocked, problemBlockingUser } from "../../helpers/toastMessages";
import useAppToast from "../../helpers/useAppToast";

export function useUserDetails(handle: string) {
  const blocks = useAppSelector(
    (state) => state.site.response?.my_user?.person_blocks,
  );
  const isBlocked = useMemo(
    () => blocks?.some((b) => getHandle(b.target) === handle),
    [blocks, handle],
  );
  const user = useAppSelector((state) => state.user.userByHandle[handle]);
  const { presentLoginIfNeeded } = useContext(PageContext);
  const dispatch = useAppDispatch();
  const presentToast = useAppToast();

  async function blockOrUnblock() {
    if (presentLoginIfNeeded()) return;
    if (!user) return;

    try {
      await dispatch(blockUser(!isBlocked, user.id));
    } catch (error) {
      presentToast(problemBlockingUser);

      throw error;
    }

    presentToast(buildBlocked(!isBlocked, handle));
  }

  return { isBlocked, user, blockOrUnblock };
}
