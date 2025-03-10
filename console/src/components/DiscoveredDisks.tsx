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
    var [discoveryresults, loaded, loadError] = useK8sWatchResource<LocalVolumeDiscoveryResultSpec[]>({
        groupVersionKind: LocalVolumeDiscoveryResultKind,
        isList: true,
        // namespace: "default", TBD if we need to filter for namespace here
        namespaced: true,
    });
    discoveryresults = [
        {
            "kind": "LocalVolumeDiscoveryResult",
            "apiVersion": "purple.purplestorage.com/v1alpha1",
            "metadata": {
                "name": "discovery-result-ip-10-0-13-139.eu-west-1.compute.internal",
                "namespace": "openshift-operators",
                "labels": {
                    "discovery-result-node": "ip-10-0-13-139.eu-west-1.compute.internal"
                }
            },
            "spec": {
                "nodeName": "worker-0"
            },
            "status": {
                "discoveredDevices": [
                    {
                        "size": 161061273600,
                        "path": "/dev/lun1",
                        "fstype": "",
                        "vendor": "",
                        "model": "Amazon Elastic Block Store",
                        "WWN": "0xcafecafecafe",
                        "deviceID": "/dev/disk/by-id/nvme-Amazon_Elastic_Block_Store_vol0a3fce28588daea9f",
                        "status": {
                            "state": "Available"
                        },
                        "serial": "vol0a3fce28588daea9f",
                        "property": "NonRotational",
                        "type": "disk"
                    },
                    {
                        "size": 161061273600,
                        "path": "/dev/lun3",
                        "fstype": "",
                        "vendor": "",
                        "model": "Amazon Elastic Block Store",
                        "WWN": "0xdeaddeaddead",
                        "deviceID": "/dev/disk/by-id/nvme-Amazon_Elastic_Block_Store_vol0a3fce28588daea9f",
                        "status": {
                            "state": "Available"
                        },
                        "serial": "vol0a3fce28588daea9f",
                        "property": "NonRotational",
                        "type": "disk"
                    }
                ],
            }
        },
        {
            "kind": "LocalVolumeDiscoveryResult",
            "apiVersion": "purple.purplestorage.com/v1alpha1",
            "metadata": {
                "name": "discovery-result-ip-10-0-13-139.eu-west-1.compute.internal",
                "namespace": "openshift-operators",
                "labels": {
                    "discovery-result-node": "ip-10-0-13-139.eu-west-1.compute.internal"
                }
            },
            "spec": {
                "nodeName": "worker-1"
            },
            "status": {
                "discoveredDevices": [
                    {
                        "size": 161061273600,
                        "path": "/dev/lun1",
                        "fstype": "",
                        "vendor": "",
                        "model": "Amazon Elastic Block Store",
                        "WWN": "0xcafecafecafe",
                        "deviceID": "/dev/disk/by-id/nvme-Amazon_Elastic_Block_Store_vol0a3fce28588daea9f",
                        "status": {
                            "state": "Available"
                        },
                        "serial": "vol0a3fce28588daea9f",
                        "property": "NonRotational",
                        "type": "disk"
                    },
                    {
                        "size": 161061273600,
                        "path": "/dev/lun2",
                        "fstype": "",
                        "vendor": "",
                        "model": "Amazon Elastic Block Store",
                        "WWN": "0xf00f00df00d",
                        "deviceID": "/dev/disk/by-id/nvme-Amazon_Elastic_Block_Store_vol0a3fce28588daea9f",
                        "status": {
                            "state": "Available"
                        },
                        "serial": "vol0a3fce28588daea9f",
                        "property": "NonRotational",
                        "type": "disk"
                    },
                    {
                        "size": 161061273600,
                        "path": "/dev/lun3",
                        "fstype": "",
                        "vendor": "",
                        "model": "Amazon Elastic Block Store",
                        "WWN": "0xdeaddeaddead",
                        "deviceID": "/dev/disk/by-id/nvme-Amazon_Elastic_Block_Store_vol0a3fce28588daea9f",
                        "status": {
                            "state": "Available"
                        },
                        "serial": "vol0a3fce28588daea9f",
                        "property": "NonRotational",
                        "type": "disk"
                    }
                ],
            }
        },
        {
            "kind": "LocalVolumeDiscoveryResult",
            "apiVersion": "purple.purplestorage.com/v1alpha1",
            "metadata": {
                "name": "discovery-result-ip-10-0-26-151.eu-west-1.compute.internal",
                "namespace": "openshift-operators",
                "labels": {
                    "discovery-result-node": "ip-10-0-26-151.eu-west-1.compute.internal"
                }
            },
            "spec": {
                "nodeName": "worker-2"
            },
            "status": {
                "discoveredDevices": [
                    {
                        "size": 161061273600,
                        "path": "/dev/lun1",
                        "fstype": "",
                        "vendor": "",
                        "model": "Amazon Elastic Block Store",
                        "WWN": "0xcafecafecafe",
                        "deviceID": "/dev/disk/by-id/nvme-Amazon_Elastic_Block_Store_vol0a3fce28588daea9f",
                        "status": {
                            "state": "Available"
                        },
                        "serial": "vol0a3fce28588daea9f",
                        "property": "NonRotational",
                        "type": "disk"
                    },
                    {
                        "size": 161061273600,
                        "path": "/dev/lun2",
                        "fstype": "",
                        "vendor": "",
                        "model": "Amazon Elastic Block Store",
                        "WWN": "0xf00f00df00d",
                        "deviceID": "/dev/disk/by-id/nvme-Amazon_Elastic_Block_Store_vol0a3fce28588daea9f",
                        "status": {
                            "state": "Available"
                        },
                        "serial": "vol0a3fce28588daea9f",
                        "property": "NonRotational",
                        "type": "disk"
                    },
                    {
                        "size": 161061273600,
                        "path": "/dev/lun3",
                        "fstype": "",
                        "vendor": "",
                        "model": "Amazon Elastic Block Store",
                        "WWN": "0xdeaddeaddead",
                        "deviceID": "/dev/disk/by-id/nvme-Amazon_Elastic_Block_Store_vol0a3fce28588daea9f",
                        "status": {
                            "state": "Available"
                        },
                        "serial": "vol0a3fce28588daea9f",
                        "property": "NonRotational",
                        "type": "disk"
                    }

                ],
            }
        },
        {
            "kind": "LocalVolumeDiscoveryResult",
            "apiVersion": "purple.purplestorage.com/v1alpha1",
            "metadata": {
                "name": "discovery-result-ip-10-0-39-204.eu-west-1.compute.internal",
                "creationTimestamp": "2025-03-07T08:47:32Z",
                "generation": 1,
                "namespace": "openshift-operators",
                "labels": {
                    "discovery-result-node": "ip-10-0-39-204.eu-west-1.compute.internal"
                }
            },
            "spec": {
                "nodeName": "worker-3"
            },
            "status": {
                "discoveredDevices": [
                    {
                        "size": 161061273600,
                        "path": "/dev/lun2",
                        "fstype": "",
                        "vendor": "",
                        "model": "Amazon Elastic Block Store",
                        "WWN": "0xf00f00df00d",
                        "deviceID": "/dev/disk/by-id/nvme-Amazon_Elastic_Block_Store_vol0a3fce28588daea9f",
                        "status": {
                            "state": "Available"
                        },
                        "serial": "vol0a3fce28588daea9f",
                        "property": "NonRotational",
                        "type": "disk"
                    },
                    {
                        "size": 161061273600,
                        "path": "/dev/lun3",
                        "fstype": "",
                        "vendor": "",
                        "model": "Amazon Elastic Block Store",
                        "WWN": "0xdeaddeaddead",
                        "deviceID": "/dev/disk/by-id/nvme-Amazon_Elastic_Block_Store_vol0a3fce28588daea9f",
                        "status": {
                            "state": "Available"
                        },
                        "serial": "vol0a3fce28588daea9f",
                        "property": "NonRotational",
                        "type": "disk"
                    }

                ],
            }
        }
    ]
    function updateMap(map: Map<string, string[]>, key: string, value: string) {
        // Get the existing list or create a new one if not found
        const existingList = map.get(key) || [];

        // Add the new value to the list
        existingList.push(value);

        // Set the updated list back in the map
        map.set(key, existingList);
    }

    var flatNode = new Map<string, string[]>()  //nodes, disks (wwns) that node has
    var uniqeDisks = new Map<string, string[]>() //disks, nodes that have that disk


    discoveryresults.map((node, index) => {
        var devices = node.status.discoveredDevices.map(device => {
            updateMap(uniqeDisks, device.WWN, node.spec.nodeName)
            return device.WWN
        })
        flatNode.set(node.spec.nodeName, devices)
    })

    console.log(flatNode)
    console.log(uniqeDisks)

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
                        <EmptyStateBody>
                            No LocalVolumeDiscoveryResult exist in the cluster.
                        </EmptyStateBody>
                    </EmptyState>
                </PageSection>
            </>
        );
    }

    return (
        <>
            <PageSection variant="light">
                <Flex>
                    {discoveryresults.map((node, index) => {
                        return (
                            <FlexItem key={index}>
                                <CatalogTile
                                    key={index}
                                    id={node.metadata.name}
                                    title={node.spec.nodeName}
                                    description={node.status.discoveredDevices.length + " Disk(s)"}
                                    onClick={() => {
                                        setModalData(node);
                                        setModalVisible(true);
                                    }}
                                />
                            </FlexItem>
                        );
                    })}
                </Flex>
            </PageSection>
            <DisksModal
                data={modalData}
                isOpen={modalVisible}
                onClose={() => setModalVisible(false)}
            />
        </>
    );
};