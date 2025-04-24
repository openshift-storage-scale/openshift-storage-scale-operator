import { useLayoutEffect } from "react";

export interface UseTweakListPageBodyHeaderStyleOptions {
  isFlex: boolean;
  isFilled: boolean;
  direction: "column" | "row";
  alignment: "start" | "end" | "center" | "space-between" | "space-around";
  justification: "start" | "end" | "center" | "space-between" | "space-around";
}

const LIST_PAGE_BODY_HEADER_DEFAULT_CLASSES =
  "co-m-pane__body co-m-pane__body--no-top-margin";

/**
 * This hook is a hack becasue <ListPageHeader> doesn't accept `styles` or `className` props.
 */
export const useTweakListPageBodyHeaderStyle = (
  options: Partial<UseTweakListPageBodyHeaderStyleOptions>
) => {
  const { isFlex, isFilled, direction, alignment, justification } = options;

  useLayoutEffect(() => {
    const ref = document.querySelector<HTMLDivElement>(
      "#content-scrollable > section > div.co-m-pane__body"
    );

    if (ref) {
      // reset classes first
      ref.className = LIST_PAGE_BODY_HEADER_DEFAULT_CLASSES;

      // then set new classes
      const classes = [
        isFlex ? "pf-u-display-flex" : "",
        isFilled ? "pf-u-flex-grow-1" : "",
        direction ? `pf-u-flex-direction-${direction}` : "",
        alignment ? `pf-u-align-items-${alignment}` : "",
        justification ? `pf-u-justify-content-${justification}` : "",
      ].filter(Boolean);
      ref.classList.add(...classes);
    }
  }, [isFlex, isFilled, direction, alignment, justification]);
};
