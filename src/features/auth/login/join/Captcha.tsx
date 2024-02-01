import {
  IonIcon,
  IonInput,
  IonItem,
  IonList,
  IonSpinner,
  IonText,
} from "@ionic/react";
import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useState,
} from "react";
import { getClient } from "../../../../services/lemmy";
import { GetCaptchaResponse, Register } from "lemmy-js-client";
import styled from "@emotion/styled";
import { refresh, volumeHigh, volumeHighOutline } from "ionicons/icons";
import { b64ToBlob } from "../../../../helpers/blob";
import { PlainButton } from "../../../shared/PlainButton";

const CaptchaIonList = styled(IonList)`
  position: relative;

  height: 100px;
`;

const CaptchaIonItem = styled(IonItem)`
  --background: none;
`;

const CaptchaImg = styled.img`
  margin: 0 auto;
  height: 100px;
`;

const CaptchaBg = styled.img`
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  filter: blur(20px);
`;

const Actions = styled.div`
  position: absolute;
  top: 0;
  right: 0;
  font-size: 1.3rem;
  padding: 12px;

  z-index: 1;

  display: flex;
  gap: 12px;

  background: rgba(0, 0, 0, 0.4);
  border-bottom-left-radius: 12px;
`;

const SpinnerContainer = styled.div`
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.3);

  z-index: 1;
`;

const Spinner = styled(IonSpinner)`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
`;

export interface CaptchaHandle {
  getResult: () => Pick<Register, "captcha_answer" | "captcha_uuid">;
}

interface CaptchaProps {
  url: string;
}

export default forwardRef<CaptchaHandle, CaptchaProps>(function Captcha(
  { url },
  ref,
) {
  const [captcha, setCaptcha] = useState<GetCaptchaResponse | undefined>();
  const [answer, setAnswer] = useState("");
  const [playing, setPlaying] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string>("");
  const [loading, setLoading] = useState(false);

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
    setLoading(true);

    let res;

    try {
      res = await getClient(url).getCaptcha();
    } finally {
      setLoading(false);
    }

    setCaptcha(res);
  }, [url]);

  useEffect(() => {
    if (!captcha?.ok) return;

    // Safari doesn't support playing b64 data URIs, so we gotta createObjectURL
    const blob = b64ToBlob(captcha.ok.wav, "audio/wav");
    const newUrl = URL.createObjectURL(blob);
    setAudioUrl(newUrl);

    return () => {
      URL.revokeObjectURL(newUrl);
    };
  }, [captcha]);

  useEffect(() => {
    getCaptcha();
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
      <CaptchaIonList inset>
        {captcha?.ok && (
          <>
            <CaptchaBg src={`data:image/png;base64,${captcha.ok.png}`} />
            <CaptchaIonItem>
              <CaptchaImg
                src={`data:image/png;base64,${captcha.ok.png}`}
                alt="Captcha image"
              />
            </CaptchaIonItem>
          </>
        )}

        <Actions>
          <PlainButton
            aria-label="Refresh captcha"
            onClick={() => {
              if (loading || playing) return;

              getCaptcha();
            }}
          >
            <IonIcon icon={refresh} color="primary" />
          </PlainButton>
          <PlainButton aria-label="Play captcha audio" onClick={play}>
            <IonIcon
              icon={playing ? volumeHigh : volumeHighOutline}
              color="primary"
            />
          </PlainButton>
        </Actions>

        {loading && (
          <SpinnerContainer>
            <Spinner />
          </SpinnerContainer>
        )}
      </CaptchaIonList>
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
});
