import CompactSettings from "./CompactSettings";
import LargeSettings from "./LargeSettings";
import Layout from "./layout/Layout";
import Other from "./other/Other";
import Posts from "./posts/Posts";
import TextSize from "./TextSize";
import ThemesButton from "./ThemesButton";

export default function AppearanceSettings() {
  return (
    <>
      <ThemesButton />
      <TextSize />
      <Layout />
      <Posts />
      <LargeSettings />
      <CompactSettings />
      <Other />
    </>
  );
}
