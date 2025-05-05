import ExternalTip from "./ExternalTip";

export interface IExternalTip {
  title: string;
  amount: number;
  link: string;
}

const EXTERNAL_TIPS_AMOUNTS: IExternalTip[] = [
  {
    title: "😊 Fediverse Ally Tip",
    amount: 2.99,
    link: "https://donate.stripe.com/aEU5kz1Yog7z2CAbIJ",
  },
  {
    title: "🥰 Lemmy Appreciator Tip",
    amount: 6.99,
    link: "https://donate.stripe.com/00geV90Uk8F76SQ7su",
  },
  {
    title: "❤️‍🔥 Voyager Fanatic Tip",
    amount: 19.99,
    link: "https://donate.stripe.com/aEUcN1fPebRjb96003",
  },
] as const;

export default function ExternalTips() {
  return EXTERNAL_TIPS_AMOUNTS.map((tip) => (
    <ExternalTip key={tip.link} tip={tip} />
  ));
}
