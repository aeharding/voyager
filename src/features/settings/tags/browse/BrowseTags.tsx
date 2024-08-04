import { useCallback } from "react";
import Feed, { FetchFn } from "../../../feed/Feed";
import { db, UserTag as UserTagType } from "../../../../services/db";
import { IonItem, IonLabel } from "@ionic/react";
import { LIMIT } from "../../../../services/lemmy";
import { useBuildGeneralBrowseLink } from "../../../../helpers/routes";
import UserScoreWithPrefix from "../../../tags/UserScore";
import UserTag from "../../../tags/UserTag";

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
          {tag.handle} <UserScoreWithPrefix tag={tag} /> <UserTag tag={tag} />
        </IonLabel>
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
