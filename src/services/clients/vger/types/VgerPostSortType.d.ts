/**
 * The post sort types. See here for descriptions: https://join-lemmy.org/docs/en/users/03-votes-and-ranking.html
 */
export type VgerPostSortType =
  | "Active"
  | "Hot"
  | "New"
  | "TopDay"
  | "TopWeek"
  | "TopMonth"
  | "TopYear"
  | "TopAll"
  | "MostComments"
  | "NewComments"
  | "TopHour"
  | "TopSixHour"
  | "TopTwelveHour"
  | "TopThreeMonths"
  | "TopSixMonths"
  | "TopNineMonths"
  | "Controversial"
  | "Scaled";
