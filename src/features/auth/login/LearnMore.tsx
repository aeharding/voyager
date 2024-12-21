import {
  IonBackButton,
  IonButtons,
  IonContent,
  IonText,
  IonToolbar,
} from "@ionic/react";

import AppHeader from "#/features/shared/AppHeader";
import { cx } from "#/helpers/css";

import styles from "./LearnMore.module.css";

export default function LearnMore() {
  return (
    <>
      <AppHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton />
          </IonButtons>
        </IonToolbar>
      </AppHeader>
      <IonContent className={cx("ion-padding", styles.content)}>
        <h2>How does this app work?</h2>
        <p>
          Lemmy is a decentralized <strong>network of communities</strong> where
          people can <strong>submit content</strong> such as links, text posts,
          images and videos. These posts are then{" "}
          <strong>up and down voted</strong> by other people. Posts contain{" "}
          <strong>comments to discuss</strong> the post further.
        </p>

        <p>Voyager is one of many apps built for Lemmy.</p>

        <h2>Decentralized?</h2>
        <p>
          <IonText color="secondary">
            <strong>Lemmy</strong>
          </IonText>{" "}
          is a decentralized service. Another decentralized service you probably
          are familiar with is{" "}
          <IonText color="warning">
            <strong>E-Mail</strong>
          </IonText>
          .
        </p>
        <ul className={styles.list}>
          <li>
            <IonText color="secondary">
              <strong>Lemmy</strong>
            </IonText>
            , like{" "}
            <IonText color="warning">
              <strong>E-Mail</strong>
            </IonText>
            , has a common set of features.
            <div className={styles.compare}>
              <div>
                <IonText color="secondary">
                  <strong>Create posts</strong>
                </IonText>
                <IonText color="secondary">
                  <strong>Upvote stuff</strong>
                </IonText>
              </div>
              <div>vs</div>
              <div>
                <IonText color="warning">
                  <strong>Send mail</strong>
                </IonText>
                <IonText color="warning">
                  <strong>Receive mail</strong>
                </IonText>
              </div>
            </div>
          </li>
          <li>
            Your{" "}
            <IonText color="secondary">
              <strong>Lemmy account</strong>
            </IonText>{" "}
            is like your{" "}
            <IonText color="warning">
              <strong>E-Mail account</strong>
            </IonText>
            : it’s hosted by a particular provider.
            <div className={styles.compare}>
              <div>
                <IonText color="secondary">
                  <strong>lemmy.world</strong>
                </IonText>
                <IonText color="secondary">
                  <strong>lemm.ee</strong>
                </IonText>
              </div>
              <div>vs</div>
              <div>
                <IonText color="warning">
                  <strong>gmail.com</strong>
                </IonText>
                <IonText color="warning">
                  <strong>hotmail.com</strong>
                </IonText>
              </div>
            </div>
            <div>
              Like{" "}
              <IonText color="warning">
                <strong>E-Mail</strong>
              </IonText>
              , you can interact with people on other providers.
            </div>
          </li>
          <li>
            <IonText color="secondary">
              <strong>Voyager</strong>
            </IonText>{" "}
            is like your{" "}
            <IonText color="warning">
              <strong>Mail app</strong>
            </IonText>
            : it has a particular layout and style you use to access your{" "}
            <IonText color="secondary">
              <strong>Lemmy account</strong>
            </IonText>
            .
          </li>
        </ul>
      </IonContent>
    </>
  );
}
