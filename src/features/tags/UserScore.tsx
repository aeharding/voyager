import { Person } from "lemmy-js-client";

import { useIsDark } from "#/core/GlobalStyles";
import { getRemoteHandle } from "#/helpers/lemmy";
import { formatNumber } from "#/helpers/number";
import { UserTag } from "#/services/db";

import { useAppSelector } from "../../store";
import { getVoteWeightColor } from "./voteColor";

import styles from "./UserScore.module.css";

type UserScoreProps =
  | SyncUserScoreProps
  | {
      person: Person;
    };

interface BaseUserScoreProps {
  prefix?: React.ReactNode;
  person?: Person;
}

export default function UserScore(props: UserScoreProps) {
  function renderFallback() {
    if (!("tag" in props)) return;
    return <SyncUserScore tag={props.tag} />;
  }

  const remoteHandle =
    "tag" in props ? props.tag.handle : getRemoteHandle(props.person);

  return (
    <StoreUserScore
      {...props}
      renderFallback={renderFallback}
      remoteHandle={remoteHandle}
    />
  );
}

interface StoreUserScoreProps extends BaseUserScoreProps {
  remoteHandle: string;
  renderFallback?: () => React.ReactNode;
}

function StoreUserScore({
  remoteHandle,
  renderFallback,
  prefix,
}: StoreUserScoreProps) {
  const tag = useAppSelector(
    (state) => state.userTag.tagByRemoteHandle[remoteHandle],
  );

  if (!tag || tag === "pending") return renderFallback?.();

  return (
    <>
      {prefix}
      <SyncUserScore tag={tag} />
    </>
  );
}

interface SyncUserScoreProps extends BaseUserScoreProps {
  tag: UserTag;
}

function SyncUserScore({ tag, prefix }: SyncUserScoreProps) {
  const isDark = useIsDark();

  const score = tag.upvotes - tag.downvotes;
  if (score === 0) return;

  return (
    <>
      {prefix}
      <span
        className={styles.scoreContainer}
        style={{
          [isDark ? "color" : "background"]: getVoteWeightColor(
            tag,
            isDark ? 0.8 : 1,
          ),
        }}
      >
        [{score > 0 ? "+" : ""}
        {formatNumber(score)}]
      </span>
    </>
  );
}
