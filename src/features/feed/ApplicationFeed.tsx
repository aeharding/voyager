import { useCallback } from "react";
import Feed, { FeedProps } from "./Feed";
import { RegistrationApplicationView } from "lemmy-js-client";
import ApplicationItem from "../registration-applications/ApplicationItem";

interface PostApplicationFeed
  extends Omit<FeedProps<RegistrationApplicationView>, "renderItemContent"> {}

export default function ApplicationFeed({ ...rest }: PostApplicationFeed) {
  const renderItemContent = useCallback(
    (item: RegistrationApplicationView) => (
      <ApplicationItem application={item} />
    ),
    []
  );

  return <Feed renderItemContent={renderItemContent} {...rest} />;
}
