import { Dispatch, SetStateAction } from "react";

import useTextRecovery from "#/helpers/useTextRecovery";
import { useAppSelector } from "#/store";

import PlainTextEditor from "./PlainTextEditor";
import RichTextEditor from "./rich/RichTextEditor";

export interface EditorProps {
  text: string;
  setText: Dispatch<SetStateAction<string>>;
  onSubmit?: () => unknown;
  canRecoverText?: boolean;
  onDismiss?: () => void;

  children?: React.ReactNode;

  ref?: React.RefObject<HTMLElement | null>;
}

/**
 * Backend-agnostic markdown editor entry point. Picks the active backend — the
 * plain `<textarea>` editor or the opt-in rich editor — and owns the concerns
 * shared by both (text recovery). All textarea/contenteditable specifics,
 * including exposing the element through `ref`, live in the backend components.
 */
export default function Editor({
  canRecoverText = true,
  ...props
}: EditorProps) {
  const richMarkdownEditor = useAppSelector(
    (state) => state.settings.general.richMarkdownEditor,
  );

  useTextRecovery(props.text, props.setText, !canRecoverText);

  // Opt-in experimental editor (off by default)
  if (richMarkdownEditor) return <RichTextEditor {...props} />;

  return <PlainTextEditor {...props} />;
}
