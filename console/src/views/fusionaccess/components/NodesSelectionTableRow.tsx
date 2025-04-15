import { useCallback } from "react";
import {
  k8sPatch,
  type RowProps,
  TableData,
} from "@openshift-console/dynamic-plugin-sdk";
import { Checkbox } from "@patternfly/react-core";
import type { IoK8sApiCoreV1Node } from "@/models/kubernetes/1.30/types";
import {
  getCpu,
  getMemory,
  getRole,
} from "@/selectors/kubernetes/1.30/IoK8sApiCoreV1Node";
import {
  getLabels,
  getName,
  getUid,
  hasLabel,
} from "@/selectors/console/K8sResourceCommon";
import { NodeModel } from "@/models/console/NodeModel";

const VALUE_NOT_AVAILABLE = "-";
const STORAGE_ROLE_LABEL_KEY = "scale.spectrum.ibm.com/role";
const STORAGE_ROLE_LABEL_VALUE = "storage";
const storageRoleLabel = `${STORAGE_ROLE_LABEL_KEY}=${STORAGE_ROLE_LABEL_VALUE}`;

type NodesSelectionTableRowProps = RowProps<IoK8sApiCoreV1Node>;
export const NodesSelectionTableRow: React.FC<NodesSelectionTableRowProps> = (
  props
) => {
  const { obj, activeColumnIDs } = props;

  const selected = hasLabel(obj, storageRoleLabel);
  const uid = getUid(obj);
  const name = getName(obj);
  const role = getRole(obj);
  const cpu = getCpu(obj);
  const memory = getMemory(obj);
  let sharedDisks: number | undefined;

  const displayTextFor = {
    name: name ?? VALUE_NOT_AVAILABLE,
    role: role ?? VALUE_NOT_AVAILABLE,
    cpu: cpu ?? VALUE_NOT_AVAILABLE,
    memory: memory ?? VALUE_NOT_AVAILABLE,
    sharedDisks: sharedDisks ?? VALUE_NOT_AVAILABLE,
  };

  const handleNodeSelectionChange = useCallback<
    (event: React.FormEvent<HTMLInputElement>, checked: boolean) => void
  >(
    (_, checked) => {
      const labels = getLabels(obj);
      if (!labels) {
        return;
      }

      if (!checked) {
        if (STORAGE_ROLE_LABEL_KEY in labels) {
          delete labels[STORAGE_ROLE_LABEL_KEY];
        }
      } else {
        labels[STORAGE_ROLE_LABEL_KEY] = STORAGE_ROLE_LABEL_VALUE;
      }

      k8sPatch({
        data: [
          {
            op: "replace",
            path: "/metadata/labels",
            value: labels,
          },
        ],
        model: NodeModel,
        resource: obj,
      });
    },
    [obj]
  );

  return (
    <>
      <TableData
        activeColumnIDs={activeColumnIDs}
        id="checkbox"
        className="pf-v5-c-table__check"
      >
        <Checkbox
          id={`node-${uid}`}
          isChecked={selected}
          onChange={handleNodeSelectionChange}
        />
      </TableData>
      <TableData activeColumnIDs={activeColumnIDs} id="name">
        {displayTextFor.name}
      </TableData>
      <TableData activeColumnIDs={activeColumnIDs} id="role">
        {displayTextFor.role}
      </TableData>
      <TableData activeColumnIDs={activeColumnIDs} id="cpu">
        {displayTextFor.cpu}
      </TableData>
      <TableData activeColumnIDs={activeColumnIDs} id="memory">
        {displayTextFor.memory}
      </TableData>
      <TableData activeColumnIDs={activeColumnIDs} id="shared-disks">
        {displayTextFor.sharedDisks}
      </TableData>
    </>
  );
};
