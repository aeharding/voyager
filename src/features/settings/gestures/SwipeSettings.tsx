import { IonLabel, IonList } from "@ionic/react";
import { ListHeader } from "../shared/formatting";
import { useAppSelector } from "../../../store";
import {
  OSwipeActionPost,
  OSwipeActionComment,
  SwipeAction,
  SwipeActions,
  OSwipeActionInbox,
} from "../../../services/db";
import SettingSelector from "../shared/SettingSelector";
import {
  setPostSwipeActionFarEnd,
  setPostSwipeActionFarStart,
  setPostSwipeActionEnd,
  setPostSwipeActionStart,
  setCommentSwipeActionFarEnd,
  setCommentSwipeActionFarStart,
  setCommentSwipeActionEnd,
  setCommentSwipeActionStart,
  setInboxSwipeActionFarEnd,
  setInboxSwipeActionFarStart,
  setInboxSwipeActionEnd,
  setInboxSwipeActionStart,
} from "./gesturesSlice";
import { ActionCreatorWithPayload } from "@reduxjs/toolkit";
import { Dictionary } from "lodash";

export default function SwipeSettings() {
  const post = useAppSelector((state) => state.gestures.swipe.post);
  const comment = useAppSelector((state) => state.gestures.swipe.comment);
  const inbox = useAppSelector((state) => state.gestures.swipe.inbox);

  return (
    <>
      <SwipeList
        name="Posts"
        selector={post}
        options={OSwipeActionPost}
        far_start={setPostSwipeActionFarStart}
        start={setPostSwipeActionStart}
        end={setPostSwipeActionEnd}
        far_end={setPostSwipeActionFarEnd}
      />
      <SwipeList
        name="Comments"
        selector={comment}
        options={OSwipeActionComment}
        far_start={setCommentSwipeActionFarStart}
        start={setCommentSwipeActionStart}
        end={setCommentSwipeActionEnd}
        far_end={setCommentSwipeActionFarEnd}
      />
      <SwipeList
        name="Inbox"
        selector={inbox}
        options={OSwipeActionInbox}
        far_start={setInboxSwipeActionFarStart}
        start={setInboxSwipeActionStart}
        end={setInboxSwipeActionEnd}
        far_end={setInboxSwipeActionFarEnd}
      />
    </>
  );
}

interface SwipeListProps {
  name: string;
  selector: SwipeActions;
  options: Dictionary<SwipeAction>;
  far_start: ActionCreatorWithPayload<SwipeAction>;
  start: ActionCreatorWithPayload<SwipeAction>;
  end: ActionCreatorWithPayload<SwipeAction>;
  far_end: ActionCreatorWithPayload<SwipeAction>;
}

function SwipeList({
  name,
  selector,
  options,
  far_start,
  start,
  end,
  far_end,
}: SwipeListProps) {
  const Selector = SettingSelector<SwipeAction>;
  return (
    <>
      <ListHeader>
        <IonLabel>{name}</IonLabel>
      </ListHeader>
      <IonList inset>
        <Selector
          title="Far right"
          selected={selector.far_start ?? options.None}
          setSelected={far_start}
          options={options}
        />
        <Selector
          title="Left"
          selected={selector.start ?? options.None}
          setSelected={start}
          options={options}
        />
        <Selector
          title="Right"
          selected={selector.end ?? options.None}
          setSelected={end}
          options={options}
        />
        <Selector
          title="Far left"
          selected={selector.far_end ?? options.None}
          setSelected={far_end}
          options={options}
        />
      </IonList>
    </>
  );
}
