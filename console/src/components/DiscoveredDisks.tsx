import * as React from 'react';
import {
  EmptyState,
  EmptyStateBody,
  Flex,
  FlexItem,
  PageSection,
  Title,
} from '@patternfly/react-core';
import { LocalVolumeDiscoveryResultSpec, LocalVolumeDiscoveryResultKind } from '../data/model';
import { DisksModal } from './DisksModal';
import { CatalogTile } from '@patternfly/react-catalog-view-extension';
import { useK8sWatchResource } from '@openshift-console/dynamic-plugin-sdk';

export const DiscoveredDisks: React.FC = () => {
  const [discoveryresults, loaded, loadError] = useK8sWatchResource<
    LocalVolumeDiscoveryResultSpec[]
  >({
    groupVersionKind: LocalVolumeDiscoveryResultKind,
    isList: true,
    // namespace: "default", TBD if we need to filter for namespace here
    namespaced: true,
  });

  const [modalVisible, setModalVisible] = React.useState(false);
  const [modalData, setModalData] = React.useState<LocalVolumeDiscoveryResultSpec>();

  if (loaded === false) {
    return (
      <>
        <PageSection variant="light">Loading...</PageSection>
      </>
    );
  }

  if (loadError) {
    return (
      <>
        <PageSection variant="light">ERROR: {loadError}</PageSection>
      </>
    );
  }

  if (loaded === true && discoveryresults.length === 0) {
    return (
      <>
        <PageSection variant="light">
          <EmptyState>
            <Title headingLevel="h4" size="lg">
              No LocalVolumeDiscoveryResult found
            </Title>
            <EmptyStateBody>No LocalVolumeDiscoveryResult exist in the cluster.</EmptyStateBody>
          </EmptyState>
        </PageSection>
      </>
    );
  }

  return (
    <>
      <PageSection variant="light">
        <Flex>
          {discoveryresults.map((item, index) => {
            return (
              <FlexItem key={index}>
                <CatalogTile
                  key={index}
                  id={item.metadata.name}
                  title={item.spec.nodeName}
                  description={item.status.discoveredDevices.length + ' Disk(s)'}
                  onClick={() => {
                    setModalData(item);
                    setModalVisible(true);
                  }}
                />
              </FlexItem>
            );
          })}
        </Flex>
      </PageSection>
      <DisksModal data={modalData} isOpen={modalVisible} onClose={() => setModalVisible(false)} />
    </>
  );
};
