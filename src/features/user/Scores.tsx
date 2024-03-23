import { PersonAggregates } from "lemmy-js-client";
import { formatNumber } from "../../helpers/number";
import Ago from "../labels/Ago";
import { useIonAlert } from "@ionic/react";
import { formatDistanceToNowStrict } from "date-fns";
import { styled } from "@linaria/react";

const Container = styled.div`
  display: flex;
  justify-content: space-evenly;
  gap: 3rem;
  margin: 1.5rem 3rem;
`;

const Score = styled.div`
  text-align: center;
  font-size: 1.3rem;
  font-weight: 600;
  cursor: pointer;

  aside {
    margin-top: 0.35rem;
    opacity: 0.5;
    font-size: 0.8rem;
    font-weight: 500;
  }
`;

interface ScoreProps {
  aggregates: PersonAggregates;
  accountCreated: string;
}

export default function Scores({ aggregates, accountCreated }: ScoreProps) {
  const [present] = useIonAlert();

  const relativeDate = formatDistanceToNowStrict(new Date(accountCreated), {
    addSuffix: false,
  });
  const creationDate = new Date(accountCreated);

  const posts = aggregates.post_count;
  const comments = aggregates.comment_count;
  const total = posts + comments;

  const showScoreAlert = async (focus: "post" | "comment") => {
    const postPointsLine = `${posts.toLocaleString()} Posts`;
    const commentPointsLine = `${comments.toLocaleString()} Comments`;

    const totalScoreLine = `${total.toLocaleString()} Total Submissions`;

    const header = focus === "post" ? postPointsLine : commentPointsLine;

    const message = [
      focus === "post" ? commentPointsLine : postPointsLine,
      totalScoreLine,
    ];

    await present({
      header,
      cssClass: "preserve-newlines",
      message: message.join("\n"),
      buttons: [{ text: "OK" }],
    });
  };

  return (
    <>
      <Container>
        <Score
          onClick={() => {
            showScoreAlert("comment");
          }}
        >
          {formatNumber(aggregates.comment_count)}
          <aside>Comment count</aside>
        </Score>
        <Score
          onClick={() => {
            showScoreAlert("post");
          }}
        >
          {formatNumber(aggregates.post_count)}
          <aside>Post count</aside>
        </Score>
        <Score
          onClick={() => {
            present({
              header: `Account is ${relativeDate} old`,
              message: `Created on ${creationDate.toDateString()} at ${creationDate.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" })}`,
              buttons: [{ text: "OK" }],
            });
          }}
        >
          <Ago date={accountCreated} />
          <aside>Account age</aside>
        </Score>
      </Container>
    </>
  );
}
