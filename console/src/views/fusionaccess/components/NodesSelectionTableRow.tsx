import type { IoK8sApiCoreV1Node } from "@/models/kubernetes/types-1.30";
import { getCpu, getMemory, getRole } from "@/models/kubernetes/selectors/IoK8sApiCoreV1Node";
import {
  type RowProps,
  TableData,
} from "@openshift-console/dynamic-plugin-sdk";
import { Checkbox } from "@patternfly/react-core";

const VALUE_NOT_AVAILABLE = "-";

type NodesSelectionTableRowProps = RowProps<IoK8sApiCoreV1Node>;
export const NodesSelectionTableRow: React.FC<NodesSelectionTableRowProps> = (
  props
) => {
  const { obj, activeColumnIDs } = props;

  const uid = obj.metadata?.uid;
  const name = obj.metadata?.name;
  const [role] = getRole(obj);
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

  return (
    <>
      <TableData activeColumnIDs={activeColumnIDs} id="checkbox" className="pf-v5-c-table__check">
        <Checkbox id={`node-${uid}`} isChecked={false} onChange={() => {}} />
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
