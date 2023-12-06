import { ModAddView } from "lemmy-js-client";
import { LogEntryData } from "../ModlogItem";
import { getHandle } from "../../../../helpers/lemmy";
import { buildBaseData } from "./shared";
import { buildUserLink } from "../../../../helpers/appLinkBuilder";

export default function addInstance(item: ModAddView): LogEntryData {
  return {
    title: `${item.mod_add.removed ? "Added" : "Removed"} Admin`,
    by: item.moderator ? getHandle(item.moderator) : undefined,
    message: getHandle(item.modded_person),
    link: buildUserLink(item.modded_person),
    ...buildBaseData(item.mod_add),
  };
}
