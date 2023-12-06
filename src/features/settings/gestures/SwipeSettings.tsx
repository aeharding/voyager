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
  OLongSwipeTriggerPointType,
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
  setLongSwipeTriggerPoint,
} from "./gestureSlice";
import { ActionCreatorWithPayload } from "@reduxjs/toolkit";
import { Dictionary, startCase } from "lodash";
import { useState } from "react";
import { IonActionSheetCustomEvent, OverlayEventDetail } from "@ionic/core";
import ShortSwipeSvg from "./swipeShort.svg?react";
import LongSwipeSvg from "./swipeLong.svg?react";
import {
  arrowDownOutline,
  arrowUndoOutline,
  arrowUpOutline,
  shareOutline,
  bookmarkOutline,
  chevronCollapseOutline,
  eyeOffOutline,
  mailUnreadOutline,
  chevronDownOutline,
} from "ionicons/icons";
import { isNative } from "../../../helpers/device";

export default function SwipeSettings() {
  const [open, setOpen] = useState(false);
  const dispatch = useAppDispatch();

  const post = useAppSelector((state) => state.gesture.swipe.post);
  const comment = useAppSelector((state) => state.gesture.swipe.comment);
  const inbox = useAppSelector((state) => state.gesture.swipe.inbox);

  const { disableLeftSwipes, disableRightSwipes, longSwipeTriggerPoint } =
    useAppSelector((state) => state.gesture.swipe);

  function filterCapableOptions(
    options: Dictionary<SwipeAction>,
  ): typeof options {
    const filteredOptions = { ...options };

    // Web clients rely on navigator.share, which requires initiating
    // share with a gesture. That doesn't work super well, so disable
    if (!isNative()) delete filteredOptions["Share"];

    return filteredOptions;
  }

  return (
    <>
      <SwipeList
        name="Posts"
        selector={post}
        options={filterCapableOptions(OSwipeActionPost)}
        farStart={setPostSwipeActionFarStart}
        start={setPostSwipeActionStart}
        end={setPostSwipeActionEnd}
        farEnd={setPostSwipeActionFarEnd}
      />
      <SwipeList
        name="Comments"
        selector={comment}
        options={filterCapableOptions(OSwipeActionComment)}
        farStart={setCommentSwipeActionFarStart}
        start={setCommentSwipeActionStart}
        end={setCommentSwipeActionEnd}
        farEnd={setCommentSwipeActionFarEnd}
      />
      <SwipeList
        name="Inbox"
        selector={inbox}
        options={filterCapableOptions(OSwipeActionInbox)}
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
            <IonToggle
              checked={disableLeftSwipes === true}
              onIonChange={(e) =>
                dispatch(setDisableLeftSwipes(e.detail.checked))
              }
            >
              Disable Left Swipes
            </IonToggle>
          </InsetIonItem>
          <InsetIonItem>
            <IonToggle
              checked={disableRightSwipes === true}
              onIonChange={(e) =>
                dispatch(setDisableRightSwipes(e.detail.checked))
              }
            >
              Disable Right Swipes
            </IonToggle>
          </InsetIonItem>
          <SettingSelector
            title="Long Swipe Trigger Point"
            openTitle="When the long swipe action should trigger..."
            selected={longSwipeTriggerPoint}
            setSelected={setLongSwipeTriggerPoint}
            options={OLongSwipeTriggerPointType}
          />
          <InsetIonItem button onClick={() => setOpen(true)}>
            <IonLabel>Reset All Gestures</IonLabel>
            <IonActionSheet
              cssClass="left-align-buttons"
              isOpen={open}
              onDidDismiss={() => setOpen(false)}
              onWillDismiss={(
                e: IonActionSheetCustomEvent<OverlayEventDetail>,
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
  [OSwipeActionAll.CollapseToTop]: chevronCollapseOutline,
  [OSwipeActionAll.Collapse]: chevronDownOutline,
  [OSwipeActionAll.MarkUnread]: mailUnreadOutline,
  [OSwipeActionAll.Share]: shareOutline,
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
  const disableLeftSwipes = useAppSelector(
    (state) => state.gesture.swipe.disableLeftSwipes,
  );
  const disableRightSwipes = useAppSelector(
    (state) => state.gesture.swipe.disableRightSwipes,
  );

  function getSelectedLabel(option: string): string {
    return option === "collapse-to-top" ? "Collapse Top" : startCase(option);
  }

  return (
    <>
      <ListHeader>
        <IonLabel>{name}</IonLabel>
      </ListHeader>
      <IonList inset>
        <SettingSelector
          icon={ShortSwipeSvg}
          title="Left Short Swipe"
          selected={selector.start ?? options.None}
          setSelected={start}
          options={options}
          optionIcons={swipeIcons}
          disabled={disableLeftSwipes}
          getSelectedLabel={getSelectedLabel}
        />
        <SettingSelector
          icon={LongSwipeSvg}
          title="Left Long Swipe"
          selected={selector.farStart ?? options.None}
          setSelected={farStart}
          options={options}
          optionIcons={swipeIcons}
          disabled={disableLeftSwipes}
          getSelectedLabel={getSelectedLabel}
        />
        <SettingSelector
          icon={ShortSwipeSvg}
          iconMirrored
          title="Right Short Swipe"
          selected={selector.end ?? options.None}
          setSelected={end}
          options={options}
          optionIcons={swipeIcons}
          disabled={disableRightSwipes}
          getSelectedLabel={getSelectedLabel}
        />
        <SettingSelector
          icon={LongSwipeSvg}
          iconMirrored
          title="Right Long Swipe"
          selected={selector.farEnd ?? options.None}
          setSelected={farEnd}
          options={options}
          optionIcons={swipeIcons}
          disabled={disableRightSwipes}
          getSelectedLabel={getSelectedLabel}
        />
      </IonList>
    </>
  );
}
