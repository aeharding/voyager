import { Person } from "lemmy-js-client";
import { useAppSelector } from "../../store";
import { getRemoteHandle } from "../../helpers/lemmy";

interface UserScoreProps {
  person: Person;
}

export default function UserScore({ person: user }: UserScoreProps) {
  const tag = useAppSelector(
    (state) => state.userTag.tagByRemoteHandle[getRemoteHandle(user)],
  );

  if (!tag || tag === "pending") return;
  const score = tag.upvotes - tag.downvotes;
  if (score === 0) return;

  return (
    <>
      [{score > 0 ? "+" : ""}
      {score}]
    </>
  );
}
