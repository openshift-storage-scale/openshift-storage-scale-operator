import * as React from 'react';
import { Modal, ModalVariant } from '@patternfly/react-core';
import { LocalVolumeDiscoveryResultSpec } from '../data/model';

interface DisksModalProps {
  data: LocalVolumeDiscoveryResultSpec;
  isOpen: boolean;
  onClose: any; // TODO: This is a function, not sure how to tell TS that
}

export const DisksModal: React.FC<DisksModalProps> = (props) => {
  if (props.data === undefined) {
    return null;
  }

  return (
    <>
      <Modal isOpen={props.isOpen} onClose={props.onClose} variant={ModalVariant.small}>
        <h4>Disks on node {props.data.spec.nodeName}:</h4>
        <ul>
          {props.data.status.discoveredDevices.map((device) => (
            <li>{device.WWN}</li>
          ))}
        </ul>
      </Modal>
    </>
  );
};
