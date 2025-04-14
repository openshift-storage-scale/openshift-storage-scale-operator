import React from "react";
import { PageContext, type TPageContextGetters } from "@/contexts/PageContext";

export const usePageContext = (
  initialValues?: Partial<TPageContextGetters>
) => {
  const context = React.useContext(PageContext);
  if (!context) {
    throw new Error(
      "usePageContext hook must be used within a <PageContextProvider/>"
    );
  }

  if (initialValues) {
    if (typeof initialValues.documentTitle !== "undefined") {
      context.setDocumentTitle(initialValues.documentTitle);
    }
    if (typeof initialValues.pageTitle !== "undefined") {
      context.setPageTitle(initialValues.pageTitle);
    }
    if (typeof initialValues.pageDescription !== "undefined") {
      context.setPageDescription(initialValues.pageDescription);
    }
    if (typeof initialValues.pageActions !== "undefined") {
      context.setPageActions(initialValues.pageActions);
    }
  }

  return context;
};
