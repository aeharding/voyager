import { MutableRefObject } from "react";

export default function usePreserveElPositionInScrollView(elRef: MutableRefObject<HTMLElement>): {
    return {
        save,
        restore
    }
}