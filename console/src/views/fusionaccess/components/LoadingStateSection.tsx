import React from "react";
import {
  EmptyState,
  EmptyStateHeader,
  Spinner,
  EmptyStateBody,
} from "@patternfly/react-core";

type LoadingStateSectionProps = {
  titleText: React.ReactNode;
  bodyText: React.ReactNode;
  icon?: React.ReactElement;
};

export const LoadingStateSection: React.FC<LoadingStateSectionProps> = (
  props
) => {
  const { titleText, bodyText, icon = <Spinner /> } = props;

  return (
    <EmptyState>
      <EmptyStateHeader titleText={titleText} headingLevel="h4" icon={icon} />
      <EmptyStateBody>{bodyText}</EmptyStateBody>
    </EmptyState>
  );
};

LoadingStateSection.displayName = "LoadingStateSection";
