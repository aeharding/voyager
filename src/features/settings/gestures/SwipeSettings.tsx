import { IonActionSheetCustomEvent, OverlayEventDetail } from "@ionic/core";
import {
  IonActionSheet,
  IonItem,
  IonLabel,
  IonList,
  IonToggle,
} from "@ionic/react";
import { ActionCreatorWithPayload } from "@reduxjs/toolkit";
import { startCase } from "es-toolkit";
import {
  arrowDownOutline,
  arrowUndoOutline,
  arrowUpOutline,
  bookmarkOutline,
  chevronCollapseOutline,
  chevronDownOutline,
  eyeOffOutline,
  mailUnreadOutline,
} from "ionicons/icons";
import { useState } from "react";

import { ListHeader } from "#/features/settings/shared/formatting";
import SettingSelector from "#/features/settings/shared/SettingSelector";
import { getShareIcon, isNative } from "#/helpers/device";
import {
  OLongSwipeTriggerPointType,
  OSwipeActionAll,
  OSwipeActionComment,
  OSwipeActionInbox,
  OSwipeActionPost,
  SwipeAction,
  SwipeActions,
} from "#/services/db";
import { useAppDispatch, useAppSelector } from "#/store";

import {
  setAllSwipesToDefault,
  setCommentSwipeActionEnd,
  setCommentSwipeActionFarEnd,
  setCommentSwipeActionFarStart,
  setCommentSwipeActionStart,
  setDisableLeftSwipes,
  setDisableRightSwipes,
  setInboxSwipeActionEnd,
  setInboxSwipeActionFarEnd,
  setInboxSwipeActionFarStart,
  setInboxSwipeActionStart,
  setLongSwipeTriggerPoint,
  setPostSwipeActionEnd,
  setPostSwipeActionFarEnd,
  setPostSwipeActionFarStart,
  setPostSwipeActionStart,
} from "./gestureSlice";
import LongSwipeSvg from "./swipeLong.svg?react";
import ShortSwipeSvg from "./swipeShort.svg?react";

export default function SwipeSettings() {
  const [open, setOpen] = useState(false);
  const dispatch = useAppDispatch();

  const post = useAppSelector((state) => state.gesture.swipe.post);
  const comment = useAppSelector((state) => state.gesture.swipe.comment);
  const inbox = useAppSelector((state) => state.gesture.swipe.inbox);

  const { disableLeftSwipes, disableRightSwipes, longSwipeTriggerPoint } =
    useAppSelector((state) => state.gesture.swipe);

  function filterCapableOptions(
    options: Record<string, SwipeAction>,
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
          <IonItem>
            <IonToggle
              checked={disableLeftSwipes === true}
              onIonChange={(e) =>
                dispatch(setDisableLeftSwipes(e.detail.checked))
              }
            >
              Disable Left Swipes
            </IonToggle>
          </IonItem>
          <IonItem>
            <IonToggle
              checked={disableRightSwipes === true}
              onIonChange={(e) =>
                dispatch(setDisableRightSwipes(e.detail.checked))
              }
            >
              Disable Right Swipes
            </IonToggle>
          </IonItem>
          <SettingSelector
            title="Long Swipe Trigger Point"
            openTitle="When the long swipe action should trigger..."
            selected={longSwipeTriggerPoint}
            setSelected={setLongSwipeTriggerPoint}
            options={OLongSwipeTriggerPointType}
          />
          <IonItem button onClick={() => setOpen(true)} detail={false}>
            <IonLabel color="primary">Reset All Gestures</IonLabel>
            <IonActionSheet
              isOpen={open}
              onDidDismiss={() => setOpen(false)}
              onWillDismiss={(
                e: IonActionSheetCustomEvent<OverlayEventDetail>,
              ) => {
                if (e.detail.data) {
                  dispatch(setAllSwipesToDefault());
                }
              }}
              buttons={[
                {
                  text: "Restore Defaults",
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
          </IonItem>
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
  [OSwipeActionAll.Share]: getShareIcon(),
};

interface SwipeListProps {
  name: string;
  selector: SwipeActions;
  options: Record<string, SwipeAction>;
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
