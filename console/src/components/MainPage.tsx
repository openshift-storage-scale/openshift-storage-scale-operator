import * as React from 'react';
import Helmet from 'react-helmet';
import { useTranslation } from 'react-i18next';
import {
  Button,
  Divider,
  EmptyState,
  EmptyStateActions,
  EmptyStateBody,
  EmptyStateFooter,
  EmptyStateHeader,
  EmptyStateIcon,
  Page,
  PageSection,
  Text,
  TextContent,
  Title
} from '@patternfly/react-core';
import StorageDomainIcon from '@patternfly/react-icons/dist/js/icons/storage-domain-icon';
import ExternalLinkIcon from '@patternfly/react-icons/dist/js/icons/external-link-alt-icon';

export default function ExamplePage() {
  const { t } = useTranslation('plugin__openshift-storage-scale-console');

  return (
    <>
      <Helmet>
        <title data-test="example-page-title">{t('plugin_name')}</title>
      </Helmet>
      <Page>
        <PageSection>
          <Title headingLevel="h1">{t('plugin_name')}</Title>
          <TextContent>
            <Text component="small">{t('Explanation that no body will read')}</Text>
          </TextContent>
        </PageSection>
        <PageSection>
          <Divider />
        </PageSection>
        <PageSection>
          <EmptyState>
            <EmptyStateHeader titleText={t("No storage cluster")} headingLevel="h4" icon={<EmptyStateIcon icon={StorageDomainIcon} />} />
            <EmptyStateBody>
              {t("You need to create a storage cluster before you'll be able to create file systems.")}
            </EmptyStateBody>
            <EmptyStateFooter>
              <EmptyStateActions>
                <Button variant="primary">{t("Create storage cluster")}</Button>
              </EmptyStateActions>
              <EmptyStateActions>
                <Button variant="link">{t("Learn more about Fusion Access for SAN storage clusters")} <ExternalLinkIcon /></Button>
              </EmptyStateActions>
            </EmptyStateFooter>
          </EmptyState>
        </PageSection>
      </Page>
    </>
  );
}
