import { IonActionSheet, IonLabel, IonList, IonToggle } from "@ionic/react";
import { InsetIonItem, ListHeader } from "../shared/formatting";
import { useAppDispatch, useAppSelector } from "../../../store";
import {
  OSwipeActionPost,
  OSwipeActionComment,
  SwipeAction,
  SwipeActions,
  OSwipeActionInbox,
  OSwipeActionAll,
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
  setAllSwipesToDefault,
  setDisableLeftSwipes,
  setDisableRightSwipes,
} from "./gestureSlice";
import { ActionCreatorWithPayload } from "@reduxjs/toolkit";
import { Dictionary } from "lodash";
import { useState } from "react";
import { IonActionSheetCustomEvent, OverlayEventDetail } from "@ionic/core";
import { ReactComponent as ShortSwipeSvg } from "./swipeShort.svg";
import { ReactComponent as LongSwipeSvg } from "./swipeLong.svg";
import {
  arrowDownOutline,
  arrowUndoOutline,
  arrowUpOutline,
  bookmarkOutline,
  chevronCollapseOutline,
  eyeOffOutline,
  mailUnreadOutline,
} from "ionicons/icons";

export default function SwipeSettings() {
  const [open, setOpen] = useState(false);
  const dispatch = useAppDispatch();

  const post = useAppSelector((state) => state.gesture.swipe.post);
  const comment = useAppSelector((state) => state.gesture.swipe.comment);
  const inbox = useAppSelector((state) => state.gesture.swipe.inbox);

  const disableLeftSwipes = useAppSelector(
    (state) => state.gesture.swipe.disableLeftSwipes
  );
  const disableRightSwipes = useAppSelector(
    (state) => state.gesture.swipe.disableRightSwipes
  );

  return (
    <>
      <SwipeList
        name="Posts"
        selector={post}
        options={OSwipeActionPost}
        farStart={setPostSwipeActionFarStart}
        start={setPostSwipeActionStart}
        end={setPostSwipeActionEnd}
        farEnd={setPostSwipeActionFarEnd}
      />
      <SwipeList
        name="Comments"
        selector={comment}
        options={OSwipeActionComment}
        farStart={setCommentSwipeActionFarStart}
        start={setCommentSwipeActionStart}
        end={setCommentSwipeActionEnd}
        farEnd={setCommentSwipeActionFarEnd}
      />
      <SwipeList
        name="Inbox"
        selector={inbox}
        options={OSwipeActionInbox}
        farStart={setInboxSwipeActionFarStart}
        start={setInboxSwipeActionStart}
        end={setInboxSwipeActionEnd}
        farEnd={setInboxSwipeActionFarEnd}
      />
      <>
        <ListHeader>
          <IonLabel>Other</IonLabel>
        </ListHeader>
        <IonList inset>
          <InsetIonItem>
            <IonLabel>Disable Left Swipes</IonLabel>
            <IonToggle
              checked={disableLeftSwipes === true}
              onIonChange={(e) =>
                dispatch(setDisableLeftSwipes(e.detail.checked))
              }
            />
          </InsetIonItem>
          <InsetIonItem>
            <IonLabel>Disable Right Swipes</IonLabel>
            <IonToggle
              checked={disableRightSwipes === true}
              onIonChange={(e) =>
                dispatch(setDisableRightSwipes(e.detail.checked))
              }
            />
          </InsetIonItem>
          <InsetIonItem button onClick={() => setOpen(true)}>
            <IonLabel>Reset All Gestures</IonLabel>
            <IonActionSheet
              cssClass="left-align-buttons"
              isOpen={open}
              onDidDismiss={() => setOpen(false)}
              onWillDismiss={(
                e: IonActionSheetCustomEvent<OverlayEventDetail>
              ) => {
                if (e.detail.data) {
                  dispatch(setAllSwipesToDefault());
                }
              }}
              header="Reset"
              buttons={[
                {
                  text: "Reset All",
                  data: true,
                  role: "destructive",
                },
                {
                  text: "Cancel",
                  data: false,
                  role: "cancel",
                },
              ]}
            />
          </InsetIonItem>
        </IonList>
      </>
    </>
  );
}

const swipeIcons = {
  [OSwipeActionAll.None]: " ",
  [OSwipeActionAll.Upvote]: arrowUpOutline,
  [OSwipeActionAll.Downvote]: arrowDownOutline,
  [OSwipeActionAll.Reply]: arrowUndoOutline,
  [OSwipeActionAll.Save]: bookmarkOutline,
  [OSwipeActionAll.Hide]: eyeOffOutline,
  [OSwipeActionAll.Collapse]: chevronCollapseOutline,
  [OSwipeActionAll.MarkUnread]: mailUnreadOutline,
};

interface SwipeListProps {
  name: string;
  selector: SwipeActions;
  options: Dictionary<SwipeAction>;
  farStart: ActionCreatorWithPayload<SwipeAction>;
  start: ActionCreatorWithPayload<SwipeAction>;
  end: ActionCreatorWithPayload<SwipeAction>;
  farEnd: ActionCreatorWithPayload<SwipeAction>;
}

function SwipeList({
  name,
  selector,
  options,
  farStart,
  start,
  end,
  farEnd,
}: SwipeListProps) {
  const Selector = SettingSelector<SwipeAction>;

  const disableLeftSwipes = useAppSelector(
    (state) => state.gesture.swipe.disableLeftSwipes
  );
  const disableRightSwipes = useAppSelector(
    (state) => state.gesture.swipe.disableRightSwipes
  );

  return (
    <>
      <ListHeader>
        <IonLabel>{name}</IonLabel>
      </ListHeader>
      <IonList inset>
        <Selector
          icon={ShortSwipeSvg}
          title="Left Short Swipe"
          selected={selector.start ?? options.None}
          setSelected={start}
          options={options}
          optionIcons={swipeIcons}
          disabled={disableLeftSwipes}
        />
        <Selector
          icon={LongSwipeSvg}
          title="Left Long Swipe"
          selected={selector.farStart ?? options.None}
          setSelected={farStart}
          options={options}
          optionIcons={swipeIcons}
          disabled={disableLeftSwipes}
        />
        <Selector
          icon={ShortSwipeSvg}
          iconMirrored
          title="Right Short Swipe"
          selected={selector.end ?? options.None}
          setSelected={end}
          options={options}
          optionIcons={swipeIcons}
          disabled={disableRightSwipes}
        />
        <Selector
          icon={LongSwipeSvg}
          iconMirrored
          title="Right Long Swipe"
          selected={selector.farEnd ?? options.None}
          setSelected={farEnd}
          options={options}
          optionIcons={swipeIcons}
          disabled={disableRightSwipes}
        />
      </IonList>
    </>
  );
}
