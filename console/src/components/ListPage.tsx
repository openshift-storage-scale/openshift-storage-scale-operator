import React from 'react';
import { Helmet } from 'react-helmet';
import {
  ListPageBody,
  ListPageHeader,
} from '@openshift-console/dynamic-plugin-sdk';

type BasePageProps = {
  docTitle: string;
  pageTitle: string;
  pageDescription?: string;
  pageActions?: React.ReactElement[];
};

export const ListPage: React.FC<BasePageProps> = (props) => {
  const {
    children,
    docTitle,
    pageTitle,
    pageDescription = '',
    pageActions = [],
  } = props;

  return (
    <>
      <Helmet>
        <title data-testid="doc-title">{docTitle}</title>
      </Helmet>
      <ListPageHeader title={pageTitle} helpText={pageDescription}>
        {pageActions.length > 0 && pageActions}
      </ListPageHeader>
      <ListPageBody>{children}</ListPageBody>
    </>
  );
};

ListPage.displayName = 'ListPage';
