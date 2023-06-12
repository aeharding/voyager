import { useEffect, useMemo, useState } from "react";
import { LIMIT, client } from "../services/lemmy";
import { CommentNodeI, buildCommentsTree } from "../helpers/lemmy";
import CommentTree from "./CommentTree";
import { IonLoading, IonSpinner } from "@ionic/react";
import styled from "@emotion/styled";
import { css } from "@emotion/react";
import { CommentView } from "lemmy-js-client";
import ScrollObserver from "./ScrollObserver";
import { uniqBy } from "lodash";

const centerCss = css`
  position: relative;
  margin: 4rem 0 4rem;
  left: 50%;
  transform: translateX(-50%);
`;

const StyledIonSpinner = styled(IonSpinner)`
  ${centerCss}
  opacity: 0.7;
`;

const Empty = styled.div`
  ${centerCss}

  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  text-align: center;

  aside {
    color: var(--ion-color-medium);
    font-size: 0.8em;
  }
`;

interface CommentsProps {
  postId: number;
}

export default function Comments({ postId }: CommentsProps) {
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(false);
  const [finishedPaging, setFinishedPaging] = useState(false);
  const [comments, setComments] = useState<CommentView[]>([]);
  const commentTree = useMemo(
    () => buildCommentsTree(comments, false),
    [comments]
  );

  async function fetchComments() {
    let response;

    if (loading) return;
    if (finishedPaging) return;

    const currentPage = page + 1;

    setLoading(true);

    try {
      response = await client.getComments({
        post_id: postId,
        limit: 10,
        sort: "Hot",
        type_: "All",
        max_depth: 8,
        saved_only: false,
        page: currentPage,
      });
    } finally {
      setLoading(false);
    }

    if (!response.comments.length) setFinishedPaging(true);
    setComments(
      uniqBy([...comments, ...response.comments], (c) => c.comment.id)
    );
    setPage(currentPage);
  }

  useEffect(() => {
    fetchComments();
  }, []);

  if (loading && !comments.length) return <StyledIonSpinner />;

  if (!comments.length)
    return (
      <Empty>
        <div>No Comments</div>
        <aside>It's quiet... too quiet...</aside>
      </Empty>
    );

  return (
    <>
      {commentTree.map((comment) => (
        <CommentTree comment={comment} key={comment.comment_view.comment.id} />
      ))}
      <ScrollObserver onScrollIntoView={fetchComments} />
    </>
  );
}
