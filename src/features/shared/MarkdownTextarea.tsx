import { useMergedRef } from "@mantine/hooks";
import hljs from "highlight.js";
import { useEffect, useRef } from "react";

import { cx } from "#/helpers/css";

import styles from "./MarkdownTextarea.module.css";

type TextareaComponent =
  | React.ComponentType<React.ComponentPropsWithRef<"textarea">>
  | "textarea";

interface MarkdownTextareaProps
  extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, "ref"> {
  ref?: React.Ref<HTMLTextAreaElement>;
  textareaComponent?: TextareaComponent;
}

export default function MarkdownTextarea({
  textareaComponent: Textarea = "textarea",
  ...props
}: MarkdownTextareaProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const highlightRef = useRef<HTMLDivElement>(null);

  function onChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    props.onChange?.(e);
    updateHighlight(e.target.value);
  }

  function updateHighlight(value: string) {
    if (!highlightRef.current) return;

    highlightRef.current.innerHTML = hljs.highlight(value, {
      language: "markdown",
    }).value;
  }

  useEffect(() => {
    updateHighlight(props.value as string);
  }, [props.value]);

  return (
    <div className={styles.container}>
      <div
        className={cx(styles.hljsContainer, props.className)}
        ref={highlightRef}
      />
      <Textarea
        {...props}
        ref={useMergedRef(textareaRef, props.ref)}
        onChange={onChange}
      />
    </div>
  );
}
