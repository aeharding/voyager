import {
  IonIcon,
  IonInput,
  IonItem,
  IonList,
  IonSpinner,
  IonText,
} from "@ionic/react";
import { refresh, volumeHigh, volumeHighOutline } from "ionicons/icons";
import {
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { GetCaptchaResponse, Register } from "threadiverse";

import { b64ToBlob } from "#/helpers/blob";
import { getClient } from "#/services/client";

import styles from "./Captcha.module.css";

export interface CaptchaHandle {
  getResult: () => Pick<Register, "captcha_answer" | "captcha_uuid">;
}

interface CaptchaProps {
  url: string;
  ref: React.RefObject<CaptchaHandle | undefined>;
}

export default function Captcha({ url, ref }: CaptchaProps) {
  const [captcha, setCaptcha] = useState<GetCaptchaResponse | undefined>();
  const [answer, setAnswer] = useState("");
  const [playing, setPlaying] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const abortRef = useRef<AbortController | null>(null);

  const getResult = useCallback(
    () => ({ captcha_answer: answer, captcha_uuid: captcha?.ok?.uuid }),
    [answer, captcha],
  );

  useImperativeHandle(
    ref,
    () => ({
      getResult,
    }),
    [getResult],
  );

  const getCaptcha = useCallback(async () => {
    abortRef.current?.abort();
    const abortController = new AbortController();
    abortRef.current = abortController;
    const { signal } = abortController;

    setLoading(true);

    let res;

    try {
      res = await getClient(url).getCaptcha({ signal });
    } finally {
      if (!signal.aborted) setLoading(false);
    }

    if (signal.aborted) return;

    setCaptcha(res);

    if (res.ok) {
      // Safari doesn't support playing b64 data URIs, so we gotta createObjectURL
      const blob = b64ToBlob(res.ok.wav, "audio/wav");

      setAudioUrl(URL.createObjectURL(blob));
    }
  }, [url]);

  useEffect(() => {
    if (!audioUrl) return;

    return () => URL.revokeObjectURL(audioUrl);
  }, [audioUrl]);

  useEffect(() => {
    // See https://react.dev/learn/you-might-not-need-an-effect#fetching-data
    // eslint-disable-next-line react-hooks/set-state-in-effect
    getCaptcha();

    return () => abortRef.current?.abort();
  }, [getCaptcha]);

  async function play() {
    if (playing) return;
    if (!captcha?.ok) return;

    const audio = new Audio(audioUrl);

    setPlaying(true);

    audio.onended = () => {
      setPlaying(false);
    };
    audio.play();
  }

  return (
    <>
      <IonList inset className={styles.list}>
        {captcha?.ok && (
          <>
            <img
              className={styles.bg}
              src={`data:image/png;base64,${captcha.ok.png}`}
            />
            <IonItem className={styles.item}>
              <img
                className={styles.img}
                src={`data:image/png;base64,${captcha.ok.png}`}
                alt="Captcha image"
              />
            </IonItem>
          </>
        )}

        <div className={styles.actions}>
          <button
            className={styles.button}
            aria-label="Refresh captcha"
            onClick={() => {
              if (loading || playing) return;

              getCaptcha();
            }}
          >
            <IonIcon icon={refresh} color="primary" />
          </button>
          <button
            className={styles.button}
            aria-label="Play captcha audio"
            onClick={play}
          >
            <IonIcon
              icon={playing ? volumeHigh : volumeHighOutline}
              color="primary"
            />
          </button>
        </div>

        {loading && (
          <div className={styles.spinnerContainer}>
            <IonSpinner className={styles.spinner} />
          </div>
        )}
      </IonList>
      <IonList inset>
        <IonItem>
          <IonInput
            labelPlacement="stacked"
            placeholder="enter captcha text above"
            value={answer}
            onIonInput={(e) => setAnswer(e.detail.value || "")}
          >
            <div slot="label">
              Captcha Answer <IonText color="danger">(Required)</IonText>
            </div>
          </IonInput>
        </IonItem>
      </IonList>
    </>
  );
}
