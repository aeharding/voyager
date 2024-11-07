import { IonItem, IonLabel } from "@ionic/react";
import * as _ from "radashi";
import { useCallback } from "react";

import Feed, { FetchFn } from "#/features/feed/Feed";
import SourceUrlButton from "#/features/tags/SourceUrlButton";
import UserScore from "#/features/tags/UserScore";
import UserTag from "#/features/tags/UserTag";
import { useBuildGeneralBrowseLink } from "#/helpers/routes";
import { UserTag as UserTagType, db } from "#/services/db";
import { LIMIT } from "#/services/lemmy";

interface BrowseTagsProps {
  filter: "all" | "tagged";
}

export default function BrowseTags({ filter }: BrowseTagsProps) {
  const buildGeneralBrowseLink = useBuildGeneralBrowseLink();

  const fetchFn: FetchFn<UserTagType> = useCallback(
    async (pageData) => {
      if (!("page" in pageData)) return [];

      return await db.getUserTagsPaginated(
        pageData.page,
        LIMIT,
        filter === "tagged",
      );
    },
    [filter],
  );

  const renderItemContent = useCallback(
    (tag: UserTagType) => (
      <IonItem routerLink={buildGeneralBrowseLink(`/u/${tag.handle}`)}>
        <IonLabel>
          {tag.handle} <UserScore tag={tag} /> <UserTag tag={tag} />{" "}
        </IonLabel>
        <SourceUrlButton
          sourceUrl={tag.sourceUrl}
          dismiss={_.noop}
          slot="end"
          fill="clear"
        />
      </IonItem>
    ),
    [buildGeneralBrowseLink],
  );

  const getIndex = useCallback((item: UserTagType) => item.handle, []);

  return (
    <Feed
      renderItemContent={renderItemContent}
      fetchFn={fetchFn}
      getIndex={getIndex}
    />
  );
}
