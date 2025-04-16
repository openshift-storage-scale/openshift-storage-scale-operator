import React from "react";
import { Helmet } from "react-helmet";
import {
  ListPageHeader,
  ListPageBody,
} from "@openshift-console/dynamic-plugin-sdk";
import {
  PageContext,
  type TPageContextGetters,
  type TPageContext,
} from "@/contexts/PageContext";

export const PageContextProvider: React.FC<TPageContextGetters> = (props) => {
  const [documentTitle, setDocumentTitle] = React.useState<
    TPageContext["documentTitle"]
  >(props.documentTitle);
  const [pageTitle, setPageTitle] = React.useState<TPageContext["pageTitle"]>(
    props.pageTitle
  );
  const [pageDescription, setPageDescription] = React.useState<
    TPageContext["pageDescription"]
  >(props.pageDescription);
  const [pageActions, setPageActions] = React.useState<
    TPageContext["pageActions"]
  >(props.pageActions);

  return (
    <PageContext.Provider
      value={{
        documentTitle,
        pageTitle,
        pageActions,
        pageDescription,
        setPageActions,
        setPageDescription,
        setDocumentTitle,
        setPageTitle,
      }}
    >
      <Helmet>
        <title data-testid="document-title">{documentTitle}</title>
      </Helmet>
      <ListPageHeader title={pageTitle} helpText={pageDescription}>
        {pageActions.length > 0 && pageActions}
      </ListPageHeader>
      <ListPageBody>{props.children}</ListPageBody>
    </PageContext.Provider>
  );
};

PageContextProvider.displayName = "PageContextProvider";
